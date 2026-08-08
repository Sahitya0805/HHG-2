import { BuilderDetails, FramePreset, GeneratorFormat, ImageAdjustment } from '../types';

/**
 * Draws tropical palm leaf vector on canvas
 */
function drawPalmLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1,
  color: string = '#005A35',
  rotation: number = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(scale, scale);

  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;

  // Stem
  ctx.beginPath();
  ctx.moveTo(0, 50);
  ctx.quadraticCurveTo(10, 0, 40, -60);
  ctx.stroke();

  // Fronds
  const fronds = [
    { startX: 5, startY: 40, cpX: -25, cpY: 20, endX: -45, endY: 10 },
    { startX: 12, startY: 25, cpX: -30, cpY: -5, endX: -55, endY: -20 },
    { startX: 20, startY: 10, cpX: -32, cpY: -25, endX: -50, endY: -45 },
    { startX: 28, startY: -10, cpX: -20, cpY: -45, endX: -30, endY: -65 },
    { startX: 35, startY: -35, cpX: 0, cpY: -70, endX: 10, endY: -85 },
    // Right side
    { startX: 10, startY: 35, cpX: 35, cpY: 25, endX: 55, endY: 20 },
    { startX: 18, startY: 20, cpX: 42, cpY: 0, endX: 65, endY: -10 },
    { startX: 25, startY: 0, cpX: 45, cpY: -20, endX: 60, endY: -35 },
    { startX: 32, startY: -20, cpX: 40, cpY: -45, endX: 50, endY: -60 },
  ];

  fronds.forEach((f) => {
    ctx.beginPath();
    ctx.moveTo(f.startX, f.startY);
    ctx.quadraticCurveTo(f.cpX, f.cpY, f.endX, f.endY);
    ctx.quadraticCurveTo(f.cpX + 5, f.cpY + 5, f.startX, f.startY);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Draws a starburst badge on canvas
 */
function drawStarburst(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  fillColor: string,
  strokeColor: string = '#000000'
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();

  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = strokeColor;
  ctx.stroke();
  ctx.restore();
}

/**
 * Helper to draw a rounded rectangle
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: boolean = true,
  stroke: boolean = true
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

/**
 * Renders the canvas graphic (ID Card or PFP Frame)
 */
export function generateCanvasGraphic(
  canvas: HTMLCanvasElement,
  format: GeneratorFormat,
  details: BuilderDetails,
  photoImg: HTMLImageElement | null,
  adjustment: ImageAdjustment
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (format === 'id_card') {
    // ----------------------------------------------------
    // BUILDER ID CARD FORMAT (1200 x 1500)
    // ----------------------------------------------------
    canvas.width = 1200;
    canvas.height = 1500;

    // Theme color mappings
    let bgColor = '#08733F';
    let cardBgColor = '#FFF9E7';
    let headerTextColor = '#FFD400';
    let accentPink = '#FF087C';
    let darkText = '#005A35';

    if (details.theme === 'sunset') {
      bgColor = '#7C1C08';
      headerTextColor = '#FFD400';
      accentPink = '#FF5E08';
      cardBgColor = '#FFF5E6';
    } else if (details.theme === 'cyber') {
      bgColor = '#1A0826';
      headerTextColor = '#00FFCC';
      accentPink = '#FF087C';
      cardBgColor = '#F5E8FF';
    } else if (details.theme === 'retro') {
      bgColor = '#1E3A2B';
      headerTextColor = '#E2B857';
      accentPink = '#C84B31';
      cardBgColor = '#F9F3DF';
    }

    // 1. Background Fill & Pattern
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 1200, 1500);

    // Decorative background pattern dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let x = 30; x < 1200; x += 60) {
      for (let y = 30; y < 1500; y += 60) {
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Decorative Palm Leaves in Canvas background corners
    drawPalmLeaf(ctx, -20, 140, 1.8, 'rgba(0, 0, 0, 0.25)', 45);
    drawPalmLeaf(ctx, 1220, 140, 1.8, 'rgba(0, 0, 0, 0.25)', -45);
    drawPalmLeaf(ctx, -40, 1420, 2.0, 'rgba(0, 0, 0, 0.25)', -30);
    drawPalmLeaf(ctx, 1240, 1420, 2.0, 'rgba(0, 0, 0, 0.25)', 30);

    // 2. Top Header Brand Bar (Outside Card)
    ctx.fillStyle = headerTextColor;
    ctx.font = 'bold 32px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('2:47 PM STUDIO', 80, 75);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px "Space Mono", monospace';
    ctx.fillText('28 — 31 OCT 2026', 1120, 75);

    // 3. Main Card Surface Container (Cream Card with Neo-brutalist Shadow)
    const cardX = 80;
    const cardY = 120;
    const cardWidth = 1040;
    const cardHeight = 1300;

    // Neo-brutalist Shadow
    ctx.fillStyle = '#000000';
    drawRoundedRect(ctx, cardX + 16, cardY + 16, cardWidth, cardHeight, 28, true, false);

    // Card Fill
    ctx.fillStyle = cardBgColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 28, true, true);

    // Inner Card Border Frame Line
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    drawRoundedRect(ctx, cardX + 16, cardY + 16, cardWidth - 32, cardHeight - 32, 20, false, true);

    // 4. Card Header: "HACKER HOUSE" + Pink "गोवा" Script Overlay
    ctx.textAlign = 'center';
    ctx.fillStyle = darkText;
    ctx.font = '900 78px "Syne", sans-serif';
    ctx.fillText('HACKER HOUSE', cardX + cardWidth / 2, cardY + 115);

    // Pink Script Overlay / Devanagari "गोवा" Badge
    ctx.save();
    ctx.translate(cardX + cardWidth / 2 + 180, cardY + 70);
    ctx.rotate((-8 * Math.PI) / 180);

    // Pink Pill Background
    ctx.fillStyle = accentPink;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, -75, -28, 150, 56, 16, true, true);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('गोवा 🌴', 0, 10);
    ctx.restore();

    // Event Sub-heading line
    ctx.fillStyle = '#4B5563';
    ctx.font = 'bold 22px "Space Mono", monospace';
    ctx.fillText('GOA, INDIA  •  BUILDER ID CARD', cardX + cardWidth / 2, cardY + 155);

    // Horizontal Divider Bar
    ctx.beginPath();
    ctx.moveTo(cardX + 50, cardY + 175);
    ctx.lineTo(cardX + cardWidth - 50, cardY + 175);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    // 5. Photo Box Container
    const photoBoxW = 460;
    const photoBoxH = 460;
    const photoBoxX = cardX + (cardWidth - photoBoxW) / 2;
    const photoBoxY = cardY + 205;

    // Photo Box Shadow
    ctx.fillStyle = '#000000';
    drawRoundedRect(ctx, photoBoxX + 10, photoBoxY + 10, photoBoxW, photoBoxH, 20, true, false);

    // Photo Box White Background
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    drawRoundedRect(ctx, photoBoxX, photoBoxY, photoBoxW, photoBoxH, 20, true, true);

    // Draw User Photo inside Photo Box (Clipping Mask)
    ctx.save();
    ctx.beginPath();
    // Rounded photo clip path
    const pr = 16;
    const px = photoBoxX + 6;
    const py = photoBoxY + 6;
    const pw = photoBoxW - 12;
    const ph = photoBoxH - 12;

    ctx.moveTo(px + pr, py);
    ctx.lineTo(px + pw - pr, py);
    ctx.quadraticCurveTo(px + pw, py, px + pw, py + pr);
    ctx.lineTo(px + pw, py + ph - pr);
    ctx.quadraticCurveTo(px + pw, py + ph, px + pw - pr, py + ph);
    ctx.lineTo(px + pr, py + ph);
    ctx.quadraticCurveTo(px, py + ph, px, py + ph - pr);
    ctx.lineTo(px, py + pr);
    ctx.quadraticCurveTo(px, py, px + pr, py);
    ctx.closePath();
    ctx.clip();

    if (photoImg) {
      // Photo Auto-Fit & User Adjustment Math
      const centerCenterX = photoBoxX + photoBoxW / 2 + adjustment.offsetX;
      const centerCenterY = photoBoxY + photoBoxH / 2 + adjustment.offsetY;

      // Base scale to cover photo box
      const scaleToCover = Math.max(pw / photoImg.width, ph / photoImg.height) * adjustment.zoom;
      const drawW = photoImg.width * scaleToCover;
      const drawH = photoImg.height * scaleToCover;

      ctx.translate(centerCenterX, centerCenterY);
      ctx.rotate((adjustment.rotation * Math.PI) / 180);
      ctx.drawImage(photoImg, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      // Placeholder photo state
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(px, py, pw, ph);

      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'bold 36px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('YOUR PHOTO', photoBoxX + photoBoxW / 2, photoBoxY + photoBoxH / 2);
    }
    ctx.restore();

    // Corner Sticker on Photo (Tape or Official Stamp)
    ctx.save();
    ctx.translate(photoBoxX - 25, photoBoxY + 30);
    ctx.rotate((-25 * Math.PI) / 180);
    ctx.fillStyle = '#FFD400';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, 0, 0, 160, 36, 6, true, true);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED BUILDER', 80, 23);
    ctx.restore();

    // Starburst Badge on bottom right of photo
    drawStarburst(ctx, photoBoxX + photoBoxW - 15, photoBoxY + photoBoxH - 15, 12, 45, 32, '#FF087C', '#000000');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('2026', photoBoxX + photoBoxW - 15, photoBoxY + photoBoxH - 10);

    // 6. Builder Details Text Section
    const nameY = photoBoxY + photoBoxH + 65;

    // Builder Name
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';
    const nameText = (details.name || 'YOUR NAME HERE').toUpperCase();
    ctx.font = 'bold 56px "Instrument Serif", serif';

    // Auto shrink name font size if very long
    if (nameText.length > 20) {
      ctx.font = 'bold 42px "Instrument Serif", serif';
    }
    ctx.fillText(nameText, cardX + cardWidth / 2, nameY);

    // Stack / Role Pill Badge
    const roleY = nameY + 50;
    const roleText = (details.role || 'FULL STACK DEVELOPER').toUpperCase();

    ctx.font = 'bold 24px "Space Mono", monospace';
    const roleMetrics = ctx.measureText(roleText);
    const rolePillW = roleMetrics.width + 48;
    const rolePillH = 46;
    const rolePillX = cardX + (cardWidth - rolePillW) / 2;

    // Role Shadow
    ctx.fillStyle = '#000000';
    drawRoundedRect(ctx, rolePillX + 4, roleY - 32 + 4, rolePillW, rolePillH, 12, true, false);

    // Role Pill Fill
    ctx.fillStyle = '#08733F';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, rolePillX, roleY - 32, rolePillW, rolePillH, 12, true, true);

    ctx.fillStyle = '#FFD400';
    ctx.textAlign = 'center';
    ctx.fillText(roleText, cardX + cardWidth / 2, roleY);

    // Builder Title Box (Quotes)
    const titleY = roleY + 85;
    const titleText = details.title || '🌴 CODE SURFER';

    const titleBoxW = 760;
    const titleBoxH = 85;
    const titleBoxX = cardX + (cardWidth - titleBoxW) / 2;

    // Title Box Shadow
    ctx.fillStyle = '#000000';
    drawRoundedRect(ctx, titleBoxX + 6, titleY - 45 + 6, titleBoxW, titleBoxH, 16, true, false);

    // Title Box Fill
    ctx.fillStyle = '#FFD400';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, titleBoxX, titleY - 45, titleBoxW, titleBoxH, 16, true, true);

    // Title Label Header
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BUILDER CLASS', cardX + cardWidth / 2, titleY - 22);

    // Title Main Text
    ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText(`"${titleText}"`, cardX + cardWidth / 2, titleY + 20);

    // 7. Footer Section inside Card
    const footerY = cardY + cardHeight - 85;

    // Decorative Barcode
    const barcodeX = cardX + 60;
    const barcodeY = footerY - 25;
    ctx.fillStyle = '#000000';

    const barWidths = [4, 2, 6, 3, 2, 8, 3, 2, 5, 2, 4, 6, 2, 3, 8, 3, 2, 5];
    let currentBarX = barcodeX;
    for (let i = 0; i < barWidths.length; i++) {
      ctx.fillRect(currentBarX, barcodeY, barWidths[i], 50);
      currentBarX += barWidths[i] + (i % 2 === 0 ? 3 : 2);
    }
    ctx.font = 'bold 14px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('ID: HH2026-GOA', barcodeX, barcodeY + 68);

    // Center Hashtag Stamp `#FrameInGoa`
    ctx.save();
    ctx.translate(cardX + cardWidth / 2, footerY + 10);
    ctx.fillStyle = accentPink;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, -110, -22, 220, 44, 12, true, true);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('#FrameInGoa', 0, 8);
    ctx.restore();

    // Right Side Location Stamp
    ctx.textAlign = 'right';
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px "Space Mono", monospace';
    ctx.fillText('OCT 28-31, 2026', cardX + cardWidth - 60, footerY);
    ctx.font = 'bold 16px "Space Mono", monospace';
    ctx.fillStyle = '#4B5563';
    ctx.fillText('GOA, INDIA', cardX + cardWidth - 60, footerY + 24);

  } else {
    // ----------------------------------------------------
    // FORMAT A: PROFILE PICTURE FRAME OVERLAY (1200 x 1200)
    // ----------------------------------------------------
    canvas.width = 1200;
    canvas.height = 1200;

    // 1. Background Fill
    ctx.fillStyle = '#08733F';
    ctx.fillRect(0, 0, 1200, 1200);

    // Subtle background palm silhouettes
    drawPalmLeaf(ctx, 40, 40, 2.2, 'rgba(0, 0, 0, 0.2)', 30);
    drawPalmLeaf(ctx, 1160, 40, 2.2, 'rgba(0, 0, 0, 0.2)', -30);
    drawPalmLeaf(ctx, 40, 1160, 2.2, 'rgba(0, 0, 0, 0.2)', -150);
    drawPalmLeaf(ctx, 1160, 1160, 2.2, 'rgba(0, 0, 0, 0.2)', 150);

    // 2. Photo Area (Center Circle or Square based on Preset)
    const centerX = 600;
    const centerY = 600;
    const avatarRadius = 420;

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, avatarRadius, 0, Math.PI * 2);
    ctx.clip();

    if (photoImg) {
      const centerCenterX = centerX + adjustment.offsetX;
      const centerCenterY = centerY + adjustment.offsetY;

      const size = avatarRadius * 2;
      const scaleToCover = Math.max(size / photoImg.width, size / photoImg.height) * adjustment.zoom;
      const drawW = photoImg.width * scaleToCover;
      const drawH = photoImg.height * scaleToCover;

      ctx.translate(centerCenterX, centerCenterY);
      ctx.rotate((adjustment.rotation * Math.PI) / 180);
      ctx.drawImage(photoImg, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      ctx.fillStyle = '#10B981';
      ctx.fillRect(centerX - avatarRadius, centerY - avatarRadius, avatarRadius * 2, avatarRadius * 2);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 44px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('UPLOAD PROFILE PHOTO', centerX, centerY);
    }
    ctx.restore();

    // 3. Circular Frame Ring Wraparound
    ctx.lineWidth = 28;
    ctx.strokeStyle = '#FFD400';
    ctx.beginPath();
    ctx.arc(centerX, centerY, avatarRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 10;
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX, centerY, avatarRadius + 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, avatarRadius - 14, 0, Math.PI * 2);
    ctx.stroke();

    // Outer Dashed Pink Accent Ring
    ctx.save();
    ctx.setLineDash([20, 16]);
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#FF087C';
    ctx.beginPath();
    ctx.arc(centerX, centerY, avatarRadius + 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 4. Top Banner Pill: "HH GOA 2026"
    ctx.save();
    ctx.translate(centerX, centerY - avatarRadius - 10);

    // Banner Shadow
    ctx.fillStyle = '#000000';
    drawRoundedRect(ctx, -260 + 6, -45 + 6, 520, 90, 24, true, false);

    // Banner Surface
    ctx.fillStyle = '#FFD400';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    drawRoundedRect(ctx, -260, -45, 520, 90, 24, true, true);

    ctx.fillStyle = '#000000';
    ctx.font = '900 48px "Syne", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌴 HH GOA 2026 🌴', 0, 16);
    ctx.restore();

    // 5. Bottom Banner Pill: "GOA • 28-31 OCT 2026" + `#FrameInGoa`
    ctx.save();
    ctx.translate(centerX, centerY + avatarRadius + 10);

    // Banner Shadow
    ctx.fillStyle = '#000000';
    drawRoundedRect(ctx, -300 + 6, -45 + 6, 600, 90, 24, true, false);

    // Banner Surface
    ctx.fillStyle = '#FF087C';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    drawRoundedRect(ctx, -300, -45, 600, 90, 24, true, true);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('#FrameInGoa', 0, -2);

    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#FFD400';
    ctx.fillText('GOA, INDIA  •  28—31 OCT 2026', 0, 28);
    ctx.restore();

    // 6. Corner Decorative Badges
    // Top Right Starburst "BUILDER"
    drawStarburst(ctx, centerX + avatarRadius - 20, centerY - avatarRadius + 30, 10, 55, 40, '#FF087C', '#000000');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BUILDER', centerX + avatarRadius - 20, centerY - avatarRadius + 36);

    // Bottom Left Starburst "2026"
    drawStarburst(ctx, centerX - avatarRadius + 20, centerY + avatarRadius - 30, 10, 50, 36, '#FFD400', '#000000');
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 18px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('2026', centerX - avatarRadius + 20, centerY + avatarRadius - 24);
  }
}
