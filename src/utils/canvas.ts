export type FormatType = 'id_card' | 'pfp_frame';
export type ThemeColor = 'emerald' | 'sunset' | 'cyber' | 'retro';

export interface CardData {
  name: string;
  role: string;
  title: string;
  theme: ThemeColor;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

// Draw rounded rectangle helper
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill = true,
  stroke = true
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

// Draw starburst badge helper
function drawStarburst(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  fillColor: string
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
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000000';
  ctx.stroke();
  ctx.restore();
}

/**
 * Render graphic onto HTML5 Canvas
 */
export function renderCanvas(
  canvas: HTMLCanvasElement,
  format: FormatType,
  data: CardData,
  photoImg: HTMLImageElement | null
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (format === 'id_card') {
    // ----------------------------------------
    // BUILDER ID CARD FORMAT (1200 x 1500)
    // ----------------------------------------
    canvas.width = 1200;
    canvas.height = 1500;

    let bgColor = '#08733F';
    let cardBg = '#FFF9E7';
    let accentPink = '#FF087C';

    if (data.theme === 'sunset') bgColor = '#7C1C08';
    if (data.theme === 'cyber') bgColor = '#1A0826';
    if (data.theme === 'retro') bgColor = '#1E3A2B';

    // 1. Main Canvas Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 1200, 1500);

    // Header Metadata
    ctx.fillStyle = '#FFD400';
    ctx.font = 'bold 30px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('2:47 PM STUDIO', 80, 75);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('28 — 31 OCT 2026', 1120, 75);

    // 2. Main ID Card Container
    const cardX = 80;
    const cardY = 120;
    const cardW = 1040;
    const cardH = 1300;

    // Card Neo Shadow
    ctx.fillStyle = '#000000';
    drawRoundedRect(ctx, cardX + 16, cardY + 16, cardW, cardH, 24, true, false);

    // Card Base Surface
    ctx.fillStyle = cardBg;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 24, true, true);

    // 3. Card Title Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#005A35';
    ctx.font = '900 76px sans-serif';
    ctx.fillText('HACKER HOUSE', cardX + cardW / 2, cardY + 115);

    // Pink "गोवा" Badge Overlay
    ctx.save();
    ctx.translate(cardX + cardW / 2 + 180, cardY + 70);
    ctx.rotate((-8 * Math.PI) / 180);
    ctx.fillStyle = accentPink;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, -75, -28, 150, 56, 16, true, true);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('गोवा 🌴', 0, 10);
    ctx.restore();

    // Subheader Line
    ctx.fillStyle = '#4B5563';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('GOA, INDIA  •  BUILDER ID CARD', cardX + cardW / 2, cardY + 155);

    // Divider Line
    ctx.beginPath();
    ctx.moveTo(cardX + 50, cardY + 175);
    ctx.lineTo(cardX + cardW - 50, cardY + 175);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    // 4. Photo Frame Container
    const boxW = 460;
    const boxH = 460;
    const boxX = cardX + (cardW - boxW) / 2;
    const boxY = cardY + 205;

    // Photo Box Shadow
    ctx.fillStyle = '#000000';
    drawRoundedRect(ctx, boxX + 10, boxY + 10, boxW, boxH, 20, true, false);

    // Photo Box Surface
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 20, true, true);

    // User Photo Draw with Clipping Mask
    ctx.save();
    ctx.beginPath();
    drawRoundedRect(ctx, boxX + 6, boxY + 6, boxW - 12, boxH - 12, 16, false, false);
    ctx.clip();

    if (photoImg) {
      const cx = boxX + boxW / 2 + data.offsetX;
      const cy = boxY + boxH / 2 + data.offsetY;
      const scale = Math.max((boxW - 12) / photoImg.width, (boxH - 12) / photoImg.height) * data.zoom;
      const dw = photoImg.width * scale;
      const dh = photoImg.height * scale;

      ctx.translate(cx, cy);
      ctx.drawImage(photoImg, -dw / 2, -dh / 2, dw, dh);
    } else {
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(boxX + 6, boxY + 6, boxW - 12, boxH - 12);
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('YOUR PHOTO', boxX + boxW / 2, boxY + boxH / 2);
    }
    ctx.restore();

    // Photo Tape Badge
    ctx.save();
    ctx.translate(boxX - 25, boxY + 30);
    ctx.rotate((-25 * Math.PI) / 180);
    ctx.fillStyle = '#FFD400';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, 0, 0, 160, 36, 6, true, true);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED BUILDER', 80, 23);
    ctx.restore();

    // Corner Starburst Badge
    drawStarburst(ctx, boxX + boxW - 15, boxY + boxH - 15, 12, 45, 32, '#FF087C');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('2026', boxX + boxW - 15, boxY + boxH - 10);

    // 5. Details Section
    const nameY = boxY + boxH + 65;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 54px serif';
    ctx.fillText((data.name || 'YOUR NAME HERE').toUpperCase(), cardX + cardW / 2, nameY);

    // Role Pill Badge
    const roleY = nameY + 50;
    const roleText = (data.role || 'FULL STACK DEVELOPER').toUpperCase();
    ctx.font = 'bold 24px monospace';
    const roleMetrics = ctx.measureText(roleText);
    const pillW = roleMetrics.width + 48;
    const pillX = cardX + (cardW - pillW) / 2;

    ctx.fillStyle = '#000000';
    drawRoundedRect(ctx, pillX + 4, roleY - 32 + 4, pillW, 46, 12, true, false);
    ctx.fillStyle = '#08733F';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, pillX, roleY - 32, pillW, 46, 12, true, true);
    ctx.fillStyle = '#FFD400';
    ctx.fillText(roleText, cardX + cardW / 2, roleY);

    // Title Quote Box
    const titleY = roleY + 85;
    const titleText = data.title || '🌴 CODE SURFER';
    const titleW = 760;
    const titleX = cardX + (cardW - titleW) / 2;

    ctx.fillStyle = '#000000';
    drawRoundedRect(ctx, titleX + 6, titleY - 45 + 6, titleW, 85, 16, true, false);
    ctx.fillStyle = '#FFD400';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, titleX, titleY - 45, titleW, 85, 16, true, true);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('BUILDER CLASS', cardX + cardW / 2, titleY - 22);
    ctx.font = '800 36px sans-serif';
    ctx.fillText(`"${titleText}"`, cardX + cardW / 2, titleY + 20);

    // 6. Footer Section
    const footerY = cardY + cardH - 85;

    // Barcode Graphic
    ctx.fillStyle = '#000000';
    const barW = [4, 2, 6, 3, 2, 8, 3, 2, 5, 2, 4, 6, 2, 3, 8];
    let curX = cardX + 60;
    for (let i = 0; i < barW.length; i++) {
      ctx.fillRect(curX, footerY - 25, barW[i], 50);
      curX += barW[i] + 3;
    }

    // Hashtag Stamp `#FrameInGoa`
    ctx.save();
    ctx.translate(cardX + cardW / 2, footerY + 10);
    ctx.fillStyle = accentPink;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, -110, -22, 220, 44, 12, true, true);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 22px sans-serif';
    ctx.fillText('#FrameInGoa', 0, 8);
    ctx.restore();

    // Date & Location Stamp
    ctx.textAlign = 'right';
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('OCT 28-31, 2026', cardX + cardW - 60, footerY);
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#4B5563';
    ctx.fillText('GOA, INDIA', cardX + cardW - 60, footerY + 24);

  } else {
    // ----------------------------------------
    // FORMAT A: PROFILE FRAME OVERLAY (1200 x 1200)
    // ----------------------------------------
    canvas.width = 1200;
    canvas.height = 1200;

    // 1. Background
    ctx.fillStyle = '#08733F';
    ctx.fillRect(0, 0, 1200, 1200);

    // 2. Center Photo Avatar Circle
    const cx = 600;
    const cy = 600;
    const r = 420;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    if (photoImg) {
      const px = cx + data.offsetX;
      const py = cy + data.offsetY;
      const scale = Math.max((r * 2) / photoImg.width, (r * 2) / photoImg.height) * data.zoom;
      const dw = photoImg.width * scale;
      const dh = photoImg.height * scale;

      ctx.translate(px, py);
      ctx.drawImage(photoImg, -dw / 2, -dh / 2, dw, dh);
    } else {
      ctx.fillStyle = '#10B981';
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 44px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('UPLOAD PROFILE PHOTO', cx, cy);
    }
    ctx.restore();

    // 3. Branded Frame Overlay Rings
    ctx.lineWidth = 28;
    ctx.strokeStyle = '#FFD400';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 10;
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.setLineDash([20, 16]);
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#FF087C';
    ctx.beginPath();
    ctx.arc(cx, cy, r + 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Top Arc Banner
    ctx.save();
    ctx.translate(cx, cy - r - 10);
    ctx.fillStyle = '#FFD400';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    drawRoundedRect(ctx, -260, -45, 520, 90, 24, true, true);
    ctx.fillStyle = '#000000';
    ctx.font = '900 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌴 HH GOA 2026 🌴', 0, 16);
    ctx.restore();

    // Bottom Arc Banner
    ctx.save();
    ctx.translate(cx, cy + r + 10);
    ctx.fillStyle = '#FF087C';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    drawRoundedRect(ctx, -300, -45, 600, 90, 24, true, true);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('#FrameInGoa', 0, -2);
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#FFD400';
    ctx.fillText('GOA, INDIA  •  28—31 OCT 2026', 0, 28);
    ctx.restore();

    // Corner Badges
    drawStarburst(ctx, cx + r - 20, cy - r + 30, 10, 55, 40, '#FF087C');
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BUILDER', cx + r - 20, cy - r + 36);
  }
}
