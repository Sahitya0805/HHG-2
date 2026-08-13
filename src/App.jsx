import React, { useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import BuilderCanvas from './components/BuilderCanvas.jsx';
import { getBuilderClass, getTeamRoster, OUTPUT_SIZES } from './lib/drawCard.js';

const MODES = [
  {
    id: 'pfp',
    eyebrow: '01 / PFP',
    name: 'Goa PFP',
    description: 'Square, for your profile picture',
  },
  {
    id: 'pass',
    eyebrow: '02 / ID',
    name: 'Builder ID',
    description: 'Your photo, name and what you build',
  },
  {
    id: 'squad',
    eyebrow: '03 / TEAM',
    name: 'Team Frame',
    description: 'Two to four of you on one poster',
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
    image.onerror = () => reject(new Error('Could not read that file. A JPG or PNG usually works.'));
    image.src = url;
  });
}

async function preparePhoto(file) {
  if (!file) return null;
  if (!/^image\//.test(file.type) && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) {
    throw new Error('That does not look like an image file.');
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error('That photo is over 20 MB. Pick a smaller one.');
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
      throw new Error('Could not convert that HEIC. Export it as a JPG and try again.');
    }
  }

  // Decode first, then hand the blob URL straight back. The decoded bitmap lives on
  // the image element from here on, so holding the URL open would just leak memory.
  const url = URL.createObjectURL(blob);
  try {
    const image = await loadImage(url);
    if (image.decode) await image.decode().catch(() => {});
    return {
      image,
      fileName: file.name,
      filter: 'normal',
      crop: { zoom: 1, x: 0, y: 0 },
    };
  } finally {
    URL.revokeObjectURL(url);
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
        tabIndex={-1}
        aria-hidden="true"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        onChange={(event) => {
          acceptFile(event.target.files?.[0]);
          // Without this, picking the same file twice fires no change event, so
          // re-choosing a photo you just reset would silently do nothing.
          event.target.value = '';
        }}
      />
      <button
        type="button"
        className="upload-trigger"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          acceptFile(event.dataTransfer.files?.[0]);
        }}
      >
        <span className="upload-icon" aria-hidden="true">{photo ? '✓' : '+'}</span>
        <span>
          <strong>{photo ? 'Photo added' : label}</strong>
          <small>{photo ? photo.fileName : 'JPG, PNG, WebP or iPhone HEIC, up to 20 MB'}</small>
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
  const previewRef = useRef(null);
  const [mode, setMode] = useState('pass');
  const palette = 'jungle';
  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [badgeText, setBadgeText] = useState('FRAME IN GOA');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState([newMember(0), newMember(1)]);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [generatedMode, setGeneratedMode] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const say = (message, tone = 'info') => setNotice({ message, tone, key: Date.now() });

  // Successes clear themselves; errors stay put until the next action.
  useEffect(() => {
    if (!notice || notice.tone === 'error') return undefined;
    const timer = window.setTimeout(() => setNotice(null), 7000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const state = useMemo(() => ({
    palette,
    photo,
    name,
    role,
    badgeText,
    teamName,
    teamMembers,
  }), [badgeText, name, photo, role, teamMembers, teamName]);

  const builderClass = getBuilderClass(name, role);
  const completeTeamMembers = getTeamRoster(teamMembers);
  const canGenerate = mode === 'pfp'
    ? Boolean(photo)
    : mode === 'pass'
      ? Boolean(photo && name.trim() && role.trim())
      : Boolean(teamName.trim() && completeTeamMembers.length >= 2);

  const replacePhoto = async (file, commit) => {
    setBusy(true);
    say('Reading the photo…');
    try {
      commit(await preparePhoto(file));
      say('Photo is in. Nudge the zoom or position if the crop looks off.');
    } catch (error) {
      say(error.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const updateMember = (id, patch) => {
    setTeamMembers((members) => members.map((member) => member.id === id ? { ...member, ...patch } : member));
  };

  const uploadMemberPhoto = (id, file) => replacePhoto(file, (nextPhoto) => {
    updateMember(id, { photo: nextPhoto });
    setSelectedMemberId(id);
  });

  const removeMember = (id) => {
    setTeamMembers((members) => members.filter((item) => item.id !== id));
    if (selectedMemberId === id) setSelectedMemberId(null);
  };

  const selectedMember = teamMembers.find((member) => member.id === selectedMemberId);

  const handleGenerate = () => {
    if (!canGenerate) {
      say(mode === 'squad'
        ? 'Needs a team name, plus at least two teammates who each have a name and a photo.'
        : mode === 'pass'
          ? 'Fill in the photo, name and stack first.'
          : 'Pick a photo first.', 'error');
      return;
    }

    setGeneratedMode(mode);
    say('Done. Save it, or send it straight to X.');
    // On narrow screens the preview sits above the controls, so without this the
    // button appears to do nothing.
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    saveFile(dataUrlToFile(canvas.toDataURL('image/png'), outputName()));
    say('Saved to your downloads. Keep the #FrameInGoa tag on the post.');
  };

  const shareToX = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const liveLink = `${window.location.origin}${window.location.pathname}`;
    const crewNames = completeTeamMembers
      .map((member) => member.name.trim().split(/\s+/)[0])
      .join(' · ')
      .slice(0, 62);
    const buildCaption = () => {
      if (mode === 'squad') {
        return `${teamName || 'Our team'} for Hacker House Goa '26 🌴\n\n${crewNames}`;
      }
      if (mode === 'pfp') {
        return "My Hacker House Goa '26 frame 🌴";
      }
      // Skip the role line rather than leaving a blank one behind when it is empty.
      return [
        "My Hacker House Goa '26 builder ID 🌴",
        '',
        `${name || 'Builder'} · ${builderClass}`,
        role.trim(),
      ].filter((line, index) => index < 3 || line).join('\n');
    };

    const caption = `${buildCaption()}\n\nMake yours: ${liveLink}\n\n#FrameInGoa @247pmstudio`;

    // Build the file up front: everything below has to stay inside the click gesture
    // or the browser will swallow the popup.
    const file = dataUrlToFile(canvas.toDataURL('image/png'), outputName());

    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ files: [file], title: 'HH Goa 2026', text: caption });
        say('Share sheet is open with the image attached. Pick X from there.');
        return;
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
    }

    const intentUrl = `https://x.com/intent/post?text=${encodeURIComponent(caption)}`;
    const postWindow = window.open('about:blank', '_blank');
    if (postWindow) postWindow.opener = null;
    saveFile(file);

    let copied = false;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': file })]);
        copied = true;
      }
    } catch {
      // Clipboard images are blocked in plenty of browsers. The download still works.
    }

    const opened = postWindow || window.open(intentUrl, '_blank', 'noopener,noreferrer');
    if (postWindow) postWindow.location.href = intentUrl;

    if (!opened) {
      say('Your browser blocked the new tab. The PNG is in your downloads, so open X yourself and attach it.', 'error');
    } else if (copied) {
      say('X is open. The PNG is in your downloads and on the clipboard, so paste it into the post.');
    } else {
      say('X is open. Attach the PNG that just downloaded before you post.');
    }
  };

  return (
    <div className="app-shell">
      <Header />

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="kicker"><span /> TASK 01 · #FRAMEINGOA</p>
            <h1>Build your HH Goa <em>frame.</em></h1>
            <p className="hero-description">
              Drop in a photo, type your details, save the PNG. It all runs in this tab.
            </p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <img src="/brand/goa-sunrise.webp" alt="" />
            <span className="hero-art-number">01</span>
            <strong>#FrameInGoa</strong>
          </div>
        </section>

        <section className="mode-picker" aria-label="Choose an output format">
          {MODES.map((option) => (
            <button
              type="button"
              key={option.id}
              className={mode === option.id ? 'active' : ''}
              onClick={() => { setMode(option.id); setGeneratedMode(null); setNotice(null); }}
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
                    <div><strong>Upload photo</strong></div>
                  </div>
                  <PhotoUpload
                    id="solo-photo"
                    label="Drop a photo of yourself"
                    photo={photo}
                    onPhoto={(file) => replacePhoto(file, setPhoto)}
                  />
                  <p className="photo-rule">It has to be a real photo of you. No AI art, no stock images.</p>
                  <CropControls photo={photo} onChange={setPhoto} />
                </div>

                {mode === 'pass' ? (
                  <div className="panel">
                    <div className="panel-title">
                      <span className="step-number">02</span>
                      <div><strong>Your details</strong></div>
                    </div>
                    <Field label="Builder name" hint={`${name.length}/28`}>
                      <input value={name} maxLength={28} onChange={(event) => setName(event.target.value)} placeholder="Ravi Sharma" />
                    </Field>
                    <Field label="Stack / role" hint={`${role.length}/38`}>
                      <input value={role} maxLength={38} onChange={(event) => setRole(event.target.value)} placeholder="React · Product · Open source" />
                    </Field>
                    <Field label="Team name" hint="Optional">
                      <input value={teamName} maxLength={34} onChange={(event) => setTeamName(event.target.value)} placeholder="Your team" />
                    </Field>
                    <Field label="Builder class" hint="Picked from your stack">
                      <div className="generated-class">
                        <span>{builderClass}</span>
                      </div>
                    </Field>
                  </div>
                ) : (
                  <div className="panel">
                    <div className="panel-title">
                      <span className="step-number">02</span>
                      <div><strong>Frame text</strong></div>
                    </div>
                    <Field label="Frame headline" hint={`${badgeText.length}/36`}>
                      <input value={badgeText} maxLength={36} onChange={(event) => setBadgeText(event.target.value)} placeholder="FRAME IN GOA" />
                    </Field>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="panel">
                  <div className="panel-title">
                    <span className="step-number">01</span>
                    <div><strong>Team name</strong></div>
                  </div>
                  <Field label="Team name" hint={`${teamName.length}/34`}>
                    <input value={teamName} maxLength={34} onChange={(event) => setTeamName(event.target.value)} placeholder="Team name" />
                  </Field>
                </div>

                <div className="panel">
                  <div className="panel-title team-title-row">
                    <span className="step-number">02</span>
                    <div><strong>Team photos</strong><small>Two to four people</small></div>
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
                          label="Add a photo"
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
                  <p className="photo-rule">Real photos of the actual teammates. A name and a photo each, or they will not show up on the frame.</p>

                  {selectedMember?.photo ? (
                    <div className="member-crop-panel">
                      <span>Adjusting {selectedMember.name || 'this teammate'}</span>
                      <CropControls photo={selectedMember.photo} onChange={(nextPhoto) => updateMember(selectedMember.id, { photo: nextPhoto })} />
                    </div>
                  ) : null}
                </div>
              </>
            )}

            <button type="button" className="generate-button" disabled={busy} onClick={handleGenerate}>
              <span>{busy ? 'READING PHOTO…' : `GENERATE ${mode === 'pfp' ? 'PFP FRAME' : mode === 'squad' ? 'TEAM FRAME' : 'BUILDER ID'}`}</span>
              <b>↗</b>
            </button>
            <p className="privacy-note">Nothing gets uploaded. Your photos never leave this tab.</p>
          </div>

          <aside className="preview-column" ref={previewRef}>
            <div className="preview-toolbar">
              <div><span className="live-dot" /> LIVE OUTPUT</div>
              <span>{OUTPUT_SIZES[mode].label} PNG</span>
            </div>
            <div className={`preview-stage preview-${mode}`}>
              <BuilderCanvas ref={canvasRef} mode={mode} state={state} />
            </div>

            <div className={`result-actions ${generatedMode === mode ? 'visible' : ''}`}>
              <div>
                <strong>{generatedMode === mode ? 'Your PNG is ready.' : 'Nothing generated yet.'}</strong>
                <small>{generatedMode === mode ? 'Save it, or send it over to X.' : 'The preview keeps up as you type.'}</small>
              </div>
              <div className="action-buttons">
                <button type="button" className="download-button" disabled={generatedMode !== mode} onClick={downloadCanvas}>Download PNG</button>
                <button type="button" className="share-button" disabled={generatedMode !== mode} onClick={shareToX}>Share to X ↗</button>
              </div>
            </div>
            <p className="share-explainer">X will not pick the image up on its own from a desktop browser, so attach the download yourself.</p>
            <div className="post-check" aria-label="Checklist before posting">
              <strong>BEFORE POSTING</strong>
              <span>✓ Real photo</span>
              <span>✓ PNG attached</span>
              <span>✓ Live link</span>
              <span>✓ #FrameInGoa</span>
            </div>
          </aside>
        </section>

      </main>

      {notice ? (
        <div
          key={notice.key}
          className={`notice notice-${notice.tone}`}
          role={notice.tone === 'error' ? 'alert' : 'status'}
          aria-live={notice.tone === 'error' ? 'assertive' : 'polite'}
        >
          <span>{notice.message}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message">×</button>
        </div>
      ) : null}

      <footer>
        <span>HH GOA 2026 · TASK 01</span>
        <span>#FrameInGoa</span>
      </footer>
    </div>
  );
}
