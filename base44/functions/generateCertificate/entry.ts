import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Generates a branded PDF certificate using htmlcsstoimage.com API
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { driver_name, avg_rating, current_month } = body;

    if (!driver_name || !avg_rating || !current_month) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userId = Deno.env.get('HCTI_API_USER_ID');
    const apiKey = Deno.env.get('HCTI_API_KEY');

    if (!userId || !apiKey) {
      console.error('[generateCertificate] Missing HCTI credentials');
      return Response.json({ error: 'HCTI credentials not configured' }, { status: 500 });
    }

    // Build certificate HTML
    const html = `
      <div style="width:1200px;height:900px;background:linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);display:flex;align-items:center;justify-content:center;font-family:'Georgia',serif;padding:40px;box-sizing:border-box">
        <div style="width:100%;height:100%;background:white;border:8px solid #d4a017;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px;box-sizing:border-box;box-shadow:0 20px 60px rgba(0,0,0,0.15)">
          
          {/* Header */}
          <div style="text-align:center;margin-bottom:40px">
            <div style="font-size:48px;margin-bottom:10px">🏆</div>
            <div style="font-size:32px;font-weight:bold;color:#2c3e50;letter-spacing:2px">CERTIFICATE</div>
            <div style="font-size:24px;color:#d4a017;margin-top:5px;letter-spacing:1px">OF SAFE DRIVING</div>
          </div>

          {/* Divider */}
          <div style="width:150px;height:2px;background:#d4a017;margin-bottom:40px"></div>

          {/* Body */}
          <div style="text-align:center;flex:1;display:flex;flex-direction:column;justify-content:center;width:100%">
            <div style="font-size:18px;color:#555;margin-bottom:30px;font-style:italic">This Certificate is Proudly Awarded To</div>
            
            <div style="font-size:56px;font-weight:bold;color:#2c3e50;margin-bottom:20px;text-transform:uppercase;letter-spacing:1px">${driver_name}</div>
            
            <div style="font-size:16px;color:#666;line-height:1.8;max-width:600px;margin:0 auto;margin-bottom:30px">
              For demonstrating outstanding safe driving performance and maintaining an exemplary record of community feedback and safety standards.
            </div>

            <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin:30px 0">
              <span style="font-size:32px">⭐</span>
              <span style="font-size:42px;font-weight:bold;color:#d4a017">${avg_rating}</span>
              <span style="font-size:18px;color:#666">Average Rating</span>
            </div>

            <div style="border-top:2px solid #d4a017;border-bottom:2px solid #d4a017;padding:20px;margin:30px 0;width:100%">
              <div style="font-size:16px;color:#666">Awarded in Recognition of Safe Driving Excellence</div>
              <div style="font-size:18px;color:#2c3e50;font-weight:bold;margin-top:10px">${current_month}</div>
            </div>
          </div>

          {/* Footer */}
          <div style="text-align:center;margin-top:40px;width:100%">
            <div style="font-size:12px;color:#999;letter-spacing:1px">
              Presented by <strong style="color:#2c3e50;font-size:14px">JUDGE MY DRIVING</strong>
            </div>
            <div style="font-size:10px;color:#aaa;margin-top:8px;letter-spacing:0.5px">
              Community-Driven Driver Safety & Accountability Platform
            </div>
          </div>
        </div>
      </div>
    `;

    // Call HCTI API
    const auth = btoa(`${userId}:${apiKey}`);
    const hctiRes = await fetch('https://hcti.io/v1/image', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        html,
        css: '* { margin: 0; padding: 0; }',
        viewport_width: 1200,
        viewport_height: 900
      })
    });

    if (!hctiRes.ok) {
      const error = await hctiRes.text();
      console.error('[generateCertificate] HCTI API error:', error);
      return Response.json({ error: 'Failed to generate certificate' }, { status: 500 });
    }

    const hctiData = await hctiRes.json();
    const imageUrl = hctiData.url;

    console.log(`[generateCertificate] Generated certificate: ${imageUrl}`);

    return Response.json({ success: true, image_url: imageUrl });
  } catch (error) {
    console.error('[generateCertificate] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});