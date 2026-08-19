import React, { useState, useEffect, useRef } from 'react';

export default function VoiceRecorder({ onTranscriptSubmit, isProcessing, activeStrategy, setActiveStrategy, removeFillers, setRemoveFillers }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [customText, setCustomText] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Tap microphone to speak or type a question below 🌴');

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setCustomText(currentTranscript);
          }
        };

        rec.onerror = (event) => {
          console.warn('Speech recognition notice:', event.error);
        };

        recognitionRef.current = rec;
      } catch (e) {
        console.warn('Speech recognition init notice:', e);
      }
    }
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setStatusMessage('● RECORDING YOUR VOICE... SPEAK NOW 🎙️');

    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Microphone start notice:', err);
      }
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setStatusMessage('Voice capture complete! Running grounded RAG search...');

    if (timerRef.current) clearInterval(timerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
    }

    if (customText.trim()) {
      onTranscriptSubmit(customText.trim());
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (customText.trim()) {
      onTranscriptSubmit(customText.trim());
    }
  };

  const handleQuickClick = (text) => {
    setCustomText(text);
    onTranscriptSubmit(text);
  };

  const strategies = [
    { id: 'fixed', label: 'Fixed Token (256/32)' },
    { id: 'sentence', label: 'Sentence Window (3)' },
    { id: 'recursive', label: 'Recursive Hierarchy' },
    { id: 'semantic', label: 'Semantic Boundaries' },
    { id: 'window', label: 'Windowed Context' }
  ];

  return (
    <div className="hero-voice-section glass-panel">
      <div className="hero-sticker-badge">
        Handcrafted in Goa 🌴 #RAGInGoa
      </div>

      <div className="hero-brand-strip">
        <img src="/brand/hacker-house.png" alt="Hacker House" style={{ height: '44px' }} />
        <img src="/brand/goa-hindi.svg" alt="Goa" style={{ height: '38px' }} />
        <img src="/brand/247pm.svg" alt="247PM" style={{ height: '30px', opacity: 0.9 }} />
      </div>

      <h1 className="hero-title">
        Voice-First Grounded Search <span className="brand-serif">on the Beach</span>
      </h1>
      <p className="hero-subtitle">
        Speak your question to convert voice speech into text and search the MSMARCO-XI dataset with sub-200ms grounded RAG.
      </p>

      {/* Strategy Selector & Controls Strip */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '1rem', margin: '1rem 0 1.5rem', background: 'rgba(246, 240, 223, 0.6)', padding: '0.75rem 1.25rem', borderRadius: '16px', border: '2px solid var(--card-border)' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-display)', fontWeight: '800', marginRight: '8px', textTransform: 'uppercase' }}>
            🧪 Active Chunk Strategy:
          </span>
          <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px' }}>
            {strategies.map((s) => (
              <button
                key={s.id}
                className="query-chip"
                style={activeStrategy === s.id ? { background: 'var(--card-border)', color: '#ffffff' } : { padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
                onClick={() => setActiveStrategy(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-display)', fontWeight: '800', textTransform: 'uppercase' }}>
            🧹 Filler Word Stripper:
          </span>
          <button
            className="query-chip"
            style={{ background: removeFillers ? '#d1fae5' : '#fee2e2', color: removeFillers ? '#065f46' : '#991b1b', fontWeight: '800', padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
            onClick={() => setRemoveFillers(!removeFillers)}
          >
            {removeFillers ? 'ON (Clean Query)' : 'OFF (Raw Speech)'}
          </button>
        </div>
      </div>

      {/* Microphone Tactile Button */}
      <div className="mic-button-wrapper">
        <button
          className={`mic-button ${isRecording ? 'recording' : ''}`}
          onClick={toggleRecording}
          disabled={isProcessing}
          title={isRecording ? 'Click to Finish & Submit Question' : 'Click to Speak Microphone'}
        >
          {isRecording ? '⏹' : '🎙️'}
        </button>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: isRecording ? 'var(--vintage-pink)' : 'var(--ink)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {isRecording ? `● RECORDING VOICE... ${recordingSeconds}s (Click ⏹ to Finish)` : statusMessage}
      </div>

      {/* Real-time Voice Waveform Visualizer */}
      {isRecording && (
        <div className="waveform-bars">
          <div className="bar active" style={{ animationDelay: '0.1s' }}></div>
          <div className="bar active" style={{ animationDelay: '0.3s' }}></div>
          <div className="bar active" style={{ animationDelay: '0.2s' }}></div>
          <div className="bar active" style={{ animationDelay: '0.4s' }}></div>
          <div className="bar active" style={{ animationDelay: '0.15s' }}></div>
          <div className="bar active" style={{ animationDelay: '0.35s' }}></div>
          <div className="bar active" style={{ animationDelay: '0.25s' }}></div>
        </div>
      )}

      {/* Live Sentence Speech Input Form */}
      <div style={{ maxWidth: '680px', margin: '1.75rem auto 0', textAlign: 'left' }}>
        <form onSubmit={handleTextSubmit}>
          <label style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-display)', fontWeight: '800', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isRecording ? '🎙️ Transcribed Sentence from Voice:' : '📝 Speech Sentence Input:'}
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="query-input"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={isRecording ? 'Speak into your microphone now...' : 'Speak or type any question (e.g. What is the process of photosynthesis?)'}
              style={{
                flex: 1,
                padding: '0.85rem 1.25rem',
                borderRadius: '16px',
                border: '2.5px solid var(--card-border)',
                background: '#ffffff',
                color: 'var(--ink)',
                fontFamily: 'var(--font-sans)',
                fontSize: '1.05rem',
                fontWeight: '600',
                outline: 'none',
                boxShadow: '3px 3px 0px var(--card-border)'
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={isProcessing || !customText.trim()}
              style={{ padding: '0.85rem 1.5rem', borderRadius: '16px', whiteSpace: 'nowrap' }}
            >
              {isProcessing ? 'Searching...' : '⚡ Search RAG'}
            </button>
          </div>
        </form>
      </div>

      {/* Preset Voice Query Chips */}
      <div className="quick-queries">
        <span style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', width: '100%', marginBottom: '4px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontWeight: '700' }}>
          🌴 Try Sample Questions:
        </span>
        <button className="query-chip" onClick={() => handleQuickClick('What causes the symptoms of influenza and seasonal flu?')}>
          "What causes influenza symptoms?"
        </button>
        <button className="query-chip" onClick={() => handleQuickClick('Umm... so like, what causes high blood pressure and hypertension?')}>
          "Umm... what causes high blood pressure?"
        </button>
        <button className="query-chip" onClick={() => handleQuickClick('How do green plants convert sunlight into energy during photosynthesis?')}>
          "How does photosynthesis work?"
        </button>
        <button className="query-chip abstain-chip" onClick={() => handleQuickClick('What is the population of Mars?')}>
          🛡️ "What is the population of Mars?" (Abstain Demo)
        </button>
      </div>
    </div>
  );
}
