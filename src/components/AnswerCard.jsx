import React, { useState } from 'react';

export default function AnswerCard({ data }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const { transcript, answer, sources, grounded, abstained, latency_ms, evidence } = data;

  const speakAnswer = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech Synthesis API is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${answer}\n\nSources: ${sources.join(', ')}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel">
      <div style={{ marginBottom: '1rem', borderBottom: '1.5px solid var(--line)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-display)', fontWeight: '700', textTransform: 'uppercase' }}>
            TRANSCRIPT PREVIEW & QUERY
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--ink)', marginTop: '4px' }}>
            "{transcript}"
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="query-chip"
            onClick={speakAnswer}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: isPlayingAudio ? 'var(--pink)' : 'var(--sunset-gold)', color: isPlayingAudio ? '#ffffff' : 'var(--ink)' }}
            title="Read Answer Out Loud"
          >
            {isPlayingAudio ? '⏹ Stop Voice' : '🔊 Play Audio'}
          </button>
          <button
            className="query-chip"
            onClick={copyToClipboard}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Copy Answer to Clipboard"
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>

      <div className={`answer-box ${abstained ? 'abstained-box' : ''}`}>
        <div className="answer-header">
          <span className="answer-title">
            {abstained ? '🛡️ GUARDRAIL ABSTENTION' : '⚡ GROUNDED ANSWER'}
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className={`grounded-tag ${grounded ? 'yes' : 'no'}`}>
              GROUNDED: {grounded ? 'YES' : 'REFUSED / ABSTAINED'}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--beach-teal)', fontWeight: '700' }}>
              ⚡ {latency_ms} ms
            </span>
          </div>
        </div>

        <div className="answer-text">{answer}</div>
      </div>

      {sources && sources.length > 0 && (
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--ink-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
            RETRIEVED SOURCES ({sources.length}):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {sources.map((src, i) => (
              <span
                key={i}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  padding: '0.3rem 0.65rem',
                  background: 'rgba(3, 41, 29, 0.06)',
                  border: '1.5px solid var(--card-border)',
                  borderRadius: '6px',
                  color: 'var(--ink)',
                  fontWeight: '700'
                }}
              >
                📄 {src}
              </span>
            ))}
          </div>
        </div>
      )}

      {evidence && evidence.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--ink-muted)', marginBottom: '0.75rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
            EVIDENCE PASSAGES ({evidence.length}):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
            {evidence.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(246, 240, 223, 0.6)',
                  border: '2px solid var(--card-border)',
                  borderRadius: '10px',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink)', fontWeight: '700' }}>
                    Chunk ID: {item.chunk_id} ({item.strategy})
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--beach-teal)', fontWeight: '700' }}>
                    Relevance: {Math.round(item.score * 100)}%
                  </span>
                </div>
                <div style={{ fontSize: '0.95rem', color: 'var(--ink)', lineHeight: '1.55', fontWeight: '500' }}>
                  "{item.text}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
