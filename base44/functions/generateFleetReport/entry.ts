import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { jsPDF } from 'npm:jspdf@4.0.0';

const GOLD = '#D4A017';
const BLACK = '#0F0F0F';
const DARK_GRAY = '#2A2A2A';
const LIGHT_GRAY = '#F5F5F5';
const MID_GRAY = '#888888';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function setColor(doc, hex) {
  const [r, g, b] = hexToRgb(hex);
  doc.setTextColor(r, g, b);
}

function setFill(doc, hex) {
  const [r, g, b] = hexToRgb(hex);
  doc.setFillColor(r, g, b);
}

function setDraw(doc, hex) {
  const [r, g, b] = hexToRgb(hex);
  doc.setDrawColor(r, g, b);
}

function drawHeader(doc, periodLabel) {
  // Black header bar
  setFill(doc, BLACK);
  doc.rect(0, 0, 210, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setColor(doc, '#FFFFFF');
  doc.text('JUDGE MY DRIVING', 10, 9);
  setColor(doc, GOLD);
  doc.setFont('helvetica', 'bold');
  doc.text('FLEET SAFETY REPORT', 210 - 10, 6, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(periodLabel, 210 - 10, 11, { align: 'right' });
}

function drawFooter(doc, companyName, accountId, pageNum) {
  const y = 285;
  setDraw(doc, GOLD);
  doc.setLineWidth(0.5);
  doc.line(10, y - 3, 200, y - 3);
  doc.setFontSize(7.5);
  setColor(doc, MID_GRAY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Confidential | ${companyName} | Account ${accountId}`, 10, y + 2);
  doc.text(`Page ${pageNum}`, 200, y + 2, { align: 'right' });
}

function sectionHeader(doc, title, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  setColor(doc, BLACK);
  doc.text(title, 10, y);
  setDraw(doc, GOLD);
  doc.setLineWidth(0.8);
  doc.line(10, y + 2, 200, y + 2);
  return y + 8;
}

function tableHeader(doc, columns, y, colWidths) {
  setFill(doc, DARK_GRAY);
  doc.rect(10, y, 190, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setColor(doc, '#FFFFFF');
  let x = 12;
  columns.forEach((col, i) => {
    doc.text(col, x, y + 5);
    x += colWidths[i];
  });
  return y + 7;
}

function tableRow(doc, values, y, colWidths, rowIdx, colorFn) {
  if (rowIdx % 2 === 0) {
    setFill(doc, LIGHT_GRAY);
    doc.rect(10, y, 190, 7, 'F');
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  let x = 12;
  values.forEach((val, i) => {
    const color = colorFn ? colorFn(i, val) : null;
    if (color) {
      setColor(doc, color);
    } else {
      setColor(doc, BLACK);
    }
    const text = String(val ?? '—');
    doc.text(text.length > 30 ? text.slice(0, 28) + '…' : text, x, y + 5);
    x += colWidths[i];
  });
  return y + 7;
}

function getRatingColor(rating) {
  const r = parseFloat(rating);
  if (r >= 4.0) return '#16a34a';
  if (r >= 3.0) return '#d97706';
  return '#dc2626';
}

function getTrendColor(trend) {
  if (trend === 'Up') return '#16a34a';
  if (trend === 'Down') return '#dc2626';
  return MID_GRAY;
}

function getStatusColor(status) {
  if (status === 'Resolved') return '#16a34a';
  if (status === 'In Progress') return '#2563eb';
  return '#d97706';
}

function calcTrend(sticker, currentFb, priorFb) {
  const cur = currentFb.filter(f => f._stickerId === sticker.id);
  const pri = priorFb.filter(f => f._stickerId === sticker.id);
  const avg = arr => arr.length > 0 ? arr.reduce((s, f) => s + f.rating, 0) / arr.length : null;
  const curAvg = avg(cur);
  const priAvg = avg(pri);
  if (curAvg === null || priAvg === null) return 'Stable';
  if (curAvg - priAvg > 0.15) return 'Up';
  if (priAvg - curAvg > 0.15) return 'Down';
  return 'Stable';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { startDate, endDate, includeDriverNames = true, includeIncidentDetails = true, periodLabel } = body;

    const stickers = await base44.entities.Sticker.filter({ owner_id: user.id });
    if (stickers.length === 0) return Response.json({ error: 'No vehicles found' }, { status: 400 });

    // Fetch all feedback
    const allFb = [];
    for (const s of stickers) {
      const fb = await base44.entities.Feedback.filter({ sticker_id: s.id });
      allFb.push(...fb.map(f => ({ ...f, _stickerId: s.id })));
    }

    const inRange = (f) => f.created_date >= startDate && f.created_date <= endDate;

    // Calculate prior period duration
    const msStart = new Date(startDate).getTime();
    const msEnd = new Date(endDate).getTime();
    const duration = msEnd - msStart;
    const priorStart = new Date(msStart - duration).toISOString();
    const priorEnd = new Date(msStart).toISOString();
    const inPrior = (f) => f.created_date >= priorStart && f.created_date <= priorEnd;

    const currentFb = allFb.filter(inRange);
    const priorFb = allFb.filter(inPrior);

    const safetyFb = currentFb.filter(f => f.safety_flag);
    const priorSafetyFb = priorFb.filter(f => f.safety_flag);

    const avgRating = currentFb.length > 0
      ? (currentFb.reduce((s, f) => s + f.rating, 0) / currentFb.length).toFixed(1)
      : '0.0';
    const priorAvgRating = priorFb.length > 0
      ? (priorFb.reduce((s, f) => s + f.rating, 0) / priorFb.length).toFixed(1)
      : null;

    const ratingDelta = priorAvgRating
      ? (parseFloat(avgRating) - parseFloat(priorAvgRating)).toFixed(1)
      : null;

    const safetyDelta = priorSafetyFb.length > 0
      ? safetyFb.length - priorSafetyFb.length
      : null;

    // Corrective actions
    const actions = await base44.entities.CorrectiveAction.filter({ fleet_id: user.id });
    const periodActions = actions.filter(a => a.action_date >= startDate && a.action_date <= endDate);

    const cleanDrivers = stickers.filter(s => {
      return !safetyFb.some(f => f._stickerId === s.id);
    });

    // Driver rows
    const driverRows = stickers.map((s, idx) => {
      const fb = currentFb.filter(f => f._stickerId === s.id);
      const avg = fb.length > 0
        ? (fb.reduce((acc, f) => acc + f.rating, 0) / fb.length).toFixed(1)
        : '0.0';
      const incidents = fb.filter(f => f.safety_flag).length;
      const trend = calcTrend(s, currentFb, priorFb);
      const displayName = includeDriverNames
        ? (s.driver_label || s.driver_name || 'Unnamed Vehicle')
        : `Driver ${idx + 1}`;
      return {
        rank: idx + 1,
        name: displayName,
        vehicle: s.vehicle_id || s.unique_code,
        group: s.fleet_group || '',
        avg,
        scans: fb.length,
        incidents,
        trend,
        stickerId: s.id,
      };
    }).sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg)).map((r, i) => ({ ...r, rank: i + 1 }));

    // Safety incidents with corrective actions
    const incidentRows = safetyFb.map(f => {
      const sticker = stickers.find(s => s.id === f._stickerId);
      const action = actions.find(a => a.incident_id === f.id);
      const displayName = includeDriverNames
        ? (sticker?.driver_label || sticker?.driver_name || sticker?.vehicle_id || sticker?.unique_code || 'Unknown')
        : `Driver ${stickers.indexOf(sticker) + 1}`;
      return {
        date: f.created_date ? f.created_date.slice(0, 10) : '—',
        driver: displayName,
        vehicle: sticker?.vehicle_id || sticker?.unique_code || '—',
        description: f.comment || 'Safety concern reported',
        action: action ? `${action.action_type}: ${action.description.slice(0, 50)}` : 'No action logged',
        status: action ? action.status : 'Open',
      };
    });

    // Rating distribution
    const bandExcellent = driverRows.filter(d => parseFloat(d.avg) >= 4.0).length;
    const bandAcceptable = driverRows.filter(d => parseFloat(d.avg) >= 3.0 && parseFloat(d.avg) < 4.0).length;
    const bandElevated = driverRows.filter(d => parseFloat(d.avg) < 3.0).length;

    // Action type summary
    const actionTypeCounts = {};
    periodActions.forEach(a => {
      actionTypeCounts[a.action_type] = (actionTypeCounts[a.action_type] || 0) + 1;
    });
    const resolvedCount = periodActions.filter(a => a.status === 'Resolved').length;

    const companyName = user.company_name || user.full_name || 'Your Fleet';
    const accountId = `FLT-${user.id.slice(-5).toUpperCase()}`;
    const generatedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // --- Build PDF ---
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    // ── PAGE 1: Executive Summary ──────────────────────────────────────────
    drawHeader(doc, periodLabel);

    let y = 28;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    setColor(doc, BLACK);
    doc.text('Fleet Safety Report', 10, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    setColor(doc, GOLD);
    doc.text('Insurance Documentation Package', 10, y);
    y += 4;
    setDraw(doc, GOLD);
    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y);
    y += 8;

    // Info grid
    const infoLeft = [['Company', companyName], ['Fleet Size', `${stickers.length} vehicles`], ['Account ID', accountId]];
    const infoRight = [['Report Period', periodLabel], ['Generated', generatedDate], ['Platform', 'Judge My Driving v2.0']];
    doc.setFontSize(9);
    infoLeft.forEach(([label, val]) => {
      setColor(doc, MID_GRAY);
      doc.setFont('helvetica', 'normal');
      doc.text(label, 10, y);
      setColor(doc, BLACK);
      doc.setFont('helvetica', 'normal');
      doc.text(val, 45, y);
      y += 6;
    });
    const rightY = y - 18;
    infoRight.forEach(([label, val], i) => {
      setColor(doc, MID_GRAY);
      doc.setFont('helvetica', 'normal');
      doc.text(label, 110, rightY + i * 6);
      setColor(doc, BLACK);
      doc.text(val, 145, rightY + i * 6);
    });

    y += 4;
    y = sectionHeader(doc, 'Quarterly Performance Summary', y);
    y += 2;

    // KPI cards
    const kpis = [
      { label: 'Fleet Avg Rating', value: avgRating, sub: ratingDelta ? `${ratingDelta >= 0 ? '+' : ''}${ratingDelta} vs prior period` : 'No prior data', subColor: ratingDelta >= 0 ? '#16a34a' : '#dc2626' },
      { label: 'Total Feedback Scans', value: currentFb.length, sub: 'Community monitoring active', subColor: GOLD },
      { label: 'Safety Incidents', value: safetyFb.length, sub: safetyDelta !== null ? `${safetyDelta >= 0 ? '+' : ''}${safetyDelta} vs prior period` : 'No prior data', subColor: safetyDelta > 0 ? '#dc2626' : '#16a34a' },
      { label: 'Clean Drivers', value: `${cleanDrivers.length}/${stickers.length}`, sub: `${Math.round((cleanDrivers.length / stickers.length) * 100)}% incident-free`, subColor: '#16a34a' },
    ];

    const cardW = 44;
    kpis.forEach((kpi, i) => {
      const cx = 10 + i * (cardW + 3);
      setFill(doc, '#F9F9F9');
      setDraw(doc, '#E5E5E5');
      doc.setLineWidth(0.3);
      doc.roundedRect(cx, y, cardW, 26, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      setColor(doc, BLACK);
      doc.text(String(kpi.value), cx + cardW / 2, y + 11, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      setColor(doc, MID_GRAY);
      doc.text(kpi.label, cx + cardW / 2, y + 16, { align: 'center' });
      doc.setFontSize(7);
      const [sr, sg, sb] = hexToRgb(kpi.subColor);
      doc.setTextColor(sr, sg, sb);
      doc.text(kpi.sub, cx + cardW / 2, y + 21, { align: 'center' });
    });
    y += 32;

    y = sectionHeader(doc, 'Executive Summary', y);

    // Auto-generated narrative
    const ratingDir = ratingDelta >= 0 ? 'up' : 'down';
    const safetyDir = safetyDelta < 0 ? 'decreased' : 'increased';
    const safetyChange = safetyDelta !== null ? `Safety incidents ${safetyDir} from ${priorSafetyFb.length} to ${safetyFb.length}${Math.abs(safetyDelta) > 0 ? `, a ${Math.round(Math.abs(safetyDelta) / Math.max(priorSafetyFb.length, 1) * 100)}% ${safetyDelta < 0 ? 'reduction' : 'increase'}` : ''}. ` : '';
    const actionSummary = periodActions.length > 0
      ? `${resolvedCount} of ${periodActions.length} corrective action${periodActions.length > 1 ? 's' : ''} initiated during the period ${resolvedCount === periodActions.length ? 'have been resolved' : 'remain open'}.`
      : 'No corrective actions were required during this period.';
    const priorRatingText = priorAvgRating ? `, ${ratingDir} from ${priorAvgRating} in the prior period` : '';

    const narrative1 = `${companyName} operates ${stickers.length} vehicle${stickers.length !== 1 ? 's' : ''} monitored through the Judge My Driving community feedback platform. During ${periodLabel}, the fleet received ${currentFb.length} feedback scan${currentFb.length !== 1 ? 's' : ''} from other road users, generating a fleet-wide average rating of ${avgRating}/5.0${priorRatingText}. ${safetyChange}${actionSummary}`;
    const narrative2 = `${cleanDrivers.length} of ${stickers.length} driver${stickers.length !== 1 ? 's' : ''} (${Math.round((cleanDrivers.length / stickers.length) * 100)}%) maintained a clean record with zero safety incidents during the reporting period.`;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setColor(doc, '#333333');
    const lines1 = doc.splitTextToSize(narrative1, 190);
    doc.text(lines1, 10, y);
    y += lines1.length * 5 + 4;
    const lines2 = doc.splitTextToSize(narrative2, 190);
    doc.text(lines2, 10, y);

    drawFooter(doc, companyName, accountId, 1);

    // ── PAGE 2: Driver Performance Scorecard ──────────────────────────────
    doc.addPage();
    drawHeader(doc, periodLabel);
    y = 22;
    y = sectionHeader(doc, 'Driver Performance Scorecard', y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setColor(doc, MID_GRAY);
    doc.text('Individual driver ratings based on community feedback. Color coding: green (4.0+), amber (3.0-3.9), red (below 3.0).', 10, y);
    y += 7;

    const driverCols = ['#', 'Driver / Vehicle', 'Group', 'Avg Rating', 'Scans', 'Incidents', 'Trend'];
    const driverWidths = [10, 42, 32, 24, 18, 22, 22];
    y = tableHeader(doc, driverCols, y, driverWidths);

    driverRows.forEach((d, idx) => {
      if (y > 268) {
        doc.addPage();
        drawHeader(doc, periodLabel);
        drawFooter(doc, companyName, accountId, doc.internal.getNumberOfPages());
        y = 22;
        y = tableHeader(doc, driverCols, y, driverWidths);
      }
      y = tableRow(doc, [d.rank, d.name, d.group, d.avg, d.scans, d.incidents, d.trend], y, driverWidths, idx, (colIdx, val) => {
        if (colIdx === 3) return getRatingColor(val);
        if (colIdx === 5 && parseInt(val) > 0) return '#dc2626';
        if (colIdx === 6) return getTrendColor(val);
        return null;
      });
    });

    y += 8;
    if (y > 250) { doc.addPage(); drawHeader(doc, periodLabel); y = 22; }
    y = sectionHeader(doc, 'Rating Distribution Summary', y);
    const distCols = ['Rating Band', 'Drivers', '% of Fleet', 'Risk Level'];
    const distWidths = [70, 30, 40, 50];
    y = tableHeader(doc, distCols, y, distWidths);
    const distRows = [
      ['4.0 - 5.0 (Excellent)', bandExcellent, `${Math.round(bandExcellent / stickers.length * 100)}%`, 'Low'],
      ['3.0 - 3.9 (Acceptable)', bandAcceptable, `${Math.round(bandAcceptable / stickers.length * 100)}%`, 'Moderate'],
      ['Below 3.0 (Needs Improvement)', bandElevated, `${Math.round(bandElevated / stickers.length * 100)}%`, 'Elevated'],
    ];
    distRows.forEach((row, idx) => {
      y = tableRow(doc, row, y, distWidths, idx, (colIdx, val) => {
        if (colIdx === 3) {
          if (val === 'Low') return '#16a34a';
          if (val === 'Moderate') return '#d97706';
          return '#dc2626';
        }
        return null;
      });
    });

    drawFooter(doc, companyName, accountId, doc.internal.getNumberOfPages());

    // ── PAGE 3: Incident Log & Corrective Actions ─────────────────────────
    if (includeIncidentDetails) {
      doc.addPage();
      drawHeader(doc, periodLabel);
      y = 22;
      y = sectionHeader(doc, 'Safety Incident Log and Corrective Actions', y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      setColor(doc, MID_GRAY);
      const subtext = 'Detailed record of all safety-flagged incidents and the corrective actions taken by fleet management.';
      doc.text(doc.splitTextToSize(subtext, 190), 10, y);
      y += 10;

      if (incidentRows.length === 0) {
        setColor(doc, MID_GRAY);
        doc.text('No safety incidents recorded during this period.', 10, y);
        y += 10;
      } else {
        const incCols = ['Date', 'Driver/Vehicle', 'Description', 'Corrective Action', 'Status'];
        const incWidths = [20, 32, 54, 60, 24];
        y = tableHeader(doc, incCols, y, incWidths);
        incidentRows.forEach((row, idx) => {
          if (y > 265) {
            doc.addPage();
            drawHeader(doc, periodLabel);
            drawFooter(doc, companyName, accountId, doc.internal.getNumberOfPages());
            y = 22;
            y = tableHeader(doc, incCols, y, incWidths);
          }
          y = tableRow(doc, [row.date, row.driver, row.description, row.action, row.status], y, incWidths, idx, (colIdx, val) => {
            if (colIdx === 4) return getStatusColor(val);
            return null;
          });
        });
      }

      y += 8;
      if (y > 245) { doc.addPage(); drawHeader(doc, periodLabel); y = 22; }
      y = sectionHeader(doc, 'Corrective Action Summary', y);
      const actCols = ['Action Type', 'Count', 'Resolution Rate'];
      const actWidths = [100, 30, 60];
      y = tableHeader(doc, actCols, y, actWidths);
      Object.entries(actionTypeCounts).forEach(([type, count], idx) => {
        const resolved = periodActions.filter(a => a.action_type === type && a.status === 'Resolved').length;
        const rate = count > 0 ? `${Math.round(resolved / count * 100)}%` : '—';
        y = tableRow(doc, [type, count, rate], y, actWidths, idx, null);
      });
      if (Object.keys(actionTypeCounts).length === 0) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setColor(doc, MID_GRAY);
        doc.text('No corrective actions logged for this period.', 12, y + 5);
        y += 10;
      }

      drawFooter(doc, companyName, accountId, doc.internal.getNumberOfPages());
    }

    // ── PAGE 4: Certification & Methodology ───────────────────────────────
    doc.addPage();
    drawHeader(doc, periodLabel);
    y = 22;
    y = sectionHeader(doc, 'Fleet Manager Certification', y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setColor(doc, '#333333');
    const certText = `I certify that the information in this report accurately reflects the safety monitoring and corrective action practices of ${companyName} during ${periodLabel}. All incidents documented in this report were addressed through the corrective action processes described. This report is generated from data collected through the Judge My Driving community feedback platform and supplemented with fleet management records.`;
    const certLines = doc.splitTextToSize(certText, 190);
    doc.text(certLines, 10, y);
    y += certLines.length * 5 + 10;

    // Signature lines
    const sigFields = [['Fleet Manager Signature', 'Date'], ['Print Name / Title', 'Company']];
    sigFields.forEach(([left, right]) => {
      setDraw(doc, '#CCCCCC');
      doc.setLineWidth(0.4);
      doc.line(10, y, 95, y);
      doc.line(110, y, 200, y);
      doc.setFontSize(7.5);
      setColor(doc, MID_GRAY);
      doc.text(left, 10, y + 4);
      doc.text(right, 110, y + 4);
      y += 14;
    });

    y += 4;
    y = sectionHeader(doc, 'Methodology and Data Sources', y);

    const methodSections = [
      ['Data Collection', 'Feedback is collected via QR-coded bumper stickers affixed to fleet vehicles. Other road users scan the QR code using a smartphone camera and submit a 1-5 star rating along with optional comments and safety flags. Each submission is timestamped and geolocated. Device-level rate limiting prevents duplicate or spam submissions.'],
      ['Rating Scale', '1 star = Poor/Dangerous driving | 2 stars = Below average | 3 stars = Average | 4 stars = Good | 5 stars = Excellent. Safety flag checkbox available for all ratings.'],
      ['Incident Classification', 'Safety incidents are defined as any feedback submission where the reporter checked the safety concern flag. Incidents are assigned to fleet management for review and corrective action.'],
      ['Corrective Action Workflow', 'When a safety incident is flagged, the fleet manager receives an automated alert. The manager reviews the incident, selects a corrective action, documents the action taken, and marks the incident as resolved. All actions are timestamped and included in this report.'],
      ['Limitations', 'Feedback is voluntarily submitted by other road users and is not independently verified. This report supplements, but does not replace, formal fleet safety programs, telematics data, or DOT compliance documentation.'],
    ];

    methodSections.forEach(([title, body]) => {
      if (y > 255) { doc.addPage(); drawHeader(doc, periodLabel); y = 22; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      setColor(doc, BLACK);
      doc.text(title, 10, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      setColor(doc, '#444444');
      const bodyLines = doc.splitTextToSize(body, 190);
      doc.text(bodyLines, 10, y);
      y += bodyLines.length * 4.5 + 4;
    });

    y += 2;
    setDraw(doc, GOLD);
    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setColor(doc, MID_GRAY);
    doc.text('This report was generated by Judge My Driving (judgemydriving.com). For questions about this report, contact support@judgemydriving.com.', 10, y);

    drawFooter(doc, companyName, accountId, doc.internal.getNumberOfPages());

    // Output
    const pdfBytes = doc.output('arraybuffer');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="JMD_Fleet_Safety_Report.pdf"`,
      },
    });
  } catch (error) {
    console.error('generateFleetReport error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});