import React from 'react';

export default function PipelineVisualizer({ isProcessing, pipelineData }) {
  const stageLats = pipelineData?.stage_latencies || {};
  const totalMs = pipelineData?.latency_ms || 0;

  const stages = [
    { id: 'stt', label: '🎙️ STT', lat: stageLats.stt_ms },
    { id: 'retrieval', label: '🔎 Retrieval', lat: stageLats.vector_search_ms },
    { id: 'reranking', label: '🧠 Reranking', lat: stageLats.reranking_ms },
    { id: 'guardrails', label: '🛡️ Guardrails', lat: stageLats.guardrails_ms },
    { id: 'generation', label: '✨ Generation', lat: stageLats.generation_ms },
    { id: 'total', label: '⚡ Total Pipeline', lat: totalMs },
  ];

  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text-muted)' }}>
          LIVE PIPELINE EXECUTION BREAKDOWN
        </h3>
        {totalMs > 0 && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: totalMs < 200 ? 'var(--accent-green)' : 'var(--accent-amber)',
              fontWeight: '700'
            }}
          >
            {totalMs < 200 ? '⚡ TARGET MET (<200ms)' : 'METRIC TRACKED'}
          </span>
        )}
      </div>

      <div className="pipeline-stepper">
        {stages.map((stg) => {
          let statusClass = 'pending';
          if (isProcessing) {
            statusClass = 'running';
          } else if (pipelineData) {
            statusClass = 'complete';
          }

          return (
            <div key={stg.id} className={`stage-card ${statusClass}`}>
              <div className="stage-name">{stg.label}</div>
              <div className="stage-lat">
                {stg.lat !== undefined ? `${stg.lat} ms` : isProcessing ? '...' : '--'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
