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

// Whole words only. Unanchored fragments used to fire on ordinary text: "ml" hit
// HTML, and "ai" hit names like Nair or Jain, so plenty of people were labelled
// AI / Data Builder for no reason.
const BUILDER_CLASSES = [
  { label: 'Design Builder', test: /\b(design|designer|figma|ui|ux|visual|brand)\b/ },
  { label: 'Web3 Builder', test: /\b(blockchain|web3|solidity|crypto|onchain|ethereum)\b/ },
  { label: 'AI / Data Builder', test: /\b(ai|ml|llm|nlp|model|models|data|genai)\b/ },
  { label: 'Mobile Builder', test: /\b(mobile|ios|android|flutter|swift|kotlin|react native)\b/ },
  { label: 'Systems Builder', test: /\b(rust|system|systems|infra|infrastructure|devops|cloud|platform|kubernetes)\b/ },
  { label: 'Frontend Builder', test: /\b(frontend|front end|react|web|javascript|typescript|next|nextjs|svelte|vue|css)\b/ },
  { label: 'Backend Builder', test: /\b(backend|back end|api|apis|node|python|java|golang|go|django|rails)\b/ },
  { label: 'Product Builder', test: /\b(product|founder|growth|pm|marketing)\b/ },
];

// Driven by the stack field only. The name has no bearing on what someone builds.
export function getBuilderClass(name, role) {
  const source = String(role || '').toLowerCase();
  return BUILDER_CLASSES.find(({ test }) => test.test(source))?.label || 'HH Goa Builder';
}

export function getPassNumber(name, role) {
  return String((hashString(`${name}|${role}`) % 900000) + 100000);
}

export function getBuilderId(name, role) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  const raw = words.length > 1
    ? words.map((word) => word[0]).join('')
    : (words[0] || '');
  const initials = raw.replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase() || 'GOA';
  return `HHG26-${initials}-${getPassNumber(name, role).slice(-4)}`;
}

// A teammate only counts once they have both a photo and a name, so the preview
// shows exactly what the download will contain.
export function getTeamRoster(teamMembers = []) {
  const ready = teamMembers.filter((member) => member.photo?.image && member.name.trim());
  return ready.length >= 2 ? ready.slice(0, 4) : [];
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
  if (!image) return null;
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  const scale = Math.min(width / imageWidth, height / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  return { x: drawX, y: drawY, width: drawWidth, height: drawHeight };
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

// The गोवा badge sits over the R of HACKER. These ratios are measured against the
// wordmark itself, not the box it was fitted into, so the lockup holds together at
// any size (same numbers as .brand-hindi in style.css).
const HINDI_LEFT_RATIO = 0.419;
const HINDI_TOP_RATIO = -0.062;
const HINDI_SIZE_RATIO = 0.216;

function drawBrandLockup(ctx, assets, x, y, width, height) {
  if (assets?.wordmark) {
    const mark = drawImageContain(ctx, assets.wordmark, x, y, width, height);
    if (assets.hindi && mark) {
      const hindiSize = mark.width * HINDI_SIZE_RATIO;
      drawImageContain(
        ctx,
        assets.hindi,
        mark.x + mark.width * HINDI_LEFT_RATIO,
        mark.y + mark.height * HINDI_TOP_RATIO,
        hindiSize,
        hindiSize,
      );
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
  ctx.fillText('28–31 OCT 2026', 1002, 208);
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
  const teamName = (state.teamName || 'FLYING SOLO').trim().toUpperCase();

  drawOfficialBackdrop(ctx, state, palette, 1080, 1350);
  roundedRect(ctx, 28, 28, 1024, 1294, 42, null, palette.ink, 12);
  drawTicketEdge(ctx, palette, 1350);

  drawBrandLockup(ctx, state.brandAssets, 62, 42, 670, 136);
  drawStudioMark(ctx, state.brandAssets, 906, 46, 118, 94);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 18px "Space Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('28–31 OCT 2026', 1016, 172);
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
  ctx.fillText('HACKER HOUSE GOA', 90, 846);
  ctx.fillStyle = palette.green;
  ctx.font = '800 19px "Space Mono", monospace';
  ctx.fillText('28–31 OCT 2026', 90, 878);

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
  ctx.fillText('TEAM', 710, 704);
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

  // Seat the footer on a solid strip. Left over bare artwork it was unreadable.
  roundedRect(ctx, 62, 1212, 956, 84, 18, palette.ink, palette.accent, 5);
  ctx.fillStyle = palette.accent;
  ctx.textAlign = 'left';
  ctx.font = '800 22px "Space Mono", monospace';
  ctx.fillText('HHGOA.COM', 96, 1262);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 16px "Space Mono", monospace';
  ctx.fillText('TASK 01', 984, 1262);
}

// Every layout fills the frame down to y=1106 so no arrangement leaves a dead gap
// above the footer band.
function getSquadLayout(count) {
  if (count <= 2) {
    return [
      { x: 96, y: 356, w: 430, h: 750 },
      { x: 554, y: 356, w: 430, h: 750 },
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
    { x: 96, y: 356, w: 430, h: 365 },
    { x: 554, y: 356, w: 430, h: 365 },
    { x: 96, y: 741, w: 430, h: 365 },
    { x: 554, y: 741, w: 430, h: 365 },
  ];
}

function drawSquad(ctx, state, palette) {
  const roster = getTeamRoster(state.teamMembers);
  const visibleMembers = roster.length ? roster : state.teamMembers.slice(0, 2);
  const teamName = (state.teamName || 'YOUR CREW').trim().toUpperCase();
  const layout = getSquadLayout(visibleMembers.length);

  drawOfficialBackdrop(ctx, state, palette, 1080, 1350);
  roundedRect(ctx, 28, 28, 1024, 1294, 42, null, palette.ink, 12);
  drawBrandLockup(ctx, state.brandAssets, 58, 36, 650, 126);
  drawStudioMark(ctx, state.brandAssets, 906, 44, 118, 94);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 17px "Space Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('28–31 OCT 2026', 1016, 170);
  ctx.fillText('GOA, INDIA', 1016, 196);

  roundedRect(ctx, 64, 188, 952, 100, 20, palette.panel, palette.ink, 9);
  ctx.fillStyle = palette.pop;
  ctx.fillRect(64, 188, 18, 100);
  ctx.fillStyle = palette.ink;
  ctx.textAlign = 'left';
  const teamSize = fitText(ctx, teamName, 700, 56, 32, 'Syne', 800);
  ctx.font = `800 ${teamSize}px "Syne", sans-serif`;
  ctx.fillText(teamName, 104, 254);
  roundedRect(ctx, 824, 210, 164, 56, 16, palette.accent, palette.ink, 5);
  ctx.fillStyle = palette.ink;
  ctx.font = '800 18px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`CREW OF ${visibleMembers.length}`, 906, 246);

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
  ctx.fillText('HHGOA.COM · 28–31 OCT 2026', 188, 1240);
  ctx.textAlign = 'right';
  ctx.fillStyle = palette.pop;
  ctx.font = '800 34px "Syne", sans-serif';
  ctx.fillText('HH GOA ’26', 984, 1226);
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
