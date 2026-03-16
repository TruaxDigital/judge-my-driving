import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { createCanvas, loadImage } from 'npm:@napi-rs/canvas@0.1.44';
import QRCode from 'npm:qrcode@1.5.4';

// ─── Template registry ───────────────────────────────────────────────────────
// When you have your real SVG designs, host them as public URLs and add them here.
// design_id on the Sticker entity selects which template to use.
// Leave PLACEHOLDER_SVG_URL for now — swap in real URLs when you're ready.
const TEMPLATES = {
  default: 'PLACEHOLDER_SVG_URL',   // replace with your hosted SVG URL
  // mom:     'https://...your-mom-design.svg',
  // fleet:   'https://...your-fleet-design.svg',
};

// Canvas dimensions (pixels) — match your Printful product print area
// Printful Kiss-Cut 4"x4" at 150dpi → 600x600px (safe); use 1200x1200 for HQ
const CANVAS_W = 1200;
const CANVAS_H = 400;   // 3:1 banner ratio (matches the design in your screenshot)

// QR code placement within the canvas (pixels)
const QR_X = 30;
const QR_Y = 30;
const QR_SIZE = 340;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function generateQRBuffer(url) {
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    width: QR_SIZE,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' },
  });
  // Strip the data:image/png;base64, prefix and return raw buffer
  const base64 = dataUrl.split(',')[1];
  return Buffer.from(base64, 'base64');
}

async function compositeImage(qrBuffer, templateUrl, uniqueCode) {
  const canvas = createCanvas(CANVAS_W, CANVAS_H);
  const ctx = canvas.getContext('2d');

  // ── Background (dark grey, matches JMD branding) ──────────────────────────
  ctx.fillStyle = '#2D2D2D';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // ── If a real template SVG URL is provided, draw it as background ─────────
  if (templateUrl && templateUrl !== 'PLACEHOLDER_SVG_URL') {
    try {
      const templateImg = await loadImage(templateUrl);
      ctx.drawImage(templateImg, 0, 0, CANVAS_W, CANVAS_H);
    } catch (e) {
      console.warn('Could not load template image, using fallback:', e.message);
      drawFallbackTemplate(ctx, uniqueCode);
    }
  } else {
    drawFallbackTemplate(ctx, uniqueCode);
  }

  // ── Overlay the QR code ───────────────────────────────────────────────────
  const qrImg = await loadImage(qrBuffer);

  // White rounded background behind QR
  const pad = 12;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, QR_X - pad, QR_Y - pad, QR_SIZE + pad * 2, QR_SIZE + pad * 2, 16);
  ctx.fill();

  ctx.drawImage(qrImg, QR_X, QR_Y, QR_SIZE, QR_SIZE);

  // ── Small JMD label under QR ──────────────────────────────────────────────
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('JMD', QR_X + QR_SIZE / 2, QR_Y + QR_SIZE + pad + 28);
  ctx.font = '18px sans-serif';
  ctx.fillText('JudgeMyDriving.com', QR_X + QR_SIZE / 2, QR_Y + QR_SIZE + pad + 52);

  return canvas.toBuffer('image/png');
}

function drawFallbackTemplate(ctx, uniqueCode) {
  // Yellow accent bar on left
  ctx.fillStyle = '#FACC15';
  ctx.fillRect(0, 0, 18, CANVAS_H);

  // "How's My Driving?" text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 90px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText("How's My Driving?", 420, 160);

  // "Tell My" in white, "Mom" in yellow
  ctx.font = 'bold 80px sans-serif';
  ctx.fillStyle = '#FACC15';
  ctx.fillText('Tell My Mom', 420, 270);

  // 5 stars
  ctx.font = '56px sans-serif';
  ctx.fillStyle = '#FACC15';
  ctx.fillText('★★★★★', 420, 360);

  // Unique code watermark (small, bottom right)
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '22px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(uniqueCode, CANVAS_W - 20, CANVAS_H - 16);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { sticker_id } = await req.json();
    if (!sticker_id) return Response.json({ error: 'sticker_id required' }, { status: 400 });

    // Load the sticker
    const stickers = await base44.entities.Sticker.filter({ id: sticker_id, owner_id: user.id });
    if (stickers.length === 0) return Response.json({ error: 'Sticker not found' }, { status: 404 });
    const sticker = stickers[0];

    const qrUrl = `https://app.judgemydriving.com/scan/${sticker.unique_code}`;
    const templateUrl = TEMPLATES[sticker.design_id] || TEMPLATES.default;

    console.log(`Composing sticker image for code: ${sticker.unique_code}, template: ${sticker.design_id || 'default'}`);

    // 1. Generate QR buffer
    const qrBuffer = await generateQRBuffer(qrUrl);

    // 2. Composite QR onto template
    const imageBuffer = await compositeImage(qrBuffer, templateUrl, sticker.unique_code);

    // 3. Upload to Base44 file storage
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file: blob });
    const fileUrl = uploadResult.file_url;

    console.log(`Composed image uploaded: ${fileUrl}`);

    // 4. Save the composed_image_url back to the sticker record
    await base44.entities.Sticker.update(sticker_id, { composed_image_url: fileUrl });

    return Response.json({ success: true, file_url: fileUrl });

  } catch (err) {
    console.error('composeStickerImage error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});