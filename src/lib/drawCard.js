export const OUTPUT_SIZES = {
  pfp: { width: 1080, height: 1080, label: '1080 × 1080' },
  pass: { width: 1080, height: 1350, label: '1080 × 1350' },
  squad: { width: 1080, height: 1350, label: '1080 × 1350' },
};

export const PALETTES = {
  jungle: {
    label: 'Jungle radio',
    bg: '#043B28',
    panel: '#FFF8E7',
    ink: '#0B1611',
    green: '#08733F',
    accent: '#FFD400',
    pop: '#FF087C',
    soft: '#D9F4DF',
  },
  midnight: {
    label: 'Midnight build',
    bg: '#071D2D',
    panel: '#F7F1DF',
    ink: '#07131C',
    green: '#0B6E69',
    accent: '#A6FF4D',
    pop: '#FF6B35',
    soft: '#D5F4F0',
  },
  sunset: {
    label: 'Anjuna sunset',
    bg: '#4B1426',
    panel: '#FFF5DB',
    ink: '#20100F',
    green: '#A83B2F',
    accent: '#FFD33D',
    pop: '#FF5C8A',
    soft: '#FFE1C7',
  },
};

const CLASS_PREFIXES = ['Tidal', 'Monsoon', 'Midnight', 'Susegad', 'Coastal', 'Neon', 'Coconut', 'Sunset'];
const CLASS_FALLBACKS = ['System Shipper', 'Product Pirate', 'Prototype Pilot', 'Signal Builder', 'Bug Whisperer', 'Idea Surfer'];

export function hashString(value = '') {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

export function getBuilderClass(name, role, seed = 0) {
  const source = `${name}|${role}|${seed}`.toLowerCase();
  const hash = hashString(source);
  const prefix = CLASS_PREFIXES[hash % CLASS_PREFIXES.length];

  let builderType = CLASS_FALLBACKS[(hash >>> 3) % CLASS_FALLBACKS.length];
  if (/design|figma|ui|ux|visual/.test(source)) builderType = 'Pixel Alchemist';
  else if (/ai|ml|model|data/.test(source)) builderType = 'Model Whisperer';
  else if (/rust|system|infra|devops|cloud/.test(source)) builderType = 'Systems Diver';
  else if (/front|react|web|javascript|typescript/.test(source)) builderType = 'Interface Surfer';
  else if (/back|api|node|python|java|go/.test(source)) builderType = 'Backend Buccaneer';
  else if (/mobile|ios|android|flutter/.test(source)) builderType = 'Pocket Shipper';
  else if (/product|founder|growth/.test(source)) builderType = 'Product Navigator';
  else if (/blockchain|web3|solidity|crypto/.test(source)) builderType = 'Chain Cartographer';

  return `${prefix} ${builderType}`;
}

export function getPassNumber(name, role) {
  return String((hashString(`${name}|${role}`) % 900000) + 100000);
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
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, 1080, 1080);
  drawPattern(ctx, palette, 1080, 1080);

  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = palette.green;
  ctx.beginPath();
  ctx.arc(965, 96, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  roundedRect(ctx, 44, 42, 330, 86, 43, palette.accent, palette.ink, 8);
  ctx.fillStyle = palette.ink;
  ctx.font = '800 31px "Space Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('HH GOA / 26', 92, 96);
  drawPalmMark(ctx, 328, 85, 44, palette.ink);

  ctx.save();
  ctx.translate(918, 220);
  ctx.rotate(0.09);
  roundedRect(ctx, -110, -40, 220, 80, 20, palette.pop, palette.ink, 7);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 24px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('OPEN TRIAL 01', 0, 8);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(540, 545, 390, 0, Math.PI * 2);
  ctx.fillStyle = palette.accent;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(540, 545, 352, 0, Math.PI * 2);
  ctx.fillStyle = palette.ink;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(540, 545, 332, 0, Math.PI * 2);
  ctx.clip();
  drawPhotoCover(ctx, photo, 208, 213, 664, 664);
  ctx.restore();

  ctx.strokeStyle = palette.pop;
  ctx.lineWidth = 12;
  ctx.setLineDash([8, 20]);
  ctx.beginPath();
  ctx.arc(540, 545, 418, 0.05, Math.PI * 1.96);
  ctx.stroke();
  ctx.setLineDash([]);

  const badge = (badgeText || 'BUILDING FROM THE BEACH').toUpperCase().slice(0, 36);
  roundedRect(ctx, 170, 892, 740, 102, 26, palette.panel, palette.ink, 8);
  ctx.fillStyle = palette.ink;
  ctx.textAlign = 'center';
  const badgeSize = fitText(ctx, badge, 650, 36, 22, 'Syne', 800);
  ctx.font = `800 ${badgeSize}px "Syne", sans-serif`;
  ctx.fillText(badge, 540, 953);

  ctx.fillStyle = palette.panel;
  ctx.font = '700 22px "Space Mono", monospace';
  ctx.fillText('28–31 OCT · GOA, INDIA · #FrameInGoa', 540, 1040);
}

function drawPass(ctx, state, palette) {
  const name = (state.name || 'YOUR NAME').trim().toUpperCase();
  const role = (state.role || 'YOUR STACK / ROLE').trim().toUpperCase();
  const builderClass = getBuilderClass(state.name, state.role, state.classSeed);
  const passNumber = getPassNumber(state.name, state.role);

  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, 1080, 1350);
  drawPattern(ctx, palette, 1080, 1350);
  drawTicketEdge(ctx, palette, 1350);

  roundedRect(ctx, 68, 60, 944, 1230, 46, palette.panel, palette.ink, 10);
  roundedRect(ctx, 68, 60, 944, 156, 46, palette.green);
  ctx.fillStyle = palette.green;
  ctx.fillRect(68, 160, 944, 56);

  roundedRect(ctx, 98, 88, 92, 92, 24, palette.accent, palette.ink, 7);
  drawPalmMark(ctx, 144, 139, 48, palette.ink);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.font = '800 46px "Syne", sans-serif';
  ctx.fillText('HH GOA 2026', 220, 132);
  ctx.font = '700 20px "Space Mono", monospace';
  ctx.fillStyle = palette.accent;
  ctx.fillText('BUILDER PASS // OPEN TRIAL 01', 222, 170);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 18px "Space Mono", monospace';
  ctx.fillText('28—31 OCT', 962, 122);
  ctx.fillText('GOA, INDIA', 962, 154);

  drawPhotoCover(ctx, state.photo, 112, 258, 856, 520, 34);
  roundedRect(ctx, 112, 258, 856, 520, 34, null, palette.ink, 9);
  roundedRect(ctx, 138, 286, 236, 54, 18, palette.accent, palette.ink, 6);
  ctx.fillStyle = palette.ink;
  ctx.textAlign = 'center';
  ctx.font = '800 18px "Space Mono", monospace';
  ctx.fillText('VERIFIED BUILDER', 256, 321);

  roundedRect(ctx, 784, 704, 154, 50, 18, palette.pop, palette.ink, 6);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 17px "Space Mono", monospace';
  ctx.fillText(`NO. ${passNumber.slice(-3)}`, 861, 736);

  ctx.textAlign = 'left';
  ctx.fillStyle = palette.ink;
  const nameSize = fitText(ctx, name, 790, 70, 40, 'Syne', 800);
  ctx.font = `800 ${nameSize}px "Syne", sans-serif`;
  ctx.fillText(name, 112, 878);

  ctx.font = '700 22px "Space Mono", monospace';
  roundedRect(ctx, 112, 910, Math.min(820, Math.max(310, ctx.measureText(role.slice(0, 38)).width + 80)), 60, 24, palette.green);
  ctx.fillStyle = palette.accent;
  ctx.fillText(role.slice(0, 38), 148, 949);

  ctx.fillStyle = palette.green;
  ctx.font = '800 18px "Space Mono", monospace';
  ctx.fillText('GENERATED BUILDER CLASS', 112, 1034);
  ctx.fillStyle = palette.ink;
  const classSize = fitText(ctx, builderClass, 820, 42, 28, 'Syne', 800);
  ctx.font = `800 ${classSize}px "Syne", sans-serif`;
  ctx.fillText(builderClass, 112, 1084);

  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(112, 1130);
  ctx.lineTo(968, 1130);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = palette.ink;
  ctx.font = '800 26px "Space Mono", monospace';
  ctx.fillText('#FrameInGoa', 112, 1195);
  ctx.font = '700 17px "Space Mono", monospace';
  ctx.fillStyle = '#536158';
  ctx.fillText('ADMIT ONE BUILDER · SHIP OR SHIP', 112, 1234);

  ctx.textAlign = 'right';
  ctx.fillStyle = palette.ink;
  ctx.font = '800 40px "Space Mono", monospace';
  ctx.fillText('▌▌ ▌ ▌▌▌ ▌ ▌▌', 962, 1204);
  ctx.font = '700 15px "Space Mono", monospace';
  ctx.fillText(`PASS ${passNumber}`, 962, 1234);
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
      { x: 96, y: 356, w: 430, h: 390 },
      { x: 554, y: 356, w: 430, h: 390 },
      { x: 96, y: 774, w: 888, h: 330 },
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

  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, 1080, 1350);
  drawPattern(ctx, palette, 1080, 1350);

  ctx.fillStyle = palette.accent;
  ctx.font = '800 20px "Space Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('HH GOA 2026 // TEAM SIGNAL', 70, 76);
  ctx.textAlign = 'right';
  ctx.fillText('28—31 OCT · GOA', 1010, 76);

  ctx.textAlign = 'left';
  ctx.fillStyle = palette.panel;
  ctx.font = '800 82px "Syne", sans-serif';
  ctx.fillText('BUILD TOGETHER.', 70, 184);
  ctx.fillStyle = palette.pop;
  ctx.font = 'italic 68px "Instrument Serif", serif';
  ctx.fillText('Land in Goa.', 70, 253);

  roundedRect(ctx, 70, 282, 940, 58, 24, palette.green, palette.accent, 5);
  ctx.fillStyle = palette.accent;
  ctx.font = '800 24px "Space Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(teamName.slice(0, 34), 104, 320);
  ctx.textAlign = 'right';
  ctx.fillText(`CREW OF ${visibleMembers.length}`, 974, 320);

  visibleMembers.forEach((member, index) => {
    const box = layout[index];
    drawPhotoCover(ctx, member.photo, box.x, box.y, box.w, box.h, 28);
    roundedRect(ctx, box.x, box.y, box.w, box.h, 28, null, palette.ink, 8);

    const bandHeight = 94;
    ctx.save();
    roundedRect(ctx, box.x + 14, box.y + box.h - bandHeight - 14, box.w - 28, bandHeight, 22, palette.panel, palette.ink, 6);
    ctx.fillStyle = palette.ink;
    ctx.textAlign = 'left';
    const memberName = (member.name || `BUILDER ${index + 1}`).toUpperCase();
    const memberNameSize = fitText(ctx, memberName, box.w - 82, 30, 19, 'Syne', 800);
    ctx.font = `800 ${memberNameSize}px "Syne", sans-serif`;
    ctx.fillText(memberName, box.x + 38, box.y + box.h - 66);
    ctx.fillStyle = palette.green;
    ctx.font = '700 16px "Space Mono", monospace';
    ctx.fillText((member.role || 'BUILDER').toUpperCase().slice(0, 30), box.x + 38, box.y + box.h - 34);
    ctx.restore();

    roundedRect(ctx, box.x + box.w - 62, box.y + 18, 44, 44, 14, index % 2 ? palette.pop : palette.accent, palette.ink, 5);
    ctx.fillStyle = index % 2 ? '#FFFFFF' : palette.ink;
    ctx.textAlign = 'center';
    ctx.font = '800 18px "Space Mono", monospace';
    ctx.fillText(String(index + 1).padStart(2, '0'), box.x + box.w - 40, box.y + 47);
  });

  roundedRect(ctx, 70, 1144, 940, 132, 30, palette.panel, palette.ink, 8);
  drawPalmMark(ctx, 130, 1212, 62, palette.green);
  ctx.textAlign = 'left';
  ctx.fillStyle = palette.ink;
  ctx.font = '800 30px "Space Mono", monospace';
  ctx.fillText('#FrameInGoa', 192, 1205);
  ctx.fillStyle = palette.green;
  ctx.font = '700 17px "Space Mono", monospace';
  ctx.fillText('ONE CREW · ONE FRAME · NO FLUFF', 192, 1242);
  ctx.textAlign = 'right';
  ctx.fillStyle = palette.pop;
  ctx.font = '800 38px "Syne", sans-serif';
  ctx.fillText('GOA BOUND →', 970, 1227);
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
