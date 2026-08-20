import React, { useEffect, useState } from 'react';
import { getHealth, getCorpus, getStrategies } from '../lib/api.js';

// Everything here is read from /api/health. Nothing hardcoded.
export default function SystemStatus() {
  const [health, setHealth] = useState(null);
  const [corpus, setCorpus] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getHealth().then(setHealth).catch((e) => setError(e.message));
    getCorpus().then(setCorpus).catch(() => {});
    getStrategies().then((d) => setStrategies(d.strategies || [])).catch(() => {});
  }, []);

  if (error) {
    return <div className="glass-panel"><p style={{ color: '#b91c1c' }}>Backend unreachable: {error}</p></div>;
  }
  if (!health) {
    return <div className="glass-panel"><p style={{ fontFamily: 'var(--font-mono)' }}>Loading status…</p></div>;
  }

  const Row = ({ label, value, ok }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '0.6rem 0',
      borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
    }}>
      <span style={{ color: 'var(--ink-muted)' }}>{label}</span>
      <span style={{ fontWeight: 700, color: ok === false ? '#b45309' : 'var(--ink)', textAlign: 'right' }}>{value}</span>
    </div>
  );

  return (
    <div className="glass-panel">
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--ink-muted)' }}>
        LIVE SYSTEM STATUS
      </h3>

      <Row label="Pipeline" value={health.status} ok={health.status === 'ok'} />
      <Row
        label="Speech-to-text"
        value={health.stt.configured ? `${health.stt.provider} · ${health.stt.model}` : 'not configured'}
        ok={health.stt.configured}
      />
      {!health.stt.configured && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#b45309', margin: '0.5rem 0' }}>
          {health.stt.detail}
        </p>
      )}
      <Row label="Embedding model" value={`${health.embedding_model.name} · ${health.embedding_model.dim ?? '?'}d · ${health.embedding_model.type}`} />
      <Row label="Corpus loaded" value={String(health.corpus_loaded)} ok={health.corpus_loaded} />

      {corpus && (
        <>
          <h4 style={{ fontFamily: 'var(--font-heading)', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
            CORPUS PROVENANCE
          </h4>
          <Row label="Dataset" value={corpus.source_dataset} />
          <Row label="Source file" value={`${corpus.source_file} (${corpus.split})`} />
          <Row label="Queries" value={corpus.queries?.toLocaleString()} />
          <Row label="Passages" value={corpus.passages?.toLocaleString()} />
          <Row label="Queries with gold labels" value={corpus.queries_with_gold?.toLocaleString()} />
          <Row label="Built at" value={corpus.built_at} />
        </>
      )}

      {strategies.length > 0 && (
        <>
          <h4 style={{ fontFamily: 'var(--font-heading)', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
            CHUNKING STRATEGIES
          </h4>
          {strategies.map((s) => (
            <div key={s.name} style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                <strong>{s.name}</strong>
                <span>{s.loaded ? `${s.stats.chunks.toLocaleString()} chunks · ${s.stats.avg_tokens} avg tok · ${s.stats.index_mb}MB` : 'not built'}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{s.description}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
