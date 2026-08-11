export const OUTPUT_SIZES = {
  pfp: { width: 1080, height: 1080, label: '1080 × 1080' },
  pass: { width: 1080, height: 1350, label: '1080 × 1350' },
  squad: { width: 1080, height: 1350, label: '1080 × 1350' },
};

export const PALETTES = {
  jungle: {
    label: 'HH Goa',
    bg: '#043B28',
    panel: '#FFF8E7',
    ink: '#0B1611',
    green: '#08733F',
    accent: '#FFD400',
    pop: '#FF087C',
    soft: '#D9F4DF',
  },
};

export function hashString(value = '') {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

export function getBuilderClass(name, role) {
  const source = `${name}|${role}`.toLowerCase();
  if (/design|figma|ui|ux|visual/.test(source)) return 'Design Builder';
  if (/ai|ml|model|data/.test(source)) return 'AI / Data Builder';
  if (/rust|system|infra|devops|cloud/.test(source)) return 'Systems Builder';
  if (/front|react|web|javascript|typescript/.test(source)) return 'Frontend Builder';
  if (/back|api|node|python|java|golang/.test(source)) return 'Backend Builder';
  if (/mobile|ios|android|flutter/.test(source)) return 'Mobile Builder';
  if (/product|founder|growth/.test(source)) return 'Product Builder';
  if (/blockchain|web3|solidity|crypto/.test(source)) return 'Web3 Builder';
  return 'HH Goa Builder';
}

export function getPassNumber(name, role) {
  return String((hashString(`${name}|${role}`) % 900000) + 100000);
}

export function getBuilderId(name, role) {
  const initials = (name || 'GOA')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase() || 'GOA';
  return `HHG26-${initials}-${getPassNumber(name, role).slice(-4)}`;
}

function roundedRect(ctx, x, y, width, height, radius, fill, stroke, strokeWidth = 0) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke && strokeWidth) {
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

function drawPattern(ctx, palette, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;
  for (let x = -height; x < width + height; x += 96) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + height, height);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = palette.pop;
  for (let y = 42; y < height; y += 96) {
    for (let x = 42; x < width; x += 96) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawPalmMark(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(4, size * 0.08);
  ctx.beginPath();
  ctx.moveTo(0, size * 0.55);
  ctx.quadraticCurveTo(size * 0.06, size * 0.1, -size * 0.04, -size * 0.28);
  ctx.stroke();
  [-1.15, -0.65, -0.15, 0.35, 0.85].forEach((angle) => {
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(size * 0.17, -size * 0.35, size * 0.28, size * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}

function drawPhotoCover(ctx, photo, x, y, width, height, radius = 0) {
  ctx.save();
  if (radius) {
    roundedRect(ctx, x, y, width, height, radius, '#D9D9D9');
    ctx.clip();
  } else {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
  }

  if (!photo?.image) {
    ctx.fillStyle = '#DCE5DF';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = '#5B6D62';
    ctx.font = '700 26px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('UPLOAD PHOTO', x + width / 2, y + height / 2);
    ctx.restore();
    return;
  }

  const image = photo.image;
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  const zoom = photo.crop?.zoom ?? 1;
  const offsetX = photo.crop?.x ?? 0;
  const offsetY = photo.crop?.y ?? 0;
  const coverScale = Math.max(width / imageWidth, height / imageHeight) * zoom;
  const drawWidth = imageWidth * coverScale;
  const drawHeight = imageHeight * coverScale;
  const drawX = x + (width - drawWidth) / 2 + (offsetX / 100) * width * 0.45;
  const drawY = y + (height - drawHeight) / 2 + (offsetY / 100) * height * 0.45;

  ctx.filter = photo.filter === 'warm'
    ? 'sepia(0.22) saturate(1.18) contrast(1.05)'
    : photo.filter === 'mono'
      ? 'grayscale(1) contrast(1.1)'
      : photo.filter === 'vivid'
        ? 'saturate(1.35) contrast(1.08)'
        : 'none';
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

function fitText(ctx, value, maxWidth, initialSize, minSize, family = 'Syne', weight = 800) {
  let size = initialSize;
  const text = value || '';
  while (size > minSize) {
    ctx.font = `${weight} ${size}px "${family}", sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

function drawImageContain(ctx, image, x, y, width, height) {
  if (!image) return;
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  const scale = Math.min(width / imageWidth, height / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function drawOfficialBackdrop(ctx, state, palette, width, height) {
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  const scene = state.brandAssets?.sunrise;
  if (scene) {
    const sceneSize = width;
    ctx.save();
    ctx.globalAlpha = state.palette === 'jungle' ? 0.96 : 0.64;
    ctx.drawImage(scene, 0, height - sceneSize, width, sceneSize);
    ctx.restore();
  } else {
    drawPattern(ctx, palette, width, height);
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(1, 28, 18, 0.82)');
  gradient.addColorStop(0.38, 'rgba(1, 28, 18, 0.18)');
  gradient.addColorStop(1, 'rgba(1, 28, 18, 0.22)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  if (state.palette !== 'jungle') {
    ctx.save();
    ctx.globalAlpha = 0.24;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}

function drawBrandLockup(ctx, assets, x, y, width, height) {
  if (assets?.wordmark) {
    drawImageContain(ctx, assets.wordmark, x, y, width, height);
    if (assets.hindi) {
      const hindiSize = height * 0.86;
      drawImageContain(ctx, assets.hindi, x + width * 0.44, y + height * 0.06, hindiSize, hindiSize);
    }
    return;
  }

  ctx.fillStyle = '#FEE101';
  ctx.textAlign = 'left';
  ctx.font = `800 ${Math.round(height * 0.48)}px "Syne", sans-serif`;
  ctx.fillText('HACKER HOUSE', x, y + height * 0.65);
  ctx.fillStyle = '#FF087C';
  ctx.font = `800 ${Math.round(height * 0.24)}px "Syne", sans-serif`;
  ctx.fillText('GOA 2026', x + width * 0.34, y + height * 0.92);
}

function drawStudioMark(ctx, assets, x, y, width, height) {
  if (assets?.studio) {
    drawImageContain(ctx, assets.studio, x, y, width, height);
    return;
  }
  ctx.fillStyle = '#FEE101';
  ctx.textAlign = 'center';
  ctx.font = '800 18px "Space Mono", monospace';
  ctx.fillText('2:47PM', x + width / 2, y + height / 2);
}

function drawTape(ctx, x, y, width, height, rotation, color) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(rotation);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(-width / 2, -height / 2, width, height);
  ctx.restore();
}

function wrapText(ctx, value, x, y, maxWidth, lineHeight, maxLines = 2) {
  const words = String(value || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || !line) line = test;
    else {
      lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((text, index) => ctx.fillText(text, x, y + index * lineHeight));
}

function drawTicketEdge(ctx, palette, height) {
  ctx.save();
  ctx.fillStyle = palette.accent;
  for (let y = 120; y < height - 120; y += 70) {
    ctx.beginPath();
    ctx.arc(38, y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(1042, y, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawPfp(ctx, state, palette) {
  const { photo, badgeText } = state;
  drawOfficialBackdrop(ctx, state, palette, 1080, 1080);

  roundedRect(ctx, 26, 26, 1028, 1028, 42, null, palette.ink, 12);
  drawBrandLockup(ctx, state.brandAssets, 76, 38, 760, 148);
  drawStudioMark(ctx, state.brandAssets, 900, 46, 112, 92);

  roundedRect(ctx, 78, 184, 260, 54, 18, palette.pop, palette.ink, 6);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 18px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('OPEN TRIAL · 01', 208, 219);

  ctx.fillStyle = palette.accent;
  ctx.textAlign = 'right';
  ctx.font = '800 18px "Space Mono", monospace';
  ctx.fillText('28—31 OCT 2026', 1002, 208);
  ctx.fillText('GOA, INDIA', 1002, 234);

  ctx.save();
  ctx.beginPath();
  ctx.arc(540, 575, 350, 0, Math.PI * 2);
  ctx.fillStyle = palette.panel;
  ctx.fill();
  ctx.lineWidth = 14;
  ctx.strokeStyle = palette.ink;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(540, 575, 322, 0, Math.PI * 2);
  ctx.clip();
  drawPhotoCover(ctx, photo, 218, 253, 644, 644);
  ctx.restore();

  ctx.strokeStyle = palette.pop;
  ctx.lineWidth = 12;
  ctx.setLineDash([12, 16]);
  ctx.beginPath();
  ctx.arc(540, 575, 378, 0.04, Math.PI * 1.95);
  ctx.stroke();
  ctx.setLineDash([]);

  drawTape(ctx, 114, 400, 170, 48, -0.14, palette.accent);
  drawTape(ctx, 790, 738, 170, 48, 0.12, palette.accent);

  const badge = (badgeText || 'FRAME IN GOA').toUpperCase().slice(0, 36);
  roundedRect(ctx, 108, 872, 864, 112, 20, palette.panel, palette.ink, 9);
  ctx.fillStyle = palette.pop;
  ctx.fillRect(108, 872, 18, 112);
  ctx.fillStyle = palette.ink;
  ctx.textAlign = 'center';
  const badgeSize = fitText(ctx, badge, 760, 42, 24, 'Syne', 800);
  ctx.font = `800 ${badgeSize}px "Syne", sans-serif`;
  ctx.fillText(badge, 548, 938);

  roundedRect(ctx, 290, 990, 500, 52, 16, palette.ink, palette.accent, 4);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 20px "Space Mono", monospace';
  ctx.fillText('HHGOA.COM  ·  TASK 01', 540, 1024);
}

function drawPass(ctx, state, palette) {
  const name = (state.name || 'YOUR NAME').trim().toUpperCase();
  const role = (state.role || 'YOUR STACK / ROLE').trim().toUpperCase();
  const builderClass = getBuilderClass(state.name, state.role);
  const builderId = getBuilderId(state.name, state.role);
  const teamName = (state.teamName || 'INDEPENDENT BUILDER').trim().toUpperCase();

  drawOfficialBackdrop(ctx, state, palette, 1080, 1350);
  roundedRect(ctx, 28, 28, 1024, 1294, 42, null, palette.ink, 12);
  drawTicketEdge(ctx, palette, 1350);

  drawBrandLockup(ctx, state.brandAssets, 62, 42, 670, 136);
  drawStudioMark(ctx, state.brandAssets, 906, 46, 118, 94);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 18px "Space Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('28—31 OCT 2026', 1016, 172);
  ctx.fillText('GOA, INDIA', 1016, 198);

  roundedRect(ctx, 66, 190, 392, 56, 18, palette.pop, palette.ink, 6);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 19px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('OPEN TRIAL · BUILDER ID', 262, 226);

  roundedRect(ctx, 62, 266, 596, 632, 20, palette.panel, palette.ink, 10);
  drawPhotoCover(ctx, state.photo, 84, 288, 552, 516, 10);
  roundedRect(ctx, 84, 288, 552, 516, 10, null, palette.ink, 6);
  drawTape(ctx, 42, 278, 158, 46, -0.12, palette.accent);
  drawTape(ctx, 520, 788, 158, 46, 0.1, palette.accent);
  ctx.fillStyle = palette.ink;
  ctx.textAlign = 'left';
  ctx.font = '700 15px "Space Mono", monospace';
  ctx.fillText('GOA, INDIA · 15.2993° N / 74.1240° E', 90, 846);
  ctx.fillStyle = palette.green;
  ctx.font = '800 19px "Space Mono", monospace';
  ctx.fillText('REAL BUILDER · REAL PHOTO', 90, 878);

  roundedRect(ctx, 682, 266, 336, 632, 24, '#FFF8E7', palette.ink, 10);
  roundedRect(ctx, 706, 292, 184, 50, 12, palette.pop, palette.ink, 5);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 17px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BUILDER CLASS', 798, 324);

  ctx.fillStyle = palette.green;
  ctx.textAlign = 'left';
  ctx.font = 'italic 47px "Instrument Serif", serif';
  wrapText(ctx, builderClass, 710, 404, 280, 48, 3);

  ctx.fillStyle = palette.pop;
  ctx.font = '800 15px "Space Mono", monospace';
  ctx.fillText('STACK / ROLE', 710, 558);
  ctx.fillStyle = palette.ink;
  ctx.font = '800 22px "Syne", sans-serif';
  wrapText(ctx, role, 710, 596, 278, 27, 4);

  ctx.fillStyle = palette.pop;
  ctx.font = '800 15px "Space Mono", monospace';
  ctx.fillText('TEAM SIGNAL', 710, 704);
  ctx.fillStyle = palette.ink;
  ctx.font = '800 23px "Syne", sans-serif';
  wrapText(ctx, teamName, 710, 741, 278, 29, 2);

  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(710, 814);
  ctx.lineTo(990, 814);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = palette.green;
  ctx.font = '800 16px "Space Mono", monospace';
  ctx.fillText(builderId, 710, 854);

  roundedRect(ctx, 62, 924, 956, 134, 18, palette.panel, palette.ink, 10);
  ctx.fillStyle = palette.pop;
  ctx.fillRect(62, 924, 18, 134);
  ctx.fillStyle = palette.ink;
  ctx.textAlign = 'left';
  const nameSize = fitText(ctx, name, 850, 72, 42, 'Syne', 800);
  ctx.font = `800 ${nameSize}px "Syne", sans-serif`;
  ctx.fillText(name, 106, 1012);

  roundedRect(ctx, 62, 1082, 956, 106, 22, palette.green, palette.ink, 8);
  ctx.fillStyle = palette.accent;
  ctx.textAlign = 'left';
  ctx.font = '800 17px "Space Mono", monospace';
  ctx.fillText('HH GOA BUILDER', 94, 1119);
  ctx.fillStyle = '#FFFFFF';
  const classSize = fitText(ctx, builderClass, 820, 36, 25, 'Syne', 800);
  ctx.font = `800 ${classSize}px "Syne", sans-serif`;
  ctx.fillText(builderClass, 94, 1163);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 25px "Space Mono", monospace';
  ctx.fillText('HHGOA.COM', 64, 1254);
  ctx.font = '700 16px "Space Mono", monospace';
  ctx.fillStyle = palette.accent;
  ctx.fillText('HHGOA.COM · TASK 01', 64, 1288);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 34px "Space Mono", monospace';
  ctx.fillText('▌▌ ▌ ▌▌▌ ▌ ▌▌', 1016, 1258);
  ctx.font = '700 14px "Space Mono", monospace';
  ctx.fillText(builderId, 1016, 1288);
}

function getSquadLayout(count) {
  if (count <= 2) {
    return [
      { x: 96, y: 356, w: 430, h: 600 },
      { x: 554, y: 356, w: 430, h: 600 },
    ];
  }
  if (count === 3) {
    return [
      { x: 70, y: 356, w: 300, h: 750 },
      { x: 390, y: 356, w: 300, h: 750 },
      { x: 710, y: 356, w: 300, h: 750 },
    ];
  }
  return [
    { x: 96, y: 356, w: 430, h: 350 },
    { x: 554, y: 356, w: 430, h: 350 },
    { x: 96, y: 734, w: 430, h: 350 },
    { x: 554, y: 734, w: 430, h: 350 },
  ];
}

function drawSquad(ctx, state, palette) {
  const members = state.teamMembers.filter((member) => member.photo?.image || member.name || member.role).slice(0, 4);
  const visibleMembers = members.length ? members : state.teamMembers.slice(0, 2);
  const teamName = (state.teamName || 'YOUR CREW').trim().toUpperCase();
  const layout = getSquadLayout(visibleMembers.length);

  drawOfficialBackdrop(ctx, state, palette, 1080, 1350);
  roundedRect(ctx, 28, 28, 1024, 1294, 42, null, palette.ink, 12);
  drawBrandLockup(ctx, state.brandAssets, 58, 36, 650, 126);
  drawStudioMark(ctx, state.brandAssets, 906, 44, 118, 94);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 17px "Space Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('28—31 OCT 2026', 1016, 170);
  ctx.fillText('GOA, INDIA', 1016, 196);

  roundedRect(ctx, 64, 188, 952, 100, 20, palette.panel, palette.ink, 9);
  ctx.fillStyle = palette.pop;
  ctx.fillRect(64, 188, 18, 100);
  ctx.fillStyle = palette.ink;
  ctx.textAlign = 'left';
  const teamSize = fitText(ctx, teamName, 710, 56, 32, 'Syne', 800);
  ctx.font = `800 ${teamSize}px "Syne", sans-serif`;
  ctx.fillText(teamName.slice(0, 34), 104, 254);
  roundedRect(ctx, 824, 210, 164, 56, 16, palette.accent, palette.ink, 5);
  ctx.fillStyle = palette.ink;
  ctx.font = '800 18px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`CREW OF ${visibleMembers.length}`, 906, 246);

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.font = '800 28px "Space Mono", monospace';
  ctx.fillText('HH GOA TEAM FRAME', 64, 332);

  ctx.save();
  ctx.globalAlpha = 0.36;
  roundedRect(ctx, 54, 344, 972, 778, 34, '#002A1A', palette.accent, 6);
  ctx.restore();

  visibleMembers.forEach((member, index) => {
    const box = layout[index];
    const bandHeight = 104;
    roundedRect(ctx, box.x, box.y, box.w, box.h, 22, palette.panel, palette.ink, 9);
    drawPhotoCover(ctx, member.photo, box.x + 16, box.y + 16, box.w - 32, box.h - bandHeight - 38, 10);
    roundedRect(ctx, box.x + 16, box.y + 16, box.w - 32, box.h - bandHeight - 38, 10, null, palette.ink, 5);
    ctx.save();
    ctx.fillStyle = palette.ink;
    ctx.textAlign = 'left';
    const memberName = (member.name || `BUILDER ${index + 1}`).toUpperCase();
    const memberNameSize = fitText(ctx, memberName, box.w - 82, 30, 19, 'Syne', 800);
    ctx.font = `800 ${memberNameSize}px "Syne", sans-serif`;
    ctx.fillText(memberName, box.x + 28, box.y + box.h - 62);
    ctx.fillStyle = palette.green;
    ctx.font = '700 16px "Space Mono", monospace';
    ctx.fillText((member.role || 'BUILDER').toUpperCase().slice(0, 30), box.x + 28, box.y + box.h - 29);
    ctx.restore();

    roundedRect(ctx, box.x + box.w - 68, box.y + 24, 44, 44, 12, index % 2 ? palette.pop : palette.accent, palette.ink, 5);
    ctx.fillStyle = index % 2 ? '#FFFFFF' : palette.ink;
    ctx.textAlign = 'center';
    ctx.font = '800 18px "Space Mono", monospace';
    ctx.fillText(String(index + 1).padStart(2, '0'), box.x + box.w - 46, box.y + 53);
  });

  roundedRect(ctx, 64, 1144, 952, 134, 24, palette.panel, palette.ink, 9);
  drawPalmMark(ctx, 126, 1212, 60, palette.green);
  ctx.textAlign = 'left';
  ctx.fillStyle = palette.ink;
  ctx.font = '800 30px "Space Mono", monospace';
  ctx.fillText('HH GOA TEAM FRAME', 188, 1202);
  ctx.fillStyle = palette.green;
  ctx.font = '700 17px "Space Mono", monospace';
  ctx.fillText('REAL TEAMMATES · ONE COMBINED FRAME', 188, 1240);
  ctx.textAlign = 'right';
  ctx.fillStyle = palette.pop;
  ctx.font = '800 34px "Syne", sans-serif';
  ctx.fillText('HH GOA ’26', 984, 1226);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 15px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('HHGOA.COM · BUILT TOGETHER · 28—31 OCT 2026', 540, 1310);
}

export function drawBuilderGraphic(canvas, mode, state) {
  if (!canvas) return;
  const size = OUTPUT_SIZES[mode];
  const palette = PALETTES[state.palette] || PALETTES.jungle;
  canvas.width = size.width;
  canvas.height = size.height;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, size.width, size.height);

  if (mode === 'pfp') drawPfp(ctx, state, palette);
  else if (mode === 'squad') drawSquad(ctx, state, palette);
  else drawPass(ctx, state, palette);
}
