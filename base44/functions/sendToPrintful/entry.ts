import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Printful sticker product variant ID for 4x4" kiss-cut sticker
// Printful product 358 = Kiss-Cut Stickers, variant 9706 = 4"x4"
const STICKER_VARIANT_ID = 9706;
const PRINTFUL_API = 'https://api.printful.com';

async function printfulRequest(method, path, body) {
  const res = await fetch(`${PRINTFUL_API}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${Deno.env.get('PRINTFUL_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (data.code && data.code >= 400) {
    throw new Error(`Printful error: ${data.error?.message || JSON.stringify(data)}`);
  }
  return data.result;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { sticker_id, shipping_address } = await req.json();

    if (!sticker_id) return Response.json({ error: 'sticker_id required' }, { status: 400 });
    if (!shipping_address) return Response.json({ error: 'shipping_address required' }, { status: 400 });

    // Load sticker
    const stickers = await base44.entities.Sticker.filter({ id: sticker_id, owner_id: user.id });
    if (stickers.length === 0) return Response.json({ error: 'Sticker not found' }, { status: 404 });
    const sticker = stickers[0];

    // Step 1: Ensure we have a composed sticker image (QR + branded template)
    let composedImageUrl = sticker.composed_image_url;
    if (!composedImageUrl) {
      console.log('No composed image found, generating now...');
      const composeRes = await base44.functions.invoke('composeStickerImage', { sticker_id });
      if (!composeRes?.data?.success) {
        throw new Error('Failed to compose sticker image: ' + (composeRes?.data?.error || 'unknown error'));
      }
      composedImageUrl = composeRes.data.file_url;
      console.log('Composed image generated:', composedImageUrl);
    }

    // Step 2: Upload composed image to Printful file library
    const fileResult = await printfulRequest('POST', '/files', {
      type: 'default',
      url: composedImageUrl,
      filename: `jmd-sticker-${sticker.unique_code}.png`,
    });

    console.log('File uploaded to Printful:', fileResult.id);

    // Step 2: Create a draft order
    const order = await printfulRequest('POST', '/orders', {
      recipient: {
        name: shipping_address.name,
        address1: shipping_address.address1,
        address2: shipping_address.address2 || '',
        city: shipping_address.city,
        state_code: shipping_address.state_code,
        country_code: shipping_address.country_code || 'US',
        zip: shipping_address.zip,
        email: user.email,
      },
      items: [
        {
          variant_id: STICKER_VARIANT_ID,
          quantity: 1,
          options: [
            { id: 'stitch_color', value: 'white' },
          ],
          files: [
            {
              type: 'default',
              id: fileResult.id,
            },
          ],
        },
      ],
      retail_costs: {
        currency: 'USD',
      },
    });

    console.log('Printful order created:', order.id);

    // Step 3: Confirm the order for fulfillment
    await printfulRequest('POST', `/orders/${order.id}/confirm`);
    console.log('Printful order confirmed:', order.id);

    // Step 4: Update sticker with printful order ID
    await base44.entities.Sticker.update(sticker_id, {
      printful_order_id: String(order.id),
      status: 'pending',
    });

    return Response.json({
      success: true,
      printful_order_id: order.id,
      tracking_url: order.shipments?.[0]?.tracking_url || null,
    });

  } catch (err) {
    console.error('sendToPrintful error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});