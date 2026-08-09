import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import heic2any from 'heic2any';
import { toPng } from 'html-to-image';

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

const ROLES = [
  'Full Stack Developer',
  'Frontend Wizard',
  'Backend Engineer',
  'Protocol Architect',
  'Product Designer',
  'Smart Contract Dev',
  'Solana Builder',
];

const NAMES = ['Sahitya Singh', 'Ananya Sharma', 'Dev Rohan', 'Alex Rivera', 'Vikram Das'];

export default function App() {
  const [format, setFormat] = useState('pfp_frame');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [dataUrl, setDataUrl] = useState(null);

  const [data, setData] = useState({
    name: 'Sahitya Singh',
    role: 'Full Stack Developer',
    title: '🌴 Pixel Surfer',
    theme: 'emerald',
    filter: 'normal',
    serial: 'PASS #' + Math.floor(100000 + Math.random() * 900000),
    zoom: 1.0,
    offsetX: 0,
    offsetY: 0,
    stickers: ['🌴', '⚡'],
  });

  const cardRef = useRef(null);
  const fileInputRef = useRef(null);

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

    const url = URL.createObjectURL(blob);
    setPhotoUrl(url);
    setPhotoLoaded(true);
  };

  const handleRandomTitle = () => {
    const random = TITLES[Math.floor(Math.random() * TITLES.length)];
    setData((prev) => ({ ...prev, title: random }));
  };

  const handleSurpriseMe = () => {
    const rName = NAMES[Math.floor(Math.random() * NAMES.length)];
    const rRole = ROLES[Math.floor(Math.random() * ROLES.length)];
    const rTitle = TITLES[Math.floor(Math.random() * TITLES.length)];
    const themes = ['emerald', 'sunset', 'cyber', 'retro'];
    const rTheme = themes[Math.floor(Math.random() * themes.length)];

    setData((prev) => ({
      ...prev,
      name: rName,
      role: rRole,
      title: rTitle,
      theme: rTheme,
      serial: 'PASS #' + Math.floor(100000 + Math.random() * 900000),
    }));
  };

  const toggleSticker = (st) => {
    setData((prev) => {
      const exists = prev.stickers.includes(st);
      const updated = exists ? prev.stickers.filter((s) => s !== st) : [...prev.stickers, st];
      return { ...prev, stickers: updated };
    });
  };

  const handleGenerate = async () => {
    if (!cardRef.current) return;
    try {
      const url = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      setDataUrl(url);
      setIsGenerated(true);
      confetti({ particleCount: 70, spread: 60, colors: ['#FFD400', '#FF087C', '#08733F'] });
    } catch (err) {
      console.error('Export error:', err);
    }
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

  const getFilterStyle = () => {
    if (data.filter === 'warm') return { filter: 'sepia(0.3) contrast(1.1) saturate(1.2)' };
    if (data.filter === 'bw') return { filter: 'grayscale(1) contrast(1.2)' };
    if (data.filter === 'vibrant') return { filter: 'saturate(1.7) contrast(1.1)' };
    return {};
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="section-label">
                    {format === 'pfp_frame' ? 'Option A — Goa Profile Frame' : 'Option B — Builder ID Card'}
                  </span>
                  <button onClick={handleSurpriseMe} className="btn-surprise">
                    🎲 Surprise Me!
                  </button>
                </div>

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

                {photoLoaded && (
                  <div style={{ marginTop: '14px' }}>
                    <span className="section-label">Photo Filter</span>
                    <div className="filter-picker">
                      {[
                        { id: 'normal', label: 'Normal' },
                        { id: 'warm', label: '🌴 Warm' },
                        { id: 'bw', label: '🕶️ B&W' },
                        { id: 'vibrant', label: '⚡ Vivid' },
                      ].map((f) => (
                        <div
                          key={f.id}
                          onClick={() => setData((prev) => ({ ...prev, filter: f.id }))}
                          className={`filter-item ${data.filter === f.id ? 'active' : ''}`}
                        >
                          {f.label}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
                      <div>
                        <span className="section-label">Zoom ({Math.round(data.zoom * 100)}%)</span>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.05"
                          value={data.zoom}
                          onChange={(e) => setData((prev) => ({ ...prev, zoom: parseFloat(e.target.value) }))}
                          className="range-slider"
                        />
                      </div>

                      <div>
                        <span className="section-label">Pan X ({data.offsetX}px)</span>
                        <input
                          type="range"
                          min="-150"
                          max="150"
                          step="5"
                          value={data.offsetX}
                          onChange={(e) => setData((prev) => ({ ...prev, offsetX: parseInt(e.target.value) }))}
                          className="range-slider"
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <span className="section-label">Pan Y ({data.offsetY}px)</span>
                      <input
                        type="range"
                        min="-150"
                        max="150"
                        step="5"
                        value={data.offsetY}
                        onChange={(e) => setData((prev) => ({ ...prev, offsetY: parseInt(e.target.value) }))}
                        className="range-slider"
                      />
                    </div>
                  </div>
                )}
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

                  <div className="form-group">
                    <label>Badge Theme Color</label>
                    <div className="theme-picker">
                      {[
                        { id: 'emerald', label: 'Jungle' },
                        { id: 'sunset', label: 'Sunset' },
                        { id: 'cyber', label: 'Cyber' },
                        { id: 'retro', label: 'Retro' },
                      ].map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setData((prev) => ({ ...prev, theme: t.id }))}
                          className={`theme-item ${data.theme === t.id ? 'active' : ''}`}
                        >
                          {t.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Goa Stickers</label>
                    <div className="sticker-picker">
                      {['🌴', '🍹', '🚀', '⚡', '🌊', '🕶️'].map((st) => (
                        <div
                          key={st}
                          onClick={() => toggleSticker(st)}
                          className={`sticker-item ${data.stickers.includes(st) ? 'active' : ''}`}
                        >
                          {st}
                        </div>
                      ))}
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
                Live HTML Preview
              </span>

              <div className="dom-card-container">
                <div ref={cardRef}>
                  {format === 'id_card' ? (
                    <div className={`id-card-wrapper theme-${data.theme}`}>
                      <div className="id-card-header-bar">
                        <span className="left">2:47 PM STUDIO</span>
                        <span className="right">28 — 31 OCT 2026</span>
                      </div>

                      <div className="id-card-inner">
                        <div className="id-card-title-row">
                          <div className="id-card-main-title">HACKER HOUSE</div>
                          <div className="id-card-goa-badge">गोवा 🌴</div>
                        </div>

                        <div className="id-card-sub-title">GOA, INDIA • BUILDER ID CARD</div>
                        <div className="id-card-divider" />

                        <div className="id-card-photo-box">
                          <div className="id-card-verified-badge">VERIFIED BUILDER</div>
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt="Photo"
                              className="id-card-photo-img"
                              style={{
                                transform: `scale(${data.zoom}) translate(${data.offsetX}px, ${data.offsetY}px)`,
                                ...getFilterStyle(),
                              }}
                            />
                          ) : (
                            <div className="id-card-photo-placeholder">YOUR PHOTO</div>
                          )}
                        </div>

                        {data.stickers.length > 0 && (
                          <div className="id-card-stickers-column">
                            {data.stickers.map((s) => (
                              <span key={s}>{s}</span>
                            ))}
                          </div>
                        )}

                        <div className="id-card-name">{(data.name || 'YOUR NAME HERE').toUpperCase()}</div>

                        <div>
                          <div className="id-card-role-pill">{(data.role || 'FULL STACK DEVELOPER').toUpperCase()}</div>
                        </div>

                        <div className="id-card-title-box">
                          <span className="id-card-title-label">BUILDER CLASS</span>
                          <div className="id-card-title-text">"{data.title || '🌴 CODE SURFER'}"</div>
                        </div>

                        <div className="id-card-footer">
                          <div className="id-card-barcode">|||| ||| ||||</div>
                          <div className="id-card-hashtag-badge">#FrameInGoa</div>
                          <div className="id-card-serial">
                            <div>{data.serial || 'PASS #849204'}</div>
                            <div style={{ color: '#6B7280', fontSize: '9px' }}>GOA, INDIA</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="pfp-frame-wrapper">
                      <div className="pfp-top-badge">🌴 HH GOA 2026 🌴</div>

                      <div className="pfp-avatar-circle">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt="Photo"
                            className="pfp-avatar-img"
                            style={{
                              transform: `scale(${data.zoom}) translate(${data.offsetX}px, ${data.offsetY}px)`,
                              ...getFilterStyle(),
                            }}
                          />
                        ) : (
                          <div style={{ color: '#FFFFFF', fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: '800' }}>
                            UPLOAD PHOTO
                          </div>
                        )}
                      </div>

                      <div className="pfp-bottom-badge">#FrameInGoa</div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
