import React, { useState } from 'react';

export default function AnswerCard({ result, onCitationClick }) {
  const [copied, setCopied] = useState(false);
  if (!result) return null;

  const {
    answer,
    abstained,
    citations = [],
    guardrail,
    guardrails_run = [],
    query,
    raw_query,
    stt,
  } = result;
  const wasNormalized = raw_query && raw_query.trim() !== query;
  const provenancePassed = !abstained && guardrail?.layer === 'L5_provenance' && guardrail?.passed;

  const copy = async () => {
    await navigator.clipboard.writeText(`${answer || ''}\n\nCitations: ${citations.join(', ')}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className={`answer-panel ${abstained ? 'abstained' : 'grounded'}`} aria-labelledby="answer-title">
      <div className="answer-status">
        <div>
          <p>{stt?.source === 'sarvam' ? 'Sarvam transcript' : 'Typed query'}</p>
          <h2 id="answer-title">{abstained ? 'Abstained' : 'Grounded answer'}</h2>
        </div>
        {provenancePassed && <img src="/hhgoa/badges/grounded-stamp.svg" alt="Grounded" />}
        {!provenancePassed && <span className="status-chip warn">Guardrail refusal</span>}
      </div>

      <div className="query-ledger">
        <span>normalized</span>
        <strong>{query}</strong>
        {wasNormalized && <small>raw: {raw_query}</small>}
        {stt && (
          <small>
            source: {stt.source}{stt.provider ? ` · ${stt.provider}` : ''}{stt.language ? ` · ${stt.language}` : ''}
          </small>
        )}
      </div>

      <p className="answer-text">{answer}</p>

      {abstained && guardrail && (
        <div className="guardrail-box">
          <strong>{guardrail.layer} · {guardrail.code}</strong>
          <p>{guardrail.reason}</p>
          {guardrail.detail && Object.keys(guardrail.detail).length > 0 && (
            <code>{JSON.stringify(guardrail.detail)}</code>
          )}
        </div>
      )}

      {!abstained && citations.length > 0 && (
        <div className="citation-row" aria-label="Citations">
          {citations.map((chunkId) => (
            <button type="button" key={chunkId} onClick={() => onCitationClick?.(chunkId)}>
              <img src="/hhgoa/icons/citation.svg" alt="" aria-hidden="true" />
              {chunkId}
            </button>
          ))}
        </div>
      )}

      <details className="guardrail-details">
        <summary>Guardrails run ({guardrails_run.length})</summary>
        <div>
          {guardrails_run.map((g, index) => (
            <code className={g.passed ? 'passed' : 'blocked'} key={`${g.layer}-${index}`}>
              {g.layer}: {g.passed ? 'passed' : `blocked · ${g.code}`}
            </code>
          ))}
        </div>
      </details>

      <button className="copy-button" type="button" onClick={copy}>
        {copied ? 'Copied' : 'Copy answer + citations'}
      </button>
    </section>
  );
}
