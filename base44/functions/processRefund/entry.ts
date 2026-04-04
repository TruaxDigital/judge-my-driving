import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const GOOGLE_REVIEW_URL = 'https://g.page/r/REPLACE_WITH_YOUR_GOOGLE_REVIEW_LINK/review';

const PLAN_PRICES = {
  individual: 49,
  family: 99,
  starter_fleet: 999,
  professional_fleet: 1999,
};

const STICKER_DEDUCTION = 19; // dollars

function calcRefundAmount(planTier, subscriptionStartDate, stickerCount) {
  const isFleet = planTier === 'starter_fleet' || planTier === 'professional_fleet';
  const planPrice = PLAN_PRICES[planTier] || 0;
  const now = new Date();
  const start = new Date(subscriptionStartDate || now);
  const daysSinceStart = Math.floor((now - start) / (1000 * 60 * 60 * 24));

  if (isFleet) {
    if (daysSinceStart <= 30) {
      return { amount: planPrice, type: 'full', eligible: true };
    } else if (daysSinceStart <= 90) {
      // Pro-rated: remaining days / 365 * price, minus sticker costs
      const remainingDays = Math.max(0, 365 - daysSinceStart);
      const prorated = Math.round((remainingDays / 365) * planPrice);
      const deduction = (stickerCount || 0) * STICKER_DEDUCTION;
      const amount = Math.max(0, prorated - deduction);
      return { amount, type: 'prorated', eligible: true, prorated, deduction };
    } else {
      return { amount: 0, type: 'none', eligible: false, reason: 'Past 90-day refund window for fleet plans.' };
    }
  } else {
    // Consumer plans: Individual / Family
    if (daysSinceStart <= 30) {
      return { amount: planPrice, type: 'full', eligible: true };
    } else if (daysSinceStart <= 365) {
      const deduction = (stickerCount || 0) * STICKER_DEDUCTION;
      const amount = Math.max(0, planPrice - deduction);
      return { amount, type: 'partial', eligible: true, deduction };
    } else {
      return { amount: 0, type: 'none', eligible: false, reason: 'Past 365-day refund window.' };
    }
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { target_user_id, sale_id, refund_amount_cents, sticker_count, dry_run } = await req.json();

    if (!target_user_id || !sale_id) {
      return Response.json({ error: 'target_user_id and sale_id are required' }, { status: 400 });
    }

    // Load sale
    const sales = await base44.asServiceRole.entities.Sale.filter({ id: sale_id });
    if (sales.length === 0) return Response.json({ error: 'Sale not found' }, { status: 404 });
    const sale = sales[0];

    // Load target user
    const targetUsers = await base44.asServiceRole.entities.User.filter({ id: target_user_id });
    const targetUser = targetUsers[0];

    // Calc refund info
    const refundInfo = calcRefundAmount(sale.plan_tier, sale.subscription_start_date, sticker_count || 0);

    if (dry_run) {
      return Response.json({ success: true, refund_info: refundInfo });
    }

    if (!refundInfo.eligible) {
      return Response.json({ error: refundInfo.reason || 'Not eligible for refund', refund_info: refundInfo }, { status: 400 });
    }

    const amountCents = refund_amount_cents ?? Math.round(refundInfo.amount * 100);

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // 1. Issue Stripe refund (if there's a subscription / charge to refund)
    let stripeRefundId = null;
    if (sale.stripe_subscription_id && amountCents > 0) {
      try {
        // Cancel the subscription
        await stripe.subscriptions.cancel(sale.stripe_subscription_id);
        console.log(`[processRefund] Cancelled subscription ${sale.stripe_subscription_id}`);

        // Find most recent invoice/charge to refund
        const invoices = await stripe.invoices.list({
          subscription: sale.stripe_subscription_id,
          limit: 5,
        });

        const paidInvoice = invoices.data.find(inv => inv.status === 'paid' && inv.charge);
        if (paidInvoice?.charge) {
          const refund = await stripe.refunds.create({
            charge: paidInvoice.charge,
            amount: amountCents,
          });
          stripeRefundId = refund.id;
          console.log(`[processRefund] Stripe refund created: ${refund.id} for $${amountCents / 100}`);
        }
      } catch (stripeErr) {
        console.error('[processRefund] Stripe error:', stripeErr.message);
        return Response.json({ error: `Stripe error: ${stripeErr.message}` }, { status: 500 });
      }
    }

    // 2. Deactivate all stickers for this user
    const stickers = await base44.asServiceRole.entities.Sticker.filter({ owner_id: target_user_id });
    let deactivatedCount = 0;
    for (const s of stickers) {
      if (s.status !== 'deactivated') {
        await base44.asServiceRole.entities.Sticker.update(s.id, { status: 'deactivated' });
        deactivatedCount++;
      }
    }
    console.log(`[processRefund] Deactivated ${deactivatedCount} stickers for user ${target_user_id}`);

    // 3. Update Sale record
    await base44.asServiceRole.entities.Sale.update(sale_id, {
      status: 'canceled',
      notes: `Refunded $${(amountCents / 100).toFixed(2)} on ${new Date().toISOString().slice(0, 10)}. Type: ${refundInfo.type}. ${sale.notes || ''}`.trim(),
    });

    // 4. Update User record
    await base44.asServiceRole.entities.User.update(target_user_id, {
      subscription_status: 'canceled',
    });

    // 5. Tag in HubSpot as "Churned - Refunded"
    if (sale.hubspot_contact_id) {
      try {
        const { accessToken } = await base44.asServiceRole.connectors.getConnection('hubspot');
        await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${sale.hubspot_contact_id}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            properties: {
              lifecyclestage: 'other',
              hs_lead_status: 'UNQUALIFIED',
              jmd_churn_reason: 'Refunded',
            },
          }),
        });
        // Also update the deal stage
        if (sale.hubspot_deal_id) {
          await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${sale.hubspot_deal_id}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ properties: { dealstage: 'closedlost' } }),
          });
        }
        console.log(`[processRefund] HubSpot updated for contact ${sale.hubspot_contact_id}`);
      } catch (hsErr) {
        console.error('[processRefund] HubSpot update failed (non-blocking):', hsErr.message);
      }
    }

    // 6. Send "You're all set" email via Resend
    const firstName = (targetUser?.full_name || sale.full_name || 'there').split(' ')[0];
    const refundAmountDisplay = `$${(amountCents / 100).toFixed(2)}`;

    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Judge My Driving <hello@judgemydriving.com>',
          to: targetUser?.email || sale.email,
          subject: "You're all set",
          html: `
            <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
              <img src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-white.svg" alt="Judge My Driving" style="height: 48px; width: auto; margin-bottom: 32px;" />
              <p style="font-size: 16px; line-height: 1.6;">Hey ${firstName},</p>
              <p style="font-size: 16px; line-height: 1.6;">Your refund of <strong>${refundAmountDisplay}</strong> has been processed. You should see it back on your card within 5–7 business days.</p>
              <p style="font-size: 16px; line-height: 1.6;">Sorry JMD wasn't the right fit. If you had a good experience with our support team, a quick Google review would mean a lot to us as a small business.</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${GOOGLE_REVIEW_URL}" style="background: #f5cc00; color: #1a1a1a; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 28px; border-radius: 10px; display: inline-block;">
                  ⭐ Leave a Google Review
                </a>
              </div>
              <p style="font-size: 15px; line-height: 1.6; color: #666;">No hard feelings either way. Thanks for giving us a shot.</p>
              <p style="font-size: 15px; color: #666;">— The JMD Team</p>
            </div>
          `,
        }),
      });
      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error('[processRefund] Email send failed:', errText);
      } else {
        console.log(`[processRefund] Refund email sent to ${targetUser?.email || sale.email}`);
      }
    } catch (emailErr) {
      console.error('[processRefund] Email error (non-blocking):', emailErr.message);
    }

    return Response.json({
      success: true,
      refund_info: refundInfo,
      stripe_refund_id: stripeRefundId,
      stickers_deactivated: deactivatedCount,
      amount_refunded: amountCents / 100,
    });
  } catch (error) {
    console.error('[processRefund] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});