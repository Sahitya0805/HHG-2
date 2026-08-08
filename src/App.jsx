import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import heic2any from 'heic2any';

const TITLES = [
  '🌴 Pixel Surfer',
  '🥥 Code Coconut',
  '💻 Beach Code Hacker',
  '🏄 Full Stack Surfer',
  '⛵ Debugging Nomad',
  '🧙 Goa Code Wizard',
  '🏴‍☠️ Product Pirate',
  '🌊 Rust Wave Rider',
  '⚡ Async Anjuna Hacker',
];

function drawRoundedRect(ctx, x, y, width, height, radius, fill = true, stroke = true) {
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

function renderCanvas(canvas, format, data, photoImg) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (format === 'id_card') {
    canvas.width = 1200;
    canvas.height = 1500;

    let bgColor = '#08733F';
    let cardBg = '#FFF9E7';

    if (data.theme === 'sunset') bgColor = '#7C1C08';
    if (data.theme === 'cyber') bgColor = '#1A0826';
    if (data.theme === 'retro') bgColor = '#1E3A2B';

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 1200, 1500);

    ctx.fillStyle = '#FFD400';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('2:47 PM STUDIO', 80, 75);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('28 — 31 OCT 2026', 1120, 75);

    const cardX = 80;
    const cardY = 120;
    const cardW = 1040;
    const cardH = 1300;

    ctx.fillStyle = '#000000';
    drawRoundedRect(ctx, cardX + 16, cardY + 16, cardW, cardH, 24, true, false);

    ctx.fillStyle = cardBg;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 24, true, true);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#005A35';
    ctx.font = '900 74px sans-serif';
    ctx.fillText('HACKER HOUSE', cardX + cardW / 2, cardY + 115);

    ctx.save();
    ctx.translate(cardX + cardW / 2 + 180, cardY + 68);
    ctx.rotate((-8 * Math.PI) / 180);
    ctx.fillStyle = '#FF087C';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, -75, -26, 150, 52, 16, true, true);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('गोवा 🌴', 0, 10);
    ctx.restore();

    ctx.fillStyle = '#4B5563';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('GOA, INDIA  •  BUILDER ID CARD', cardX + cardW / 2, cardY + 158);

    ctx.beginPath();
    ctx.moveTo(cardX + 50, cardY + 178);
    ctx.lineTo(cardX + cardW - 50, cardY + 178);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    const boxW = 460;
    const boxH = 460;
    const boxX = cardX + (cardW - boxW) / 2;
    const boxY = cardY + 205;

    ctx.fillStyle = '#000000';
    drawRoundedRect(ctx, boxX + 10, boxY + 10, boxW, boxH, 20, true, false);

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 20, true, true);

    ctx.save();
    ctx.beginPath();
    drawRoundedRect(ctx, boxX + 6, boxY + 6, boxW - 12, boxH - 12, 16, false, false);
    ctx.clip();

    if (photoImg) {
      const cx = boxX + boxW / 2;
      const cy = boxY + boxH / 2;
      const scale = Math.max((boxW - 12) / photoImg.width, (boxH - 12) / photoImg.height);
      const dw = photoImg.width * scale;
      const dh = photoImg.height * scale;

      ctx.translate(cx, cy);
      ctx.drawImage(photoImg, -dw / 2, -dh / 2, dw, dh);
    } else {
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(boxX + 6, boxY + 6, boxW - 12, boxH - 12);
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'bold 38px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('YOUR PHOTO', boxX + boxW / 2, boxY + boxH / 2);
    }
    ctx.restore();

    ctx.save();
    ctx.translate(boxX - 25, boxY + 30);
    ctx.rotate((-25 * Math.PI) / 180);
    ctx.fillStyle = '#FFD400';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, 0, 0, 165, 38, 6, true, true);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 17px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED BUILDER', 82, 24);
    ctx.restore();

    const nameY = boxY + boxH + 65;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 60px serif';
    ctx.fillText((data.name || 'YOUR NAME HERE').toUpperCase(), cardX + cardW / 2, nameY);

    const roleY = nameY + 52;
    const roleText = (data.role || 'FULL STACK DEVELOPER').toUpperCase();
    ctx.font = 'bold 26px monospace';
    const roleMetrics = ctx.measureText(roleText);
    const pillW = roleMetrics.width + 52;
    const pillX = cardX + (cardW - pillW) / 2;

    ctx.fillStyle = '#000000';
    drawRoundedRect(ctx, pillX + 4, roleY - 32 + 4, pillW, 48, 14, true, false);
    ctx.fillStyle = '#08733F';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, pillX, roleY - 32, pillW, 48, 14, true, true);
    ctx.fillStyle = '#FFD400';
    ctx.fillText(roleText, cardX + cardW / 2, roleY);

    const titleY = roleY + 90;
    const titleText = data.title || '🌴 CODE SURFER';
    const titleW = 760;
    const titleX = cardX + (cardW - titleW) / 2;

    ctx.fillStyle = '#000000';
    drawRoundedRect(ctx, titleX + 6, titleY - 46 + 6, titleW, 88, 16, true, false);
    ctx.fillStyle = '#FFD400';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    drawRoundedRect(ctx, titleX, titleY - 46, titleW, 88, 16, true, true);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 17px monospace';
    ctx.fillText('BUILDER CLASS', cardX + cardW / 2, titleY - 22);
    ctx.font = '800 42px sans-serif';
    ctx.fillText(`"${titleText}"`, cardX + cardW / 2, titleY + 22);

    const footerY = cardY + cardH - 85;

    ctx.fillStyle = '#000000';
    const barW = [4, 2, 6, 3, 2, 8, 3, 2, 5, 2, 4, 6, 2, 3, 8];
    let curX = cardX + 60;
    for (let i = 0; i < barW.length; i++) {
      ctx.fillRect(curX, footerY - 25, barW[i], 50);
      curX += barW[i] + 3;
    }

    ctx.save();
    ctx.translate(cardX + cardW / 2, footerY + 10);
    ctx.fillStyle = '#FF087C';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, -120, -22, 240, 46, 12, true, true);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 22px sans-serif';
    ctx.fillText('#FrameInGoa', 0, 8);
    ctx.restore();

    ctx.textAlign = 'right';
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('OCT 28-31, 2026', cardX + cardW - 60, footerY);
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#4B5563';
    ctx.fillText('GOA, INDIA', cardX + cardW - 60, footerY + 24);

  } else {
    canvas.width = 1200;
    canvas.height = 1200;

    ctx.fillStyle = '#08733F';
    ctx.fillRect(0, 0, 1200, 1200);

    const cx = 600;
    const cy = 600;
    const r = 420;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    if (photoImg) {
      const scale = Math.max((r * 2) / photoImg.width, (r * 2) / photoImg.height);
      const dw = photoImg.width * scale;
      const dh = photoImg.height * scale;

      ctx.translate(cx, cy);
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
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#FFD400';
    ctx.fillText('GOA, INDIA  •  28—31 OCT 2026', 0, 28);
    ctx.restore();
  }
}

export default function App() {
  const [format, setFormat] = useState('pfp_frame');
  const [photoImg, setPhotoImg] = useState(null);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [dataUrl, setDataUrl] = useState(null);

  const [data, setData] = useState({
    name: 'Sahitya Singh',
    role: 'Full Stack Developer',
    title: '🌴 Pixel Surfer',
    theme: 'emerald',
  });

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderCanvas(canvasRef.current, format, data, photoImg);
    }
  }, [format, data, photoImg]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let blob = file;
    if (file.name.toLowerCase().endsWith('.heic') || file.type.includes('heic')) {
      try {
        const converted = await heic2any({ blob: file, toType: 'image/png' });
        blob = Array.isArray(converted) ? converted[0] : converted;
      } catch (err) {
        console.warn('HEIC fallback:', err);
      }
    }

    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setPhotoImg(img);
      setPhotoLoaded(true);
    };
    img.src = objectUrl;
  };

  const handleRandomTitle = () => {
    const random = TITLES[Math.floor(Math.random() * TITLES.length)];
    setData((prev) => ({ ...prev, title: random }));
  };

  const handleGenerate = () => {
    if (!canvasRef.current) return;
    renderCanvas(canvasRef.current, format, data, photoImg);
    const url = canvasRef.current.toDataURL('image/png');
    setDataUrl(url);
    setIsGenerated(true);
    try {
      confetti({ particleCount: 70, spread: 60, colors: ['#FFD400', '#FF087C', '#08733F'] });
    } catch (e) {}
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `hhgoa-2026-${(data.name || 'builder').toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  };

  const handleShareX = () => {
    const formatLabel = format === 'pfp_frame' ? 'Profile Frame' : 'Builder ID Card';
    const text = `Just got my HH Goa 2026 ${formatLabel} 🌴💻\n\nReady to build in Goa.\n\n#FrameInGoa #HHGoa26`;
    window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="brand-badge">🌴</div>
          <div>
            <div className="brand-title">HH GOA 2026</div>
            <div className="brand-sub">28–31 OCT 2026 • GOA, INDIA</div>
          </div>
        </div>
        <div className="hashtag-pill">#FrameInGoa</div>
      </header>

      <main className="main-container">
        <h1 className="hero-title">
          Build your frame. <span>Show your Goa.</span>
        </h1>
        <p className="hero-subtitle">
          Create your HH Goa 2026 identity card or profile frame in seconds.
        </p>

        <div className="format-switcher">
          <button
            onClick={() => { setFormat('pfp_frame'); setIsGenerated(false); }}
            className={`btn-option ${format === 'pfp_frame' ? 'active-a' : ''}`}
          >
            🌴 Option A: Profile Frame
          </button>

          <button
            onClick={() => { setFormat('id_card'); setIsGenerated(false); }}
            className={`btn-option ${format === 'id_card' ? 'active-b' : ''}`}
          >
            🪪 Option B: Builder ID Card
          </button>
        </div>

        {isGenerated && dataUrl ? (
          <div className="result-card">
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--hh-yellow)', fontSize: '28px', fontWeight: '800' }}>
              Your Identity Graphic is Ready! 🌴
            </h2>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--hot-pink)', fontSize: '15px', fontWeight: '800', marginTop: '6px' }}>
              Post on X with mandatory hashtag #FrameInGoa
            </p>

            <img src={dataUrl} alt="HH Goa Graphic" />

            <div className="actions-row">
              <button onClick={handleDownload} className="btn-starburst" style={{ width: 'auto', padding: '14px 28px', fontSize: '16px' }}>
                Download PNG
              </button>

              <button onClick={handleShareX} className="btn-pink">
                Share to X
              </button>
            </div>

            <div style={{ marginTop: '22px' }}>
              <button
                onClick={() => setIsGenerated(false)}
                style={{ background: 'none', border: 'none', color: 'var(--cream)', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: '700', textDecoration: 'underline', cursor: 'pointer' }}
              >
                ← Edit / Create Another
              </button>
            </div>
          </div>
        ) : (
          <div className="studio-grid">
            <div>
              <div className="card-panel">
                <span className="section-label">
                  {format === 'pfp_frame' ? 'Option A — Goa Profile Frame' : 'Option B — Builder ID Card'}
                </span>

                <span className="section-label" style={{ marginTop: '14px' }}>1. Upload Photo (JPG, PNG, HEIC)</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,.heic"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />

                <button onClick={() => fileInputRef.current?.click()} className="upload-btn">
                  📷 {photoLoaded ? 'Photo Loaded! (Click to Change)' : 'Choose or Drag Photo Here'}
                </button>
              </div>

              {format === 'id_card' && (
                <div className="card-panel">
                  <span className="section-label">2. Enter Builder Information</span>

                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={data.name}
                      onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Sahitya Singh"
                    />
                  </div>

                  <div className="form-group">
                    <label>Stack / Role</label>
                    <input
                      type="text"
                      className="form-input"
                      value={data.role}
                      onChange={(e) => setData((prev) => ({ ...prev, role: e.target.value }))}
                      placeholder="e.g. Full Stack Developer"
                    />
                  </div>

                  <div className="form-group">
                    <label>Builder Title</label>
                    <div className="input-row">
                      <input
                        type="text"
                        className="form-input"
                        value={data.title}
                        onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))}
                      />
                      <button onClick={handleRandomTitle} className="btn-pink" style={{ padding: '10px 18px', fontSize: '14px' }}>
                        ✨ Title
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={handleGenerate} className="btn-starburst">
                ✨ {format === 'pfp_frame' ? 'Generate My Goa Profile Frame' : 'Generate My HH Goa Builder ID'}
              </button>
            </div>

            <div className="preview-panel">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: '800', color: 'var(--hh-yellow)', display: 'block', marginBottom: '14px' }}>
                Live Canvas Preview
              </span>
              <div className="preview-canvas-wrapper">
                <canvas ref={canvasRef} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
