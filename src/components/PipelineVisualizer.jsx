import React from 'react';

const LABELS = {
  guardrails_input: '🛡️ Input guards (L1–L2)',
  retrieval: '🔎 Hybrid retrieval',
  rerank: '🧠 Rerank',
  guardrails_retrieval: '🛡️ Evidence guards (L3–L4)',
  generation: '✂️ Span selection',
  guardrails_provenance: '🛡️ Provenance (L5)',
  strategy_fallback: '♻️ Strategy fallback',
};

export default function PipelineVisualizer({ isProcessing, result }) {
  if (isProcessing) {
    return (
      <div className="glass-panel">
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--ink-muted)' }}>
          RUNNING PIPELINE…
        </h3>
      </div>
    );
  }
  if (!result) return null;

  const timings = result.timings || [];
  const pipelineMs = result.pipeline_ms ?? 0;
  const sttMs = result.stt?.stt_ms;
  const withinTarget = pipelineMs < 200;
  const measuredSum = timings.reduce((a, t) => a + (t.ms || 0), 0);

  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--ink-muted)', margin: 0 }}>
          MEASURED PIPELINE BREAKDOWN
        </h3>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700,
          color: withinTarget ? '#047857' : '#b45309',
        }}>
          {pipelineMs.toFixed(2)} ms {withinTarget ? '✓ under 200ms target' : '✗ over 200ms target'}
        </span>
      </div>

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-muted)', margin: '0 0 1rem' }}>
        Wall-clock timings from this request. The 200ms target covers retrieval → answer.
        {sttMs != null
          ? ` Sarvam STT took ${sttMs.toFixed(0)}ms and is counted separately (total ${result.total_ms?.toFixed(2)}ms).`
          : ' No speech-to-text ran for this query.'}
      </p>

      <div className="pipeline-stepper">
        {timings.map((t) => {
          const pct = pipelineMs > 0 ? Math.min(100, ((t.ms || 0) / pipelineMs) * 100) : 0;
          return (
            <div key={t.name} className="pipeline-step complete" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <span>{LABELS[t.name] || t.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {t.ms == null ? '—' : `${t.ms.toFixed(2)}ms`}
                </span>
              </div>
              <div style={{ height: '4px', background: 'rgba(0,0,0,0.08)', borderRadius: '2px', marginTop: '4px' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--card-border)', borderRadius: '2px' }} />
              </div>
              {t.status !== 'ok' && (
                <div style={{ fontSize: '0.7rem', color: '#b45309', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  {t.status}{t.attempts > 1 ? ` after ${t.attempts} attempts` : ''}{t.note ? ` — ${t.note}` : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-muted)', marginTop: '0.75rem' }}>
        stages sum to {measuredSum.toFixed(2)}ms; total measured {pipelineMs.toFixed(2)}ms —
        the {Math.max(0, pipelineMs - measuredSum).toFixed(2)}ms difference is harness overhead,
        shown rather than hidden. · strategy: <strong>{result.strategy}</strong> · trace <code>{result.trace_id}</code>
      </div>
    </div>
  );
}
