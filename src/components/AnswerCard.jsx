import React, { useState } from 'react';

export default function AnswerCard({ result }) {
  const [copied, setCopied] = useState(false);
  if (!result) return null;

  const { answer, abstained, citations = [], guardrail, guardrails_run = [], query, raw_query, stt } = result;
  const wasNormalized = raw_query && raw_query.trim() !== query;

  const copy = () => {
    navigator.clipboard.writeText(`${answer}\n\nCitations: ${citations.join(', ')}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel">
      <div style={{
        marginBottom: '1rem', borderBottom: '1.5px solid var(--line)', paddingBottom: '0.75rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px',
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase' }}>
            {stt?.source === 'sarvam' ? 'Transcribed by Sarvam' : 'Typed question'}
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{query}</div>
          {wasNormalized && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
              disfluencies stripped from: &ldquo;{raw_query}&rdquo;
            </div>
          )}
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 800,
          padding: '4px 10px', borderRadius: '999px',
          background: abstained ? '#fee2e2' : '#d1fae5',
          color: abstained ? '#991b1b' : '#065f46',
        }}>
          {abstained ? '🛡️ ABSTAINED' : '✓ GROUNDED (verbatim)'}
        </span>
      </div>

      <p style={{ fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 1rem' }}>{answer}</p>

      {abstained && guardrail && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '12px', background: '#fef3c7',
          border: '2px solid #b45309', marginBottom: '1rem',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 800, color: '#7c2d12' }}>
            Refused at {guardrail.layer} — {guardrail.code}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#7c2d12', marginTop: '4px' }}>{guardrail.reason}</div>
          {guardrail.detail?.top_dense_score != null && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#7c2d12', marginTop: '4px' }}>
              best cosine {guardrail.detail.top_dense_score} &lt; threshold {guardrail.detail.threshold}
            </div>
          )}
        </div>
      )}

      {!abstained && citations.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase' }}>
            Cited chunks — answer is a verbatim span of these
          </div>
          {citations.map((c) => (
            <code key={c} style={{ display: 'inline-block', margin: '4px 6px 0 0', fontSize: '0.75rem', background: 'rgba(0,0,0,0.06)', padding: '2px 8px', borderRadius: '6px' }}>
              {c}
            </code>
          ))}
        </div>
      )}

      <details>
        <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-muted)' }}>
          Guardrail layers that ran ({guardrails_run.length})
        </summary>
        <ul style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', margin: '0.5rem 0 0', paddingLeft: '1.2rem' }}>
          {guardrails_run.map((g, i) => (
            <li key={i} style={{ color: g.passed ? '#047857' : '#b91c1c' }}>
              {g.layer}: {g.passed ? 'passed' : `blocked (${g.code})`}
              {g.detail?.top_dense_score != null ? ` — cosine ${g.detail.top_dense_score}` : ''}
            </li>
          ))}
        </ul>
      </details>

      {!abstained && (
        <button className="query-chip" onClick={copy} style={{ marginTop: '1rem' }}>
          {copied ? '✓ Copied' : '📋 Copy answer + citations'}
        </button>
      )}
    </div>
  );
}
