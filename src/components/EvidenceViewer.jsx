import React, { useEffect } from 'react';

function EvidenceMetric({ label, value }) {
  return (
    <span>
      <small>{label}</small>
      <strong>{value ?? '-'}</strong>
    </span>
  );
}

export default function EvidenceViewer({ result, focusCitation }) {
  useEffect(() => {
    if (!focusCitation) return;
    const node = document.getElementById(`chunk-${CSS.escape(focusCitation)}`);
    node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    node?.focus({ preventScroll: true });
  }, [focusCitation]);

  if (!result) {
    return (
      <section className="signal-panel empty-state" aria-labelledby="evidence-title">
        <div className="section-heading">
          <img src="/hhgoa/icons/chunks.svg" alt="" aria-hidden="true" />
          <div>
            <p>Evidence</p>
            <h1 id="evidence-title">No retrieved chunks yet</h1>
          </div>
        </div>
        <p>Run a voice or typed query from Ask to inspect the chunks, citations, scores and metadata returned by the backend.</p>
      </section>
    );
  }

  const evidence = result.evidence || [];
  const cited = new Set(result.citations || []);

  return (
    <section className="signal-panel evidence-panel" aria-labelledby="evidence-title">
      <div className="section-heading">
        <img src="/hhgoa/icons/chunks.svg" alt="" aria-hidden="true" />
        <div>
          <p>{evidence.length} retrieved chunks · strategy {result.strategy}</p>
          <h1 id="evidence-title">Evidence ledger</h1>
        </div>
      </div>

      <p className="score-explainer">
        Fused score ranks dense cosine and BM25 together for this query. Raw dense cosine is the comparable similarity value used by retrieval guardrails.
      </p>

      <div className="evidence-list">
        {evidence.length === 0 && <p className="panel-note">Nothing passed retrieval for this query.</p>}
        {evidence.map((item) => {
          const isCited = cited.has(item.chunk_id);
          return (
            <article
              className={`evidence-card ${isCited ? 'cited' : ''}`}
              id={`chunk-${item.chunk_id}`}
              key={item.chunk_id}
              tabIndex="-1"
            >
              <header>
                <div>
                  <code>{item.chunk_id}</code>
                  {isCited && <strong>cited</strong>}
                </div>
                <div className="evidence-metrics">
                  <EvidenceMetric label="fused" value={item.score} />
                  <EvidenceMetric label="cosine" value={item.dense_score} />
                  <EvidenceMetric label="bm25" value={item.sparse_score} />
                </div>
              </header>
              <p>{item.text}</p>
              {item.metadata && Object.keys(item.metadata).length > 0 && (
                <pre>{JSON.stringify(item.metadata, null, 2)}</pre>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
