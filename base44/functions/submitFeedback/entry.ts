import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { sticker_id, sticker_code, rating, comment, safety_flag, latitude, longitude, location_name, is_preview } = await req.json();

    if (!sticker_id || !rating) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If this is a preview/test submission, don't save anything or send emails
    if (is_preview) {
      return Response.json({ success: true, preview: true });
    }

    // IP-based cooldown check (1 hour per sticker per IP)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('cf-connecting-ip') || 'unknown';
    const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
    const existing = await base44.asServiceRole.entities.FeedbackCooldown.filter({ ip_address: ip, sticker_id });
    if (existing.length > 0) {
      const lastSubmission = new Date(existing[0].last_submission).getTime();
      const elapsed = Date.now() - lastSubmission;
      if (elapsed < COOLDOWN_MS) {
        const minutesLeft = Math.ceil((COOLDOWN_MS - elapsed) / 60000);
        return Response.json({ error: `You already submitted feedback for this vehicle recently. Please wait ${minutesLeft} more minute${minutesLeft !== 1 ? 's' : ''} before submitting again.` }, { status: 429 });
      }
      // Update existing record
      await base44.asServiceRole.entities.FeedbackCooldown.update(existing[0].id, { last_submission: new Date().toISOString() });
    } else {
      await base44.asServiceRole.entities.FeedbackCooldown.create({ ip_address: ip, sticker_id, last_submission: new Date().toISOString() });
    }

    // AI moderation: check comment for abusive/bullying language
    let is_flagged = false;
    let moderation_reason = undefined;
    let is_blocked = false; // severe content that should be rejected outright
    if (comment && comment.trim().length > 0) {
      try {
        const modResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a content safety moderator for a driving feedback platform used by teen drivers, senior drivers, and fleet employees. Your job is to protect potentially vulnerable users (especially teens) from bullying, harassment, and hate speech.

Analyze the following feedback comment. Return a JSON object with:
- "severity": one of "ok", "flag", or "block"
  - "ok"    = legitimate driving feedback (even if harsh, e.g. "terrible driver", "almost hit me", "driving too fast")
  - "flag"  = borderline or mildly inappropriate — save but mark for admin review (e.g. mild profanity, vague insults unrelated to driving)
  - "block" = must be rejected entirely — do NOT save (e.g. personal attacks, bullying, threats, hate speech based on age/race/gender, sexual comments, doxxing, slurs)
- "reason": a short explanation if severity is "flag" or "block", otherwise empty string

Be STRICT about protecting teen and senior drivers from bullying. A comment that mocks someone's age, appearance, gender, or identity — rather than their driving — should be "block". A comment calling out genuinely dangerous driving behavior is "ok" even if strongly worded.

Comment: "${comment.replace(/"/g, '\\"')}"`,
          response_json_schema: {
            type: 'object',
            properties: {
              severity: { type: 'string' },
              reason: { type: 'string' }
            }
          }
        });

        const severity = modResult?.severity;
        if (severity === 'block') {
          is_blocked = true;
          moderation_reason = modResult.reason || 'Blocked by AI moderation';
          console.log(`[submitFeedback] Comment BLOCKED: "${comment}" — reason: ${moderation_reason}`);
          return Response.json({
            error: 'Your comment was not submitted because it appears to contain harmful, bullying, or hateful language. Please keep feedback focused on driving behavior.',
            blocked: true
          }, { status: 422 });
        } else if (severity === 'flag') {
          is_flagged = true;
          moderation_reason = modResult.reason || 'Flagged by AI moderation';
          console.log(`[submitFeedback] Comment flagged: "${comment}" — reason: ${moderation_reason}`);
        }
      } catch (modErr) {
        console.warn('[submitFeedback] Moderation check failed, allowing comment through:', modErr.message);
      }
    }

    // Create feedback using service role (public action - no auth needed)
    const feedback = await base44.asServiceRole.entities.Feedback.create({
      sticker_id,
      sticker_code,
      rating,
      comment: comment || undefined,
      safety_flag: safety_flag || false,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      location_name: location_name || undefined,
      is_flagged,
      moderation_reason,
    });

    // Trigger geolocation reverse geocoding (async, non-blocking)
    if (latitude !== undefined && longitude !== undefined) {
      base44.asServiceRole.functions.invoke('geocodeScanLocation', {
        feedback_id: feedback.id,
        latitude,
        longitude
      }).catch(err => console.warn('[submitFeedback] geocodeScanLocation failed:', err.message));
    }

    // Update sticker stats
    const allFeedback = await base44.asServiceRole.entities.Feedback.filter({ sticker_id });
    const totalCount = allFeedback.length;
    const avgRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / totalCount;
    await base44.asServiceRole.entities.Sticker.update(sticker_id, {
      feedback_count: totalCount,
      average_rating: Math.round(avgRating * 10) / 10,
    });

    // Fetch sticker to get owner email for notification
    const stickers = await base44.asServiceRole.entities.Sticker.filter({ id: sticker_id });
    const sticker = stickers[0];

    if (sticker?.owner_email && !is_flagged) {
      const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: sticker.owner_email,
        subject: `New driving feedback for ${sticker.driver_label || 'your vehicle'}`,
        body: `
          <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: #18181b; padding: 20px 24px; border-radius: 10px 10px 0 0; text-align: center;">
            <img src="https://raw.githubusercontent.com/TruaxDigital/judge-my-driving/refs/heads/main/judge-my-driving-horizontal-logo-dark.svg" alt="Judge My Driving" style="height:50px;width:auto;" />
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 10px 10px;">
          <h2 style="margin-top:0;color:#111;">New Feedback Received</h2>
          <p style="font-size: 24px;">${stars}</p>
            <p><strong>Rating:</strong> ${rating}/5</p>
            ${comment ? `<p><strong>Comment:</strong> ${comment}</p>` : ''}
            ${location_name ? `<p><strong>Location:</strong> ${location_name}</p>` : ''}
            <p><strong>Time:</strong> ${now}</p>
            ${safety_flag ? '<p style="color: red;"><strong>⚠️ Safety concern reported</strong></p>' : ''}
            </div>
          </div>
        `,
      });
    }

    return Response.json({ success: true, feedback_id: feedback.id });
  } catch (error) {
    console.error('submitFeedback error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});