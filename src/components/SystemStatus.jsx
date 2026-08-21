import React, { useEffect, useState } from 'react';
import { getCorpus, getHealth, getStrategies } from '../lib/api.js';

function Row({ label, value, ok }) {
  return (
    <div className="system-row">
      <span>{label}</span>
      <strong className={ok === false ? 'warn' : ''}>{value ?? '-'}</strong>
    </div>
  );
}

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
    return (
      <section className="signal-panel" aria-labelledby="system-title">
        <div className="section-heading">
          <img src="/hhgoa/icons/shield.svg" alt="" aria-hidden="true" />
          <div>
            <p>System</p>
            <h1 id="system-title">Backend unavailable</h1>
          </div>
        </div>
        <p className="panel-note">{error}</p>
      </section>
    );
  }

  if (!health) {
    return (
      <section className="signal-panel" aria-label="Loading system status">
        <div className="system-row skeleton"><span /><strong /></div>
        <div className="system-row skeleton"><span /><strong /></div>
      </section>
    );
  }

  return (
    <section className="signal-panel system-panel" aria-labelledby="system-title">
      <div className="section-heading">
        <img src="/hhgoa/icons/shield.svg" alt="" aria-hidden="true" />
        <div>
          <p>Backend-driven status</p>
          <h1 id="system-title">System ledger</h1>
        </div>
      </div>

      <div className="system-grid">
        <div>
          <h2>Pipeline</h2>
          <Row label="Status" value={health.status} ok={health.status === 'ok'} />
          <Row label="Corpus loaded" value={String(health.corpus_loaded)} ok={health.corpus_loaded} />
          {health.startup_error && <Row label="Startup error" value={health.startup_error} ok={false} />}
        </div>
        <div>
          <h2>Sarvam STT</h2>
          <Row
            label="Provider"
            value={health.stt?.configured ? health.stt.provider : 'not configured'}
            ok={health.stt?.configured}
          />
          <Row label="Model" value={health.stt?.model} ok={health.stt?.configured} />
          <p className="panel-note">{health.stt?.detail}</p>
        </div>
        <div>
          <h2>Embedding</h2>
          <Row label="Model" value={health.embedding_model?.name} />
          <Row label="Dimension" value={health.embedding_model?.dim} />
          <Row label="Type" value={health.embedding_model?.type} />
        </div>
        <div>
          <h2>Indexes</h2>
          {Object.entries(health.indexes || {}).map(([name, chunks]) => (
            <Row key={name} label={name} value={`${Number(chunks).toLocaleString()} chunks`} />
          ))}
          {Object.keys(health.indexes || {}).length === 0 && <Row label="Built indexes" value="none" ok={false} />}
        </div>
      </div>

      {corpus && (
        <div className="system-block">
          <h2>Corpus provenance</h2>
          <Row label="Dataset" value={corpus.source_dataset} />
          <Row label="Source file" value={`${corpus.source_file} · ${corpus.split}`} />
          <Row label="Queries" value={corpus.queries?.toLocaleString()} />
          <Row label="Passages" value={corpus.passages?.toLocaleString()} />
          <Row label="Queries with gold labels" value={corpus.queries_with_gold?.toLocaleString()} />
          <Row label="Built at" value={corpus.built_at} />
        </div>
      )}

      <div className="system-block">
        <h2>Strategy statistics</h2>
        <div className="strategy-cards">
          {strategies.map((strategy) => (
            <article className="strategy-card" key={strategy.name}>
              <strong>{strategy.name}</strong>
              <span>{strategy.loaded ? 'loaded' : 'not built'}</span>
              <p>{strategy.description}</p>
              {strategy.stats && (
                <code>
                  {strategy.stats.chunks?.toLocaleString()} chunks · {strategy.stats.avg_tokens} avg tokens · {strategy.stats.index_mb}MB
                </code>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
