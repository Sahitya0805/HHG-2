import React, { useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header.jsx';
import BuilderCanvas from './components/BuilderCanvas.jsx';
import { getBuilderClass, OUTPUT_SIZES, PALETTES } from './lib/drawCard.js';

const MODES = [
  {
    id: 'pfp',
    eyebrow: '01 / PROFILE',
    name: 'Goa PFP',
    description: 'A bold square frame made for your X profile.',
  },
  {
    id: 'pass',
    eyebrow: '02 / SOLO',
    name: 'Builder ID',
    description: 'Your photo, stack, team and generated builder class.',
  },
  {
    id: 'squad',
    eyebrow: '03 / TEAM',
    name: 'Squad Signal',
    description: 'Bring your whole crew into one combined frame.',
  },
];

const FILTERS = [
  { id: 'normal', label: 'Natural' },
  { id: 'warm', label: 'Warm' },
  { id: 'vivid', label: 'Vivid' },
  { id: 'mono', label: 'Mono' },
];

const newMember = (index) => ({
  id: `${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
  name: '',
  role: '',
  photo: null,
});

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('That photo could not be read. Try a JPG or PNG instead.'));
    image.src = url;
  });
}

async function preparePhoto(file) {
  if (!file) return null;
  if (file.size > 20 * 1024 * 1024) {
    throw new Error('Please choose a photo smaller than 20 MB.');
  }

  const fileName = file.name.toLowerCase();
  const isHeic = fileName.endsWith('.heic') || fileName.endsWith('.heif') || /hei[cf]/i.test(file.type);
  let blob = file;

  if (isHeic) {
    try {
      const { default: heic2any } = await import('heic2any');
      const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
      blob = Array.isArray(converted) ? converted[0] : converted;
    } catch {
      throw new Error('This HEIC photo could not be converted. Try exporting it as JPG first.');
    }
  }

  const url = URL.createObjectURL(blob);
  try {
    const image = await loadImage(url);
    return {
      image,
      url,
      fileName: file.name,
      filter: 'normal',
      crop: { zoom: 1, x: 0, y: 0 },
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

function dataUrlToFile(dataUrl, fileName) {
  const [header, encoded] = dataUrl.split(',');
  const mime = header.match(/data:(.*?);base64/)?.[1] || 'image/png';
  const bytes = atob(encoded);
  const buffer = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index += 1) buffer[index] = bytes.charCodeAt(index);
  return new File([buffer], fileName, { type: mime });
}

function safeFileName(value) {
  return (value || 'builder')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'builder';
}

function PhotoUpload({ id, label, photo, onPhoto, compact = false }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const acceptFile = (file) => {
    if (file) onPhoto(file);
  };

  return (
    <div className={`upload-shell ${dragging ? 'is-dragging' : ''} ${compact ? 'is-compact' : ''}`}>
      <input
        ref={inputRef}
        id={id}
        className="visually-hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        onChange={(event) => acceptFile(event.target.files?.[0])}
      />
      <button
        type="button"
        className="upload-trigger"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          acceptFile(event.dataTransfer.files?.[0]);
        }}
      >
        <span className="upload-icon" aria-hidden="true">{photo ? '✓' : '+'}</span>
        <span>
          <strong>{photo ? 'Photo ready' : label}</strong>
          <small>{photo ? photo.fileName : 'JPG, PNG, WebP or iPhone HEIC · up to 20 MB'}</small>
        </span>
        <span className="upload-action">{photo ? 'Replace' : 'Choose'}</span>
      </button>
    </div>
  );
}

function CropControls({ photo, onChange }) {
  if (!photo) return null;
  const updateCrop = (key, value) => onChange({
    ...photo,
    crop: { ...photo.crop, [key]: Number(value) },
  });

  return (
    <div className="crop-controls">
      <div className="control-heading">
        <span>Photo fit</span>
        <button
          type="button"
          className="text-button"
          onClick={() => onChange({ ...photo, crop: { zoom: 1, x: 0, y: 0 }, filter: 'normal' })}
        >
          Reset
        </button>
      </div>

      <div className="filter-row" aria-label="Photo filter">
        {FILTERS.map((filter) => (
          <button
            type="button"
            key={filter.id}
            className={photo.filter === filter.id ? 'active' : ''}
            onClick={() => onChange({ ...photo, filter: filter.id })}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <label className="range-control">
        <span>Zoom <b>{Math.round(photo.crop.zoom * 100)}%</b></span>
        <input type="range" min="1" max="2" step="0.02" value={photo.crop.zoom} onChange={(event) => updateCrop('zoom', event.target.value)} />
      </label>
      <div className="range-pair">
        <label className="range-control">
          <span>Left / right</span>
          <input type="range" min="-100" max="100" step="1" value={photo.crop.x} onChange={(event) => updateCrop('x', event.target.value)} />
        </label>
        <label className="range-control">
          <span>Up / down</span>
          <input type="range" min="-100" max="100" step="1" value={photo.crop.y} onChange={(event) => updateCrop('y', event.target.value)} />
        </label>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="field">
      <div className="field-label">
        <span>{label}</span>
        {hint ? <small>{hint}</small> : null}
      </div>
      {children}
    </div>
  );
}

export default function App() {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('pass');
  const [palette, setPalette] = useState('jungle');
  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [badgeText, setBadgeText] = useState('BUILDING FROM THE BEACH');
  const [classSeed, setClassSeed] = useState(0);
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState([newMember(0), newMember(1)]);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [generatedMode, setGeneratedMode] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const state = useMemo(() => ({
    palette,
    photo,
    name,
    role,
    badgeText,
    classSeed,
    teamName,
    teamMembers,
  }), [badgeText, classSeed, name, palette, photo, role, teamMembers, teamName]);

  const builderClass = getBuilderClass(name, role, classSeed);
  const completeTeamMembers = teamMembers.filter((member) => member.photo && member.name.trim());
  const canGenerate = mode === 'pfp'
    ? Boolean(photo)
    : mode === 'pass'
      ? Boolean(photo && name.trim() && role.trim())
      : Boolean(teamName.trim() && completeTeamMembers.length >= 2);

  const replacePhoto = async (file, currentPhoto, commit) => {
    setBusy(true);
    setNotice('Preparing your photo…');
    try {
      const nextPhoto = await preparePhoto(file);
      if (currentPhoto?.url) URL.revokeObjectURL(currentPhoto.url);
      commit(nextPhoto);
      setNotice('Photo fitted automatically. Fine-tune it only if you want.');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  };

  const updateMember = (id, patch) => {
    setTeamMembers((members) => members.map((member) => member.id === id ? { ...member, ...patch } : member));
  };

  const uploadMemberPhoto = async (id, file) => {
    const current = teamMembers.find((member) => member.id === id);
    await replacePhoto(file, current?.photo, (nextPhoto) => {
      updateMember(id, { photo: nextPhoto });
      setSelectedMemberId(id);
    });
  };

  const removeMember = (id) => {
    setTeamMembers((members) => {
      const member = members.find((item) => item.id === id);
      if (member?.photo?.url) URL.revokeObjectURL(member.photo.url);
      return members.filter((item) => item.id !== id);
    });
    if (selectedMemberId === id) setSelectedMemberId(null);
  };

  const selectedMember = teamMembers.find((member) => member.id === selectedMemberId);

  const handleGenerate = () => {
    if (!canGenerate) {
      setNotice(mode === 'squad'
        ? 'Add a team name and at least two teammates with names and photos.'
        : mode === 'pass'
          ? 'Add your photo, name and stack before generating the pass.'
          : 'Add a photo before generating the frame.');
      return;
    }

    setGeneratedMode(mode);
    setNotice('Your high-resolution graphic is ready to download or share.');
    confetti({
      particleCount: 110,
      spread: 76,
      origin: { y: 0.72 },
      colors: ['#FFD400', '#FF087C', '#08733F', '#FFF8E7'],
    });
  };

  const outputName = () => {
    const identity = mode === 'squad' ? teamName : name;
    return `hhgoa-2026-${mode}-${safeFileName(identity)}.png`;
  };

  const saveFile = (file) => {
    const anchor = document.createElement('a');
    const url = URL.createObjectURL(file);
    anchor.href = url;
    anchor.download = file.name;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const file = dataUrlToFile(canvas.toDataURL('image/png', 1), outputName());
    saveFile(file);
    setNotice('PNG downloaded. Keep #FrameInGoa in your X post.');
  };

  const shareToX = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const liveLink = `${window.location.origin}${window.location.pathname}`;
    const crewNames = completeTeamMembers
      .map((member) => member.name.trim().split(/\s+/)[0])
      .join(' · ')
      .slice(0, 62);
    const caption = mode === 'squad'
      ? `Our crew ${teamName || ''} is in the frame for Hacker House Goa '26 🌴\n\n${crewNames}\n\nMake your crew frame: ${liveLink}\n\nWhich team should frame in next?\n\n#FrameInGoa @247pmstudio`
      : `I'm in the frame for Hacker House Goa '26 🌴\n\n${name || 'Builder'} · ${builderClass}\n${role || ''}\n\nCreate yours: ${liveLink}\n\nWhat are you shipping in Goa? 👇\n\n#FrameInGoa @247pmstudio`;
    const file = dataUrlToFile(canvas.toDataURL('image/png', 1), outputName());

    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ files: [file], title: 'HH Goa 2026', text: caption });
        setNotice('Share sheet opened with the graphic attached. Choose X and post.');
        return;
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
    }

    const intentUrl = `https://x.com/intent/post?text=${encodeURIComponent(caption)}`;
    const postWindow = window.open('about:blank', '_blank');
    if (postWindow) postWindow.opener = null;
    saveFile(file);
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': file })]);
        if (postWindow) postWindow.location.href = intentUrl;
        setNotice('X opened, the PNG was downloaded and copied. Paste or attach it before posting.');
        return;
      }
    } catch {
      // Fall through to the universal download fallback.
    }

    if (postWindow) postWindow.location.href = intentUrl;
    else window.open(intentUrl, '_blank', 'noopener,noreferrer');
    setNotice('X opened with the live link and hashtag. Attach the downloaded PNG before posting.');
  };

  return (
    <div className="app-shell">
      <Header />

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="kicker"><span /> HH GOA OPEN TRIAL · TASK 01</p>
            <h1>Make your builder signal <em>impossible to miss.</em></h1>
            <p className="hero-description">
              Upload once. Get a crisp, share-ready HH Goa graphic—solo or with your whole crew.
            </p>
          </div>
          <div className="deadline-card">
            <span className="deadline-label">SUBMIT BEFORE</span>
            <strong>13 AUG · 11:59 PM</strong>
            <small>One submission per team</small>
          </div>
        </section>

        <section className="mode-picker" aria-label="Choose an output format">
          {MODES.map((option) => (
            <button
              type="button"
              key={option.id}
              className={mode === option.id ? 'active' : ''}
              onClick={() => { setMode(option.id); setGeneratedMode(null); setNotice(''); }}
            >
              <span className="mode-index">{option.eyebrow}</span>
              <strong>{option.name}</strong>
              <small>{option.description}</small>
              <span className="mode-arrow">↗</span>
            </button>
          ))}
        </section>

        <section className="studio">
          <div className="controls-column">
            {mode !== 'squad' ? (
              <>
                <div className="panel">
                  <div className="panel-title">
                    <span className="step-number">01</span>
                    <div><strong>Bring the photo</strong><small>We auto-fit every aspect ratio.</small></div>
                  </div>
                  <PhotoUpload
                    id="solo-photo"
                    label="Drop your real builder selfie"
                    photo={photo}
                    onPhoto={(file) => replacePhoto(file, photo, setPhoto)}
                  />
                  <p className="photo-rule">Use your own real photo. AI portraits, Ghibli art and random images are rejected.</p>
                  <CropControls photo={photo} onChange={setPhoto} />
                </div>

                {mode === 'pass' ? (
                  <div className="panel">
                    <div className="panel-title">
                      <span className="step-number">02</span>
                      <div><strong>Make it yours</strong><small>Short, sharp and readable on mobile.</small></div>
                    </div>
                    <Field label="Builder name" hint={`${name.length}/28`}>
                      <input value={name} maxLength={28} onChange={(event) => setName(event.target.value)} placeholder="Ravi Sharma" />
                    </Field>
                    <Field label="Stack / role" hint={`${role.length}/38`}>
                      <input value={role} maxLength={38} onChange={(event) => setRole(event.target.value)} placeholder="React · Product · Open source" />
                    </Field>
                    <Field label="Team name" hint="Optional · makes your ID distinct">
                      <input value={teamName} maxLength={34} onChange={(event) => setTeamName(event.target.value)} placeholder="Your team" />
                    </Field>
                    <Field label="Generated builder class" hint="Based on your stack">
                      <div className="generated-class">
                        <span>{builderClass}</span>
                        <button type="button" onClick={() => setClassSeed((seed) => seed + 1)}>Remix</button>
                      </div>
                    </Field>
                  </div>
                ) : (
                  <div className="panel">
                    <div className="panel-title">
                      <span className="step-number">02</span>
                      <div><strong>Set your signal</strong><small>One line, maximum energy.</small></div>
                    </div>
                    <Field label="Frame headline" hint={`${badgeText.length}/36`}>
                      <input value={badgeText} maxLength={36} onChange={(event) => setBadgeText(event.target.value)} placeholder="BUILDING FROM THE BEACH" />
                    </Field>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="panel">
                  <div className="panel-title">
                    <span className="step-number">01</span>
                    <div><strong>Name the crew</strong><small>This becomes the spine of your team poster.</small></div>
                  </div>
                  <Field label="Team name" hint={`${teamName.length}/34`}>
                    <input value={teamName} maxLength={34} onChange={(event) => setTeamName(event.target.value)} placeholder="Team name" />
                  </Field>
                </div>

                <div className="panel">
                  <div className="panel-title team-title-row">
                    <span className="step-number">02</span>
                    <div><strong>Add the builders</strong><small>Two to four teammates, one combined frame.</small></div>
                    {teamMembers.length < 4 ? (
                      <button type="button" className="small-button" onClick={() => setTeamMembers((members) => [...members, newMember(members.length)])}>+ Add</button>
                    ) : null}
                  </div>

                  <div className="member-list">
                    {teamMembers.map((member, index) => (
                      <article key={member.id} className={`member-card ${selectedMemberId === member.id ? 'active' : ''}`}>
                        <div className="member-head">
                          <span>BUILDER {String(index + 1).padStart(2, '0')}</span>
                          {teamMembers.length > 2 ? <button type="button" onClick={() => removeMember(member.id)}>Remove</button> : null}
                        </div>
                        <PhotoUpload
                          id={`member-${member.id}`}
                          label="Add teammate photo"
                          photo={member.photo}
                          compact
                          onPhoto={(file) => uploadMemberPhoto(member.id, file)}
                        />
                        <div className="member-fields">
                          <input value={member.name} maxLength={24} onFocus={() => setSelectedMemberId(member.id)} onChange={(event) => updateMember(member.id, { name: event.target.value })} placeholder="Name" aria-label={`Builder ${index + 1} name`} />
                          <input value={member.role} maxLength={30} onFocus={() => setSelectedMemberId(member.id)} onChange={(event) => updateMember(member.id, { role: event.target.value })} placeholder="Role / stack" aria-label={`Builder ${index + 1} role`} />
                        </div>
                        {member.photo ? <button type="button" className="crop-select" onClick={() => setSelectedMemberId(member.id)}>Adjust this crop</button> : null}
                      </article>
                    ))}
                  </div>
                  <p className="photo-rule">Real teammate photos only. The combined frame is explicitly required by Task 01.</p>

                  {selectedMember?.photo ? (
                    <div className="member-crop-panel">
                      <span>Adjusting {selectedMember.name || 'selected teammate'}</span>
                      <CropControls photo={selectedMember.photo} onChange={(nextPhoto) => updateMember(selectedMember.id, { photo: nextPhoto })} />
                    </div>
                  ) : null}
                </div>
              </>
            )}

            <div className="panel theme-panel">
              <div className="panel-title compact-title">
                <span className="step-number">{mode === 'squad' ? '03' : '03'}</span>
                <div><strong>Choose the edition</strong><small>Official branding stays recognizable in every version.</small></div>
              </div>
              <div className="palette-picker">
                {Object.entries(PALETTES).map(([id, colors]) => (
                  <button type="button" key={id} className={palette === id ? 'active' : ''} onClick={() => setPalette(id)}>
                    <span className="swatches"><i style={{ background: colors.bg }} /><i style={{ background: colors.accent }} /><i style={{ background: colors.pop }} /></span>
                    <span>{colors.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="generate-button" disabled={busy} onClick={handleGenerate}>
              <span>{busy ? 'PROCESSING PHOTO…' : `GENERATE ${mode === 'pfp' ? 'PFP FRAME' : mode === 'squad' ? 'SQUAD SIGNAL' : 'BUILDER ID'}`}</span>
              <b>↗</b>
            </button>
            <p className="privacy-note">Photos stay in your browser. Nothing is uploaded or stored.</p>
          </div>

          <aside className="preview-column">
            <div className="preview-toolbar">
              <div><span className="live-dot" /> LIVE OUTPUT</div>
              <span>{OUTPUT_SIZES[mode].label} PNG</span>
            </div>
            <div className={`preview-stage preview-${mode}`}>
              <BuilderCanvas ref={canvasRef} mode={mode} state={state} />
            </div>

            <div className={`result-actions ${generatedMode === mode ? 'visible' : ''}`}>
              <div>
                <strong>{generatedMode === mode ? 'Ready for the HH Goa Radar.' : 'Finish the details, then generate.'}</strong>
                <small>{generatedMode === mode ? 'The caption includes the live link, exact hashtag and a genuine reply prompt.' : 'The preview updates as you type.'}</small>
              </div>
              <div className="action-buttons">
                <button type="button" className="download-button" disabled={generatedMode !== mode} onClick={downloadCanvas}>Download PNG</button>
                <button type="button" className="share-button" disabled={generatedMode !== mode} onClick={shareToX}>Share to X ↗</button>
              </div>
            </div>
            <p className="share-explainer">On supported phones, Share to X sends the image itself. Desktop copies the PNG for one-paste posting, with download as a universal fallback.</p>
            <div className="post-check" aria-label="X post rejection check">
              <strong>ZERO-REJECTION POST CHECK</strong>
              <span>✓ Your real photo</span>
              <span>✓ PNG attached</span>
              <span>✓ Live generator link</span>
              <span>✓ Exact #FrameInGoa</span>
            </div>
          </aside>
        </section>

        <div className="notice" role="status" aria-live="polite">{notice || 'Tip: use Squad Signal for the combined teammate frame requested in Task 01.'}</div>

        <section className="proof-strip">
          <span>NO LOGIN</span><i />
          <span>AUTO-FIT PHOTOS</span><i />
          <span>REAL 1080PX PNG</span><i />
          <span>MOBILE IMAGE SHARE</span><i />
          <span>#FRAMEINGOA READY</span>
        </section>
      </main>

      <footer>
        <span>BUILT FOR HH GOA 2026 · OPEN TRIAL 01</span>
        <span>28—31 OCT · GOA, INDIA</span>
      </footer>
    </div>
  );
}
