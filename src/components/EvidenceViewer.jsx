import React from 'react';

export default function EvidenceViewer({ result }) {
  if (!result) {
    return (
      <div className="glass-panel">
        <p style={{ fontFamily: 'var(--font-mono)' }}>Run a query first to inspect retrieved evidence.</p>
      </div>
    );
  }

  const evidence = result.evidence || [];
  const cited = new Set(result.citations || []);

  return (
    <div className="glass-panel">
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--ink-muted)' }}>
        RETRIEVED EVIDENCE — {evidence.length} chunks · strategy {result.strategy}
      </h3>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
        <strong>score</strong> is the fused dense+BM25 value used for ranking.
        <strong> cosine</strong> is the raw dense similarity the abstention guardrail thresholds on —
        only cosine is comparable across different queries.
      </p>

      {evidence.length === 0 && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          Nothing passed retrieval for this query.
        </p>
      )}

      {evidence.map((e) => (
        <div
          key={e.chunk_id}
          style={{
            border: cited.has(e.chunk_id) ? '2.5px solid #047857' : '2px solid var(--card-border)',
            borderRadius: '14px', padding: '0.85rem 1rem', margin: '0.75rem 0',
            background: cited.has(e.chunk_id) ? 'rgba(4,120,87,0.06)' : 'rgba(255,255,255,0.5)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <code style={{ fontSize: '0.72rem', fontWeight: 700 }}>{e.chunk_id}</code>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
              score {e.score} · cosine {e.dense_score} · bm25 {e.sparse_score}
              {cited.has(e.chunk_id) ? ' · ★ cited' : ''}
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.5, margin: '0.5rem 0 0' }}>{e.text}</p>
          {e.metadata && Object.keys(e.metadata).length > 0 && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink-muted)', marginTop: '6px' }}>
              {JSON.stringify(e.metadata)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
