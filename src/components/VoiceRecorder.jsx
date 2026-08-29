import React, { useEffect, useRef, useState } from 'react';
import { isRecordingSupported, startRecording } from '../lib/recorder.js';

const LANGUAGES = [
  ['hi-IN', 'Hindi'],
  ['bn-IN', 'Bengali'],
  ['gu-IN', 'Gujarati'],
  ['kn-IN', 'Kannada'],
  ['ml-IN', 'Malayalam'],
  ['mr-IN', 'Marathi'],
  ['od-IN', 'Odia'],
  ['pa-IN', 'Punjabi'],
  ['ta-IN', 'Tamil'],
  ['te-IN', 'Telugu'],
  ['en-IN', 'English'],
];

const EXAMPLES = [
  'what is a corporation?',
  'what causes high blood pressure?',
  'how long does it take to become a nurse?',
];

function formatMs(value) {
  return value == null ? '-' : `${value}ms`;
}

function LiveBenchmarkProof({ benchmark, benchmarkError }) {
  if (benchmarkError) {
    return (
      <aside className="proof-panel unavailable">
        <strong>Benchmark unavailable</strong>
        <span>The benchmark endpoint did not return a report.</span>
      </aside>
    );
  }

  if (!benchmark) {
    return (
      <aside className="proof-panel" aria-label="Loading benchmark proof">
        {['P50', 'P70', 'P100', '<200ms'].map((label) => (
          <div className="proof-card skeleton" key={label}>
            <span>{label}</span>
            <strong />
          </div>
        ))}
      </aside>
    );
  }

  const latency = benchmark.latency_ms || {};
  const under = benchmark.under_200ms || {};

  return (
    <aside className="proof-panel" aria-label="Live benchmark proof">
      <div className="proof-card">
        <span>P50</span>
        <strong>{formatMs(latency.p50)}</strong>
      </div>
      <div className="proof-card">
        <span>P70</span>
        <strong>{formatMs(latency.p70)}</strong>
      </div>
      <div className="proof-card">
        <span>P100</span>
        <strong>{formatMs(latency.p100)}</strong>
      </div>
      <div className="proof-card accent">
        <span>Under 200ms</span>
        <strong>{under.pct == null ? '-' : `${under.pct}%`}</strong>
      </div>
      <p className="proof-footnote">
        {benchmark.generated_at} · {benchmark.queries_measured} queries · pipeline latency excludes Sarvam network call
      </p>
    </aside>
  );
}

export default function VoiceRecorder({
  onTextSubmit,
  onVoiceSubmit,
  onOpenVideo,
  isProcessing,
  phase,
  strategy,
  setStrategy,
  strategies,
  language,
  setLanguage,
  sttConfigured,
  sttDetail,
  backendUnavailable,
  benchmark,
  benchmarkError,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [text, setText] = useState('');
  const [micError, setMicError] = useState(null);
  const sessionRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const textRef = useRef('');

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
  }, []);

  const begin = async () => {
    setMicError(null);
    setPermissionRequested(true);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!sttConfigured && SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.lang = language || 'en-IN';
        rec.continuous = false;
        rec.interimResults = true;

        rec.onstart = () => {
          setIsRecording(true);
          setPermissionRequested(false);
          setSeconds(0);
          timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
        };

        rec.onresult = (event) => {
          const transcript = Array.from(event.results).map((r) => r[0].transcript).join('');
          setText(transcript);
          textRef.current = transcript;
        };

        rec.onerror = (event) => {
          if (event.error !== 'no-speech') {
            setMicError(`Voice error: ${event.error}`);
          }
          setIsRecording(false);
          clearInterval(timerRef.current);
        };

        rec.onend = () => {
          setIsRecording(false);
          clearInterval(timerRef.current);
          if (textRef.current && textRef.current.trim()) {
            onTextSubmit(textRef.current.trim());
          }
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (e) {
        setMicError(`Voice recognition unavailable: ${e.message}`);
        setIsRecording(false);
        setPermissionRequested(false);
      }
      return;
    }

    try {
      sessionRef.current = await startRecording();
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (e) {
      setMicError(`Microphone unavailable: ${e.message}`);
    } finally {
      setPermissionRequested(false);
    }
  };

  const end = async () => {
    clearInterval(timerRef.current);
    setIsRecording(false);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
      if (textRef.current && textRef.current.trim()) {
        onTextSubmit(textRef.current.trim());
      }
      return;
    }

    const session = sessionRef.current;
    sessionRef.current = null;
    if (!session) return;
    const blob = await session.stop();
    if (blob.size > 0) onVoiceSubmit(blob);
  };

  const submitText = (query = text) => {
    if (!query.trim()) return;
    setText(query);
    onTextSubmit(query);
  };

  const recordingSupported = isRecordingSupported();
  const micDisabled = isProcessing || !recordingSupported || !!backendUnavailable;
  const primaryState = isRecording
    ? 'recording'
    : permissionRequested
      ? 'permission-requested'
      : isProcessing
        ? phase
        : phase === 'answered' || phase === 'abstained' || phase === 'error'
          ? phase
          : 'idle';

  return (
    <section className="hero-grid" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="hero-eyebrow">
          <img src="/hhgoa/badges/rag-in-goa.svg" alt="#RAGInGoa" />
          <span>Goa signal station</span>
        </div>
        <h1 id="hero-title">Speak. Retrieve. Prove.</h1>
        <p>
          Sarvam speech-to-text meets hybrid dense + BM25 retrieval over MSMARCO-XI.
          Seven chunking strategies, five guardrails, and answers that stay inside the evidence.
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="video-btn video-btn-process"
            onClick={() => onOpenVideo?.('video1')}
            title="Watch Video 1: Team & Process"
          >
            🎬 Watch Process Video
          </button>
          <button
            type="button"
            className="video-btn video-btn-demo"
            onClick={() => onOpenVideo?.('video2')}
            title="Watch Video 2: Product Demo"
          >
            🎬 Watch Demo Video
          </button>
        </div>
      </div>

      <LiveBenchmarkProof benchmark={benchmark} benchmarkError={benchmarkError} />

      <div className="voice-console signal-panel">
        <img className="signal-sun" src="/hhgoa/backgrounds/hero-signal-sun.svg" alt="" aria-hidden="true" />
        <div className="console-topline">
          <span>Live voice console</span>
        </div>

        <div className="console-left-tag">
          <img src="/hhgoa/badges/rag-in-goa.svg" alt="#RAGInGoa" />
        </div>

        {backendUnavailable && (
          <div className="notice-panel compact danger" role="alert">
            <strong>Backend unavailable</strong>
            <p>{backendUnavailable}</p>
          </div>
        )}
        {!recordingSupported && (
          <div className="notice-panel compact danger">
            <strong>MediaRecorder unavailable</strong>
            <p>This browser cannot capture microphone audio.</p>
          </div>
        )}
        {micError && (
          <div className="notice-panel compact danger" role="alert">
            <strong>Microphone permission failed</strong>
            <p>{micError}</p>
          </div>
        )}

        <div className="mic-stage">
          <button
            type="button"
            className={`mic-button ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? end : begin}
            disabled={micDisabled}
            aria-label={isRecording ? 'Stop recording and send voice query' : 'Start recording voice query'}
            title="Record a question"
          >
            <span className="mic-ring" />
            <img src={isRecording ? '/hhgoa/icons/wave.svg' : '/hhgoa/icons/mic.svg'} alt="" aria-hidden="true" />
          </button>
          <div className="recording-readout" aria-live="polite">
            {isRecording ? (
              <>
                <strong>{seconds}s</strong>
                <span>recording</span>
              </>
            ) : (
              <>
                <strong>{isProcessing ? 'working' : 'ready'}</strong>
                <span>{primaryState}</span>
              </>
            )}
          </div>
        </div>

        {isRecording && (
          <div className="waveform-bars" aria-hidden="true">
            {[0.1, 0.3, 0.2, 0.4, 0.15, 0.35, 0.25, 0.45, 0.18].map((delay, i) => (
              <span key={i} style={{ animationDelay: `${delay}s` }} />
            ))}
          </div>
        )}

        <div className="console-controls">
          <label>
            <span>Language</span>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={isProcessing || isRecording}>
              {LANGUAGES.map(([code, label]) => (
                <option value={code} key={code}>{label} · {code}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Chunking strategy</span>
            <select value={strategy} onChange={(e) => setStrategy(e.target.value)} disabled={isProcessing || isRecording}>
              {(strategies || []).map((s) => (
                <option value={s.name} key={s.name} disabled={!s.loaded}>
                  {s.name}{s.stats ? ` · ${s.stats.chunks.toLocaleString()} chunks` : ''}
                </option>
              ))}
            </select>
          </label>
        </div>

        <form className="typed-query" onSubmit={(e) => { e.preventDefault(); submitText(); }}>
          <label htmlFor="typed-query">Keyboard test path</label>
          <div>
            <input
              id="typed-query"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="what is a corporation?"
              disabled={isProcessing}
            />
            <button type="submit" disabled={isProcessing || !text.trim()}>
              Search
            </button>
          </div>
        </form>

        <div className="query-chips" aria-label="Sample typed questions">
          {EXAMPLES.map((query) => (
            <button type="button" key={query} onClick={() => submitText(query)} disabled={isProcessing}>
              {query}
            </button>
          ))}
          <button type="button" className="danger-chip" onClick={() => submitText('What is the population of Mars in 2090?')} disabled={isProcessing}>
            Abstention probe
          </button>
        </div>
      </div>
    </section>
  );
}
