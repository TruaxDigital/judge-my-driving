import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import QRCode from 'npm:qrcode@1.5.4';
import { Resvg, initWasm } from 'npm:@resvg/resvg-wasm@2.6.2';

// Load the WASM binary once
let wasmInitialized = false;
async function ensureWasm() {
  if (wasmInitialized) return;
  const wasmRes = await fetch(
    'https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm'
  );
  await initWasm(wasmRes);
  wasmInitialized = true;
}

// ─── Template registry ───────────────────────────────────────────────────────
// When you provide your SVG designs, host them publicly and add URLs here.
// design_id on the Sticker entity selects which template to use.
const TEMPLATES = {
  default: null,   // null = use built-in fallback SVG
  // mom:   'https://cdn.judgemydriving.com/designs/mom.svg',
  // fleet: 'https://cdn.judgemydriving.com/designs/fleet.svg',
};

// Output dimensions (px). 1200x400 = 3:1 banner ratio matching the JMD design.
const W = 1200;
const H = 400;
const QR_X = 30;
const QR_Y = 30;
const QR_SIZE = 340;

// ─── Build the composite SVG ─────────────────────────────────────────────────

async function buildSVG(qrDataUrl, templateSvgContent, uniqueCode) {
  // QR code as embedded base64 PNG image inside SVG
  const qrBase64 = qrDataUrl; // already a data: URL

  let backgroundLayer;

  if (templateSvgContent) {
    // Embed the template SVG as a foreignObject / image
    // We inline it as a nested <image> pointing to a data URL
    const encoded = encodeURIComponent(templateSvgContent);
    backgroundLayer = `<image x="0" y="0" width="${W}" height="${H}" href="data:image/svg+xml,${encoded}" />`;
  } else {
    // Built-in fallback design (mirrors the JMD screenshot style)
    backgroundLayer = `
      <!-- Dark background -->
      <rect width="${W}" height="${H}" fill="#2D2D2D"/>
      <!-- Yellow left accent -->
      <rect x="0" y="0" width="18" height="${H}" fill="#FACC15"/>
      <!-- "How's My Driving?" -->
      <text x="420" y="155" font-family="Arial Black, sans-serif" font-weight="900" font-size="90" fill="#FFFFFF">How&apos;s My Driving?</text>
      <!-- "Tell My Mom" in yellow -->
      <text x="420" y="265" font-family="Arial Black, sans-serif" font-weight="900" font-size="80" fill="#FACC15">Tell My Mom</text>
      <!-- 5 stars -->
      <text x="420" y="355" font-family="Arial, sans-serif" font-size="56" fill="#FACC15">&#9733;&#9733;&#9733;&#9733;&#9733;</text>
      <!-- Unique code watermark -->
      <text x="${W - 20}" y="${H - 16}" font-family="monospace" font-size="22" fill="rgba(255,255,255,0.25)" text-anchor="end">${uniqueCode}</text>
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${backgroundLayer}

  <!-- White rounded box behind QR -->
  <rect x="${QR_X - 12}" y="${QR_Y - 12}" width="${QR_SIZE + 24}" height="${QR_SIZE + 24}"
        rx="16" ry="16" fill="#ffffff"/>

  <!-- QR code PNG -->
  <image x="${QR_X}" y="${QR_Y}" width="${QR_SIZE}" height="${QR_SIZE}" href="${qrBase64}"/>

  <!-- JMD label beneath QR -->
  <text x="${QR_X + QR_SIZE / 2}" y="${QR_Y + QR_SIZE + 36}"
        font-family="Arial Black, sans-serif" font-weight="900" font-size="22"
        fill="#000000" text-anchor="middle">JMD</text>
  <text x="${QR_X + QR_SIZE / 2}" y="${QR_Y + QR_SIZE + 60}"
        font-family="Arial, sans-serif" font-size="18"
        fill="#000000" text-anchor="middle">JudgeMyDriving.com</text>
</svg>`;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { sticker_id } = await req.json();
    if (!sticker_id) return Response.json({ error: 'sticker_id required' }, { status: 400 });

    // Load the sticker (allow admin to compose any sticker)
    let stickers;
    if (user.role === 'admin') {
      stickers = await base44.asServiceRole.entities.Sticker.filter({ id: sticker_id });
    } else {
      stickers = await base44.entities.Sticker.filter({ id: sticker_id, owner_id: user.id });
    }
    if (stickers.length === 0) return Response.json({ error: 'Sticker not found' }, { status: 404 });
    const sticker = stickers[0];

    const qrUrl = `https://app.judgemydriving.com/scan/${sticker.unique_code}`;
    const templateUrl = TEMPLATES[sticker.design_id] || null;

    console.log(`Composing sticker for: ${sticker.unique_code}, design: ${sticker.design_id || 'default'}`);

    // 1. Generate QR code as data URL (PNG)
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: 'H',
      width: QR_SIZE,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });

    // 2. Optionally fetch external template SVG content
    let templateSvgContent = null;
    if (templateUrl) {
      try {
        const res = await fetch(templateUrl);
        templateSvgContent = await res.text();
      } catch (e) {
        console.warn('Could not fetch template, using fallback:', e.message);
      }
    }

    // 3. Build composite SVG string
    const svgString = await buildSVG(qrDataUrl, templateSvgContent, sticker.unique_code);

    // 4. Rasterize SVG → PNG using resvg-wasm
    await ensureWasm();
    const resvg = new Resvg(svgString, {
      fitTo: { mode: 'width', value: W },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // 5. Upload PNG to Base44 file storage
    const blob = new Blob([pngBuffer], { type: 'image/png' });
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file: blob });
    const fileUrl = uploadResult.file_url;

    console.log(`Composed image uploaded: ${fileUrl}`);

    // 6. Persist the URL back to the sticker record
    if (user.role === 'admin') {
      await base44.asServiceRole.entities.Sticker.update(sticker_id, { composed_image_url: fileUrl });
    } else {
      await base44.entities.Sticker.update(sticker_id, { composed_image_url: fileUrl });
    }

    return Response.json({ success: true, file_url: fileUrl });

  } catch (err) {
    console.error('composeStickerImage error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});