import React, { useEffect, useRef, useState } from 'react';
import { isRecordingSupported, startRecording } from '../lib/recorder.js';
import { getStrategies } from '../lib/api.js';

export default function VoiceRecorder({
  onTextSubmit, onVoiceSubmit, isProcessing, strategy, setStrategy,
  sttConfigured, sttDetail,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [text, setText] = useState('');
  const [strategies, setStrategies] = useState([]);
  const [micError, setMicError] = useState(null);
  const sessionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    getStrategies().then((d) => setStrategies(d.strategies || [])).catch(() => {});
    return () => clearInterval(timerRef.current);
  }, []);

  const begin = async () => {
    setMicError(null);
    try {
      sessionRef.current = await startRecording();
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (e) {
      setMicError(`Microphone unavailable: ${e.message}`);
    }
  };

  const end = async () => {
    clearInterval(timerRef.current);
    setIsRecording(false);
    const session = sessionRef.current;
    sessionRef.current = null;
    if (!session) return;
    const blob = await session.stop();
    if (blob.size > 0) onVoiceSubmit(blob);
  };

  const recordingSupported = isRecordingSupported();
  const micDisabled = isProcessing || !recordingSupported || !sttConfigured;

  return (
    <div className="hero-voice-section glass-panel">
      <div className="hero-sticker-badge">Handcrafted in Goa 🌴 #RAGInGoa</div>

      <div className="hero-brand-strip">
        <img src="/brand/hacker-house.png" alt="Hacker House" style={{ height: '44px' }} />
        <img src="/brand/goa-hindi.svg" alt="Goa" style={{ height: '38px' }} />
        <img src="/brand/247pm.svg" alt="247PM" style={{ height: '30px', opacity: 0.9 }} />
      </div>

      <h1 className="hero-title">
        Voice-First Grounded Search <span className="brand-serif">on the Beach</span>
      </h1>
      <p className="hero-subtitle">
        Ask a question by voice or text. EchoRAG transcribes with Sarvam, retrieves from the
        real ai4bharat/MSMARCO-XI corpus, and answers only from what it retrieved.
      </p>

      {sttConfigured === false && (
        <div style={{
          margin: '1rem auto', maxWidth: '640px', padding: '0.75rem 1rem',
          border: '2px solid #b45309', borderRadius: '12px', background: '#fef3c7',
          color: '#7c2d12', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700,
        }}>
          🎙️ Voice input disabled — no Sarvam API key configured on the server.
          <div style={{ fontWeight: 500, marginTop: '4px' }}>{sttDetail}</div>
          <div style={{ fontWeight: 500, marginTop: '4px' }}>Typed questions run the full pipeline.</div>
        </div>
      )}
      {!recordingSupported && (
        <div style={{ color: '#b91c1c', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          This browser does not support MediaRecorder.
        </div>
      )}
      {micError && (
        <div style={{ color: '#b91c1c', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{micError}</div>
      )}

      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center',
        gap: '0.5rem', margin: '1rem 0 1.5rem', background: 'rgba(246, 240, 223, 0.6)',
        padding: '0.75rem 1.25rem', borderRadius: '16px', border: '2px solid var(--card-border)',
      }}>
        <span style={{
          fontSize: '0.8rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-display)',
          fontWeight: 800, marginRight: '8px', textTransform: 'uppercase',
        }}>
          🧪 Chunking strategy:
        </span>
        {strategies.map((s) => (
          <button
            key={s.name}
            className="query-chip"
            title={s.description}
            disabled={!s.loaded}
            style={strategy === s.name
              ? { background: 'var(--card-border)', color: '#fff', padding: '0.3rem 0.7rem', fontSize: '0.78rem' }
              : { padding: '0.3rem 0.7rem', fontSize: '0.78rem', opacity: s.loaded ? 1 : 0.4 }}
            onClick={() => setStrategy(s.name)}
          >
            {s.name}{s.stats ? ` (${s.stats.chunks.toLocaleString()})` : ''}
          </button>
        ))}
      </div>

      <div className="mic-button-wrapper">
        <button
          className={`mic-button ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? end : begin}
          disabled={micDisabled}
          title={sttConfigured === false ? 'Sarvam API key not configured' : 'Record a question'}
        >
          {isRecording ? '⏹' : '🎙️'}
        </button>
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.95rem',
        color: isRecording ? 'var(--vintage-pink)' : 'var(--ink)',
        fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>
        {isRecording
          ? `● RECORDING ${seconds}s — click ⏹ to transcribe with Sarvam`
          : isProcessing ? 'Running pipeline…' : 'Ask a question'}
      </div>

      {isRecording && (
        <div className="waveform-bars">
          {[0.1, 0.3, 0.2, 0.4, 0.15, 0.35, 0.25].map((d, i) => (
            <div key={i} className="bar active" style={{ animationDelay: `${d}s` }} />
          ))}
        </div>
      )}

      <div style={{ maxWidth: '680px', margin: '1.75rem auto 0', textAlign: 'left' }}>
        <form onSubmit={(e) => { e.preventDefault(); onTextSubmit(text); }}>
          <label style={{
            fontSize: '0.85rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-display)',
            fontWeight: 800, display: 'block', marginBottom: '8px',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            📝 Type a question
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="query-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. what is a corporation?"
              style={{
                flex: 1, padding: '0.85rem 1.25rem', borderRadius: '16px',
                border: '2.5px solid var(--card-border)', background: '#fff',
                color: 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: '1.05rem',
                fontWeight: 600, outline: 'none', boxShadow: '3px 3px 0px var(--card-border)',
              }}
            />
            <button
              type="submit" className="btn-primary"
              disabled={isProcessing || !text.trim()}
              style={{ padding: '0.85rem 1.5rem', borderRadius: '16px', whiteSpace: 'nowrap' }}
            >
              {isProcessing ? 'Searching…' : '⚡ Search'}
            </button>
          </div>
        </form>
      </div>

      <div className="quick-queries">
        <span style={{
          fontSize: '0.82rem', color: 'var(--ink-muted)', width: '100%', marginBottom: '4px',
          fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontWeight: 700,
        }}>
          🌴 Try these:
        </span>
        {['what is a corporation?', 'what causes high blood pressure?', 'how long does it take to become a nurse?']
          .map((q) => (
            <button key={q} className="query-chip" onClick={() => { setText(q); onTextSubmit(q); }}>
              &quot;{q}&quot;
            </button>
          ))}
        <button
          className="query-chip abstain-chip"
          onClick={() => { const q = 'What is the population of Mars in 2090?'; setText(q); onTextSubmit(q); }}
        >
          🛡️ &quot;population of Mars in 2090?&quot; (should abstain)
        </button>
      </div>
    </div>
  );
}
