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

const BAR_COUNT = 24;
const EMPTY_LEVELS = Array.from({ length: BAR_COUNT }, () => 0);

function formatMs(value) {
  return value == null ? '-' : `${value}ms`;
}

function stateLabel(state) {
  const labels = {
    idle: 'Idle',
    'permission-requested': 'Requesting microphone permission',
    recording: 'Recording',
    transcribing: 'Processing transcription',
    retrieving: 'Processing retrieval',
    success: 'Success',
    error: 'Error',
  };
  return labels[state] || state;
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
        {['P50', 'P100', '<200ms'].map((label) => (
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
        <span>P100</span>
        <strong>{formatMs(latency.p100)}</strong>
      </div>
      <div className="proof-card accent">
        <span>Under 200ms</span>
        <strong>{under.pct == null ? '-' : `${under.pct}%`}</strong>
      </div>
      <p className="proof-footnote">
        {benchmark.generated_at} · {benchmark.queries_measured} measured queries · pipeline latency excludes Sarvam
      </p>
    </aside>
  );
}

export default function VoiceRecorder({
  onTextSubmit,
  onVoiceSubmit,
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
  const [levels, setLevels] = useState(EMPTY_LEVELS);
  const sessionRef = useRef(null);
  const timerRef = useRef(null);
  const animationRef = useRef(null);
  const dataRef = useRef(null);

  const stopLevelMeter = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    dataRef.current = null;
    setLevels(EMPTY_LEVELS);
  };

  const startLevelMeter = (analyser) => {
    stopLevelMeter();
    if (!analyser) return;

    dataRef.current = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      const data = dataRef.current;
      if (!data) return;
      analyser.getByteFrequencyData(data);
      const bucketSize = Math.max(1, Math.floor(data.length / BAR_COUNT));
      const next = EMPTY_LEVELS.map((_, index) => {
        const start = index * bucketSize;
        const end = Math.min(data.length, start + bucketSize);
        let sum = 0;
        for (let i = start; i < end; i += 1) sum += data[i];
        return Math.min(1, (sum / Math.max(1, end - start)) / 255);
      });
      setLevels(next);
      animationRef.current = requestAnimationFrame(tick);
    };
    animationRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => {
    clearInterval(timerRef.current);
    stopLevelMeter();
    sessionRef.current?.cancel?.();
  }, []);

  const begin = async () => {
    setMicError(null);
    setPermissionRequested(true);
    try {
      const session = await startRecording();
      sessionRef.current = session;
      setIsRecording(true);
      setSeconds(0);
      startLevelMeter(session.analyser);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (e) {
      setMicError(`Microphone unavailable: ${e.message}`);
      stopLevelMeter();
    } finally {
      setPermissionRequested(false);
    }
  };

  const end = async () => {
    clearInterval(timerRef.current);
    setIsRecording(false);
    stopLevelMeter();
    const session = sessionRef.current;
    sessionRef.current = null;
    if (!session) return;
    try {
      const blob = await session.stop();
      if (blob.size > 0) onVoiceSubmit(blob);
    } catch (e) {
      setMicError(`Recording could not be saved: ${e.message}`);
    }
  };

  const cancel = () => {
    clearInterval(timerRef.current);
    setIsRecording(false);
    stopLevelMeter();
    sessionRef.current?.cancel?.();
    sessionRef.current = null;
  };

  const submitText = (query = text) => {
    if (!query.trim()) return;
    setText(query);
    onTextSubmit(query);
  };

  const recordingSupported = isRecordingSupported();
  const micDisabled = isProcessing || permissionRequested || !recordingSupported || !sttConfigured || !!backendUnavailable;
  const primaryState = isRecording
    ? 'recording'
    : permissionRequested
      ? 'permission-requested'
      : isProcessing
        ? phase
        : micError || phase === 'error'
          ? 'error'
          : phase === 'answered' || phase === 'abstained'
            ? 'success'
            : 'idle';

  return (
    <section className="hero-grid" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="hero-kicker">HHGoa Voice RAG console</p>
        <h1 id="hero-title">Ask by voice. Answer with evidence.</h1>
        <p>
          Speak a question, retrieve grounded passages from MSMARCO-XI, and inspect the answer,
          citations, strategy and latency from the live backend.
        </p>
      </div>

      <LiveBenchmarkProof benchmark={benchmark} benchmarkError={benchmarkError} />

      <div className="voice-console signal-panel">
        <div className="console-topline">
          <span>Voice recorder</span>
          <code>{stateLabel(primaryState)}</code>
        </div>

        {backendUnavailable && (
          <div className="notice-panel compact danger" role="alert">
            <strong>Backend unavailable</strong>
            <p>{backendUnavailable}</p>
          </div>
        )}
        {sttConfigured === false && (
          <div className="notice-panel compact">
            <strong>Sarvam is not configured</strong>
            <p>{sttDetail} Typed queries still run through the retrieval pipeline.</p>
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
            <strong>Recorder error</strong>
            <p>{micError}</p>
            <button type="button" className="inline-retry" onClick={begin} disabled={micDisabled && !micError}>
              Retry microphone
            </button>
          </div>
        )}

        <div className="mic-stage">
          <button
            type="button"
            className={`voice-art-button ${primaryState}`}
            onClick={isRecording ? end : begin}
            disabled={isRecording ? false : micDisabled}
            aria-label={isRecording ? 'Stop recording and send voice query' : 'Start recording voice query'}
            title={sttConfigured === false ? 'Sarvam API key not configured' : 'Record a voice question'}
          >
            {['idle', 'transcribing', 'retrieving'].includes(primaryState) ? (
              <img src="/hhgoa/voice/voice-signal-animated.svg" alt="" aria-hidden="true" />
            ) : (
              <span className="voice-static-mark" aria-hidden="true">
                <span className="voice-static-ring" />
                <span className="voice-static-core">
                  <span />
                  <span />
                  <span />
                </span>
              </span>
            )}
          </button>
          <div className="recording-readout" aria-live="polite">
            <strong>{isRecording ? `${seconds}s` : stateLabel(primaryState)}</strong>
            <span>{isRecording ? 'press signal to stop' : 'voice goes through Sarvam and /api/voice'}</span>
          </div>
          {isRecording && (
            <div className="recording-controls">
              <button type="button" onClick={end}>Stop and transcribe</button>
              <button type="button" onClick={cancel}>Cancel</button>
            </div>
          )}
        </div>

        <div className="live-levels" aria-label="Live microphone input level">
          {levels.map((level, index) => (
            <span key={index} style={{ '--level': isRecording ? level : 0 }} />
          ))}
        </div>

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
          <label htmlFor="typed-query">Typed query</label>
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
      </div>
    </section>
  );
}
