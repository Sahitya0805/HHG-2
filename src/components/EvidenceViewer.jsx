import React, { useState } from 'react';

export default function EvidenceViewer({ pipelineData }) {
  const [selectedStrategy, setSelectedStrategy] = useState('semantic');
  const evidence = pipelineData?.evidence || [];
  const transcript = pipelineData?.transcript || 'No query executed yet.';

  const strategies = [
    { id: 'fixed', name: 'Strategy A: Fixed Token (100 tokens)' },
    { id: 'sentence', name: 'Strategy B: Sentence Windows (3 sentences)' },
    { id: 'recursive', name: 'Strategy C: Recursive Hierarchy' },
    { id: 'semantic', name: 'Strategy D: Semantic Boundaries' },
    { id: 'window', name: 'Strategy E: Windowed Context' },
  ];

  return (
    <div>
      <div className="glass-panel">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--forest-dark)' }}>
          🔎 MSMARCO-XI Evidence & Chunk Inspection
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Inspect exact document chunks retrieved, relevance similarity percentages, metadata, and chunk strategy details.
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', fontWeight: '700' }}>
            Active Strategy Filter:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {strategies.map((s) => (
              <button
                key={s.id}
                className={`query-chip ${selectedStrategy === s.id ? 'active' : ''}`}
                style={selectedStrategy === s.id ? { background: 'var(--forest-dark)', color: 'var(--paper)', borderColor: 'var(--forest-dark)' } : {}}
                onClick={() => setSelectedStrategy(s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(246, 240, 223, 0.7)', border: '1px solid var(--line)', padding: '1rem', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
            CURRENT QUERY INSPECTED:
          </div>
          <div style={{ fontSize: '1.05rem', color: 'var(--forest-dark)', fontWeight: '700', marginTop: '4px' }}>
            "{transcript}"
          </div>
        </div>
      </div>

      {evidence.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📄</div>
          <p style={{ color: 'var(--muted)', fontWeight: '600' }}>Run a voice search query to inspect candidate evidence passages.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {evidence.map((item, idx) => (
            <div key={idx} className="glass-panel" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--forest-dark)', fontWeight: '700' }}>
                    Document ID: {item.document_id}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted)', marginLeft: '12px' }}>
                    Chunk: {item.chunk_id}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted)' }}>
                    Tokens: {item.token_count}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.9rem',
                      color: 'var(--green)',
                      background: 'rgba(8, 115, 63, 0.12)',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      fontWeight: '700',
                      border: '1px solid rgba(8, 115, 63, 0.25)'
                    }}
                  >
                    Relevance: {Math.round(item.score * 100)}%
                  </span>
                </div>
              </div>

              <div style={{ background: 'rgba(246, 240, 223, 0.6)', border: '1px solid var(--line)', padding: '1rem', borderRadius: '8px', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--ink)' }}>
                {item.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
