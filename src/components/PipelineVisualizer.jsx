import React from 'react';

const SIGNAL_PATH = [
  ['voice', 'Voice'],
  ['stt', 'Sarvam STT'],
  ['guardrails_input', 'Input guards'],
  ['retrieval', 'Hybrid retrieval'],
  ['rerank', 'Rerank'],
  ['guardrails_retrieval', 'Evidence guards'],
  ['generation', 'Span answer'],
  ['guardrails_provenance', 'Provenance guard'],
];

function fmt(value, digits = 2) {
  return value == null ? '-' : `${Number(value).toFixed(digits)}ms`;
}

export default function PipelineVisualizer({ isProcessing, result }) {
  if (isProcessing) {
    return (
      <section className="signal-panel pipeline-panel" aria-labelledby="pipeline-title">
        <div className="section-heading">
          <img src="/hhgoa/icons/lightning.svg" alt="" aria-hidden="true" />
          <div>
            <p>Pipeline</p>
            <h2 id="pipeline-title">Neutral processing state</h2>
          </div>
        </div>
        <div className="signal-path processing">
          {SIGNAL_PATH.map(([id, label]) => (
            <div className="path-node" key={id}>
              <span>{label}</span>
              <code>waiting</code>
            </div>
          ))}
        </div>
        <p className="panel-note">The API returns one final response, so stage completion is shown only after the result arrives.</p>
      </section>
    );
  }

  if (!result) return null;

  const timings = result.timings || [];
  const timingByName = Object.fromEntries(timings.map((t) => [t.name, t]));
  const pipelineMs = result.pipeline_ms;
  const totalMs = result.total_ms;
  const sttMs = result.stt?.stt_ms;
  const measuredSum = timings.reduce((sum, t) => sum + (t.ms || 0), 0);
  const overhead = Math.max(0, (pipelineMs || 0) - measuredSum);
  const withinTarget = pipelineMs != null && pipelineMs < 200;

  return (
    <section className="signal-panel pipeline-panel" aria-labelledby="pipeline-title">
      <div className="section-heading">
        <img src="/hhgoa/icons/lightning.svg" alt="" aria-hidden="true" />
        <div>
          <p>Measured request</p>
          <h2 id="pipeline-title">Signal path breakdown</h2>
        </div>
      </div>

      <div className="pipeline-summary">
        <div className={withinTarget ? 'status-chip ok' : 'status-chip warn'}>
          {fmt(pipelineMs)} {withinTarget ? 'under 200ms' : 'over 200ms'}
        </div>
        <code>total {fmt(totalMs)}</code>
        <code>strategy {result.strategy}</code>
        <code>trace {result.trace_id}</code>
      </div>

      <div className="signal-path">
        {SIGNAL_PATH.map(([id, label]) => {
          const timing = id === 'stt'
            ? { ms: sttMs, status: sttMs == null ? 'skipped' : 'ok' }
            : timingByName[id];
          return (
            <div className={`path-node ${timing?.status || 'skipped'}`} key={id}>
              <span>{label}</span>
              <code>{fmt(timing?.ms)}</code>
              {timing?.status && timing.status !== 'ok' && <small>{timing.status}</small>}
            </div>
          );
        })}
      </div>

      <div className="bar-list">
        {timings.map((timing) => {
          const pct = pipelineMs > 0 ? Math.min(100, ((timing.ms || 0) / pipelineMs) * 100) : 0;
          return (
            <div className="stage-bar" key={timing.name}>
              <span>{timing.name}</span>
              <div><i style={{ width: `${pct}%` }} /></div>
              <code>{fmt(timing.ms)}</code>
            </div>
          );
        })}
      </div>

      <p className="panel-note">
        Harness overhead is {fmt(overhead)}. Sarvam STT is shown separately when present and is not part of pipeline latency.
      </p>
    </section>
  );
}
