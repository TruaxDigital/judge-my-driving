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
// Each design_id maps to its publicly hosted SVG URL.
// All SVGs are 720x216 viewBox, stretched to 1200x400 output.
const GITHUB_BASE = 'https://github.com/TruaxDigital/judge-my-driving/raw/d29729a262739c008d997bd793d1f8f2d5f1d08d';

const TEMPLATES: Record<string, string | null> = {
  default:              null, // fallback SVG built in code
  company_vehicle:      `${GITHUB_BASE}/Company%20Vehicle.%20Got%20Feedback.svg`,
  decades_behind_wheel: `${GITHUB_BASE}/Decades%20Behind%20the%20Wheel.%20How%20Am%20I%20Doing.svg`,
  experienced_driver:   `${GITHUB_BASE}/Experienced%20Driver.%20Got%20Feedback.svg`,
  go_easy_new:          `${GITHUB_BASE}/How's%20My%20Driving.%20Go%20Easy,%20I'm%20New.svg`,
  tell_my_boss:         `${GITHUB_BASE}/How's%20My%20Driving.%20Tell%20My%20Boss.svg`,
  tell_my_dad:          `${GITHUB_BASE}/how's%20My%20Driving.%20Tell%20My%20Dad.svg`,
  tell_my_kids:         `${GITHUB_BASE}/How's%20My%20Driving.%20Tell%20My%20Kids.svg`,
  tell_my_mom:          `${GITHUB_BASE}/How's%20My%20Driving.%20Tell%20My%20Mom.svg`,
  our_driver_feedback:  `${GITHUB_BASE}/How's%20Our%20Driver.%20Your%20Feedback%20Matters.svg`,
  keeping_roads_safe:   `${GITHUB_BASE}/Keeping%20Roads%20Safe.%20Rate%20this%20Driver.svg`,
  new_driver:           `${GITHUB_BASE}/New%20Driver.%20Got%20Feedback.svg`,
  on_the_clock:         `${GITHUB_BASE}/On%20the%20Clock,%20On%20the%20Record.svg`,
  rate_this_driver:     `${GITHUB_BASE}/Rate%20this%20Driver.svg`,
  still_got_it:         `${GITHUB_BASE}/Still%20Got%20It,%20Rate%20My%20Driving.svg`,
  student_driver:       `${GITHUB_BASE}/Student%20Driver.%20Score%20My%20Skills.svg`,
};

// ─── QR placement config ─────────────────────────────────────────────────────
// Coordinates are in the 1200x400 OUTPUT canvas (pixels).
// Calculated from each SVG's white rect position in its 720x216 viewBox,
// scaled by x_factor=1.6667 (1200/720) and y_factor=1.8519 (400/216).
// QR code is kept square (300x300) with ~15px padding inside the white zone.
//
// 12 designs share the standard position: white rect at viewBox x=513, y=9
//   -> output x=855, y=17, white area=330x367
//   -> QR centered: x=870, y=50, size=300
//
// 2 outliers have shifted x positions:
//   - experienced_driver: viewBox x=411.1 -> output x=685
//   - keeping_roads_safe: viewBox x=390.8 -> output x=651

interface QRPlacement {
  x: number;
  y: number;
  size: number;
}

const STANDARD_QR: QRPlacement = { x: 870, y: 50, size: 300 };

const QR_PLACEMENT_CONFIG: Record<string, QRPlacement> = {
  company_vehicle:      STANDARD_QR,
  decades_behind_wheel: STANDARD_QR,
  experienced_driver:   { x: 700, y: 50, size: 300 },
  go_easy_new:          STANDARD_QR,
  tell_my_boss:         STANDARD_QR,
  tell_my_dad:          STANDARD_QR,
  tell_my_kids:         STANDARD_QR,
  tell_my_mom:          STANDARD_QR,
  our_driver_feedback:  STANDARD_QR,
  keeping_roads_safe:   { x: 666, y: 50, size: 300 },
  new_driver:           STANDARD_QR,
  on_the_clock:         STANDARD_QR,
  rate_this_driver:     STANDARD_QR,
  still_got_it:         STANDARD_QR,
  student_driver:       STANDARD_QR,
};

// Fallback QR placement (used for default/unknown designs)
const FALLBACK_QR: QRPlacement = { x: 30, y: 30, size: 340 };

// Output dimensions (px). 1200x400 = 3:1 banner ratio.
const W = 1200;
const H = 400;

// ─── Build the composite SVG ─────────────────────────────────────────────────

async function buildSVG(
  qrDataUrl: string,
  templateSvgContent: string | null,
  uniqueCode: string,
  designId: string
) {
  const qrBase64 = qrDataUrl;

  let backgroundLayer: string;
  let qrLayer: string;

  if (templateSvgContent) {
    // Template design: embed SVG as background image
    const encoded = encodeURIComponent(templateSvgContent);
    backgroundLayer = `<image x="0" y="0" width="${W}" height="${H}" href="data:image/svg+xml,${encoded}" />`;

    // Look up QR placement for this design
    const placement = QR_PLACEMENT_CONFIG[designId] || FALLBACK_QR;
    const { x, y, size } = placement;

    // Template already provides white background rect, so skip the extra white box.
    // Just overlay the QR code at the mapped position.
    qrLayer = `
  <!-- QR code PNG (positioned per design config) -->
  <image x="${x}" y="${y}" width="${size}" height="${size}" href="${qrBase64}"/>`;

  } else {
    // Fallback design (no template): use built-in layout with white box
    const { x, y, size } = FALLBACK_QR;

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

    qrLayer = `
  <!-- White rounded box behind QR -->
  <rect x="${x - 12}" y="${y - 12}" width="${size + 24}" height="${size + 24}"
        rx="16" ry="16" fill="#ffffff"/>
  <!-- QR code PNG -->
  <image x="${x}" y="${y}" width="${size}" height="${size}" href="${qrBase64}"/>
  <!-- JMD label beneath QR -->
  <text x="${x + size / 2}" y="${y + size + 36}"
        font-family="Arial Black, sans-serif" font-weight="900" font-size="22"
        fill="#000000" text-anchor="middle">JMD</text>
  <text x="${x + size / 2}" y="${y + size + 60}"
        font-family="Arial, sans-serif" font-size="18"
        fill="#000000" text-anchor="middle">JudgeMyDriving.com</text>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${backgroundLayer}
  ${qrLayer}
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

    const designId = sticker.design_id || 'default';
    const qrUrl = `https://app.judgemydriving.com/scan/${sticker.unique_code}`;
    const templateUrl = TEMPLATES[designId] || null;

    console.log(`Composing sticker: code=${sticker.unique_code}, design=${designId}`);

    // 1. Get QR placement for this design (determines QR render size)
    const placement = QR_PLACEMENT_CONFIG[designId] || FALLBACK_QR;

    // 2. Generate QR code as data URL (PNG)
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: 'H',
      width: placement.size,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });

    // 3. Optionally fetch external template SVG content
    let templateSvgContent: string | null = null;
    if (templateUrl) {
      try {
        const res = await fetch(templateUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        templateSvgContent = await res.text();
      } catch (e: any) {
        console.warn('Could not fetch template, using fallback:', e.message);
      }
    }

    // 4. Build composite SVG string
    const svgString = await buildSVG(qrDataUrl, templateSvgContent, sticker.unique_code, designId);

    // 5. Rasterize SVG -> PNG using resvg-wasm
    await ensureWasm();
    const resvg = new Resvg(svgString, {
      fitTo: { mode: 'width', value: W },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // 6. Upload PNG to Base44 file storage
    // Convert Uint8Array to base64 data URL for UploadFile
    const base64 = btoa(String.fromCharCode(...pngBuffer));
    const dataUrl = `data:image/png;base64,${base64}`;
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file: dataUrl });
    const fileUrl = uploadResult.file_url;

    console.log(`Composed image uploaded: ${fileUrl}`);

    // 7. Persist the URL back to the sticker record
    if (user.role === 'admin') {
      await base44.asServiceRole.entities.Sticker.update(sticker_id, { composed_image_url: fileUrl });
    } else {
      await base44.entities.Sticker.update(sticker_id, { composed_image_url: fileUrl });
    }

    return Response.json({ success: true, file_url: fileUrl });

  } catch (err: any) {
    console.error('composeStickerImage error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});