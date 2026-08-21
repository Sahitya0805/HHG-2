import React, { useEffect, useState } from 'react';
import { getBenchmark } from '../lib/api.js';

function pct(value) {
  return value == null ? '-' : `${(Number(value) * 100).toFixed(1)}%`;
}

function ms(value) {
  return value == null ? '-' : `${value}ms`;
}

function number(value) {
  return value == null ? '-' : Number(value).toLocaleString();
}

function StatCard({ label, value, note }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}

function StrategyTable({ comparison, activeStrategy, selectedStrategy, compact }) {
  const rows = Object.entries(comparison || {});

  return (
    <div className="strategy-section">
      <div className="strategy-art">
        <img src="/hhgoa/backgrounds/chunk-flow.svg" alt="" aria-hidden="true" />
      </div>
      <div className="table-wrap" role="region" aria-label="Seven chunking strategies" tabIndex="0">
        <table className="data-table">
          <thead>
            <tr>
              <th>Strategy</th>
              {!compact && <th>Chunks</th>}
              <th>R@1</th>
              <th>R@5</th>
              <th>R@10</th>
              <th>MRR@10</th>
              <th>P50</th>
              <th>P100</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, metrics]) => (
              <tr className={`${name === activeStrategy ? 'active-benchmark' : ''} ${name === selectedStrategy ? 'selected-strategy' : ''}`} key={name}>
                <td>
                  <strong>{name}</strong>
                  {name === activeStrategy && <small>active report</small>}
                  {name === selectedStrategy && <small>selected</small>}
                </td>
                {!compact && <td>{number(metrics.chunks)}</td>}
                <td>{metrics['recall@1']}</td>
                <td>{metrics['recall@5']}</td>
                <td>{metrics['recall@10']}</td>
                <td>{metrics['mrr@10']}</td>
                <td>{ms(metrics.p50_ms)}</td>
                <td>{ms(metrics.p100_ms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StageBars({ stages }) {
  const max = Math.max(...Object.values(stages || {}).map(Number), 1);
  return (
    <div className="stage-bars">
      {Object.entries(stages || {}).map(([name, value]) => (
        <div className="stage-bar" key={name}>
          <span>{name}</span>
          <div><i style={{ width: `${Math.max(3, (Number(value) / max) * 100)}%` }} /></div>
          <code>{ms(value)}</code>
        </div>
      ))}
    </div>
  );
}

export default function BenchmarkDashboard({ compact = false, selectedStrategy, report: providedReport, error: providedError }) {
  const [report, setReport] = useState(providedReport || null);
  const [error, setError] = useState(providedError || null);

  useEffect(() => {
    if (providedReport || providedError) return;
    getBenchmark().then(setReport).catch((e) => setError(e.message));
  }, [providedError, providedReport]);

  useEffect(() => {
    if (providedReport) setReport(providedReport);
    if (providedError) setError(providedError);
  }, [providedError, providedReport]);

  if (error) {
    return (
      <section className="signal-panel" aria-labelledby="benchmark-title">
        <div className="section-heading">
          <img src="/hhgoa/badges/latency-target.svg" alt="" aria-hidden="true" />
          <div>
            <p>Benchmarks</p>
            <h2 id="benchmark-title">Benchmark unavailable</h2>
          </div>
        </div>
        <p className="panel-note">{error}</p>
      </section>
    );
  }

  if (!report) {
    return (
      <section className="signal-panel" aria-label="Loading benchmarks">
        <div className="metrics-grid">
          {['P50', 'P70', 'P95', 'P100'].map((label) => <div className="metric-card skeleton" key={label}><span>{label}</span><strong /></div>)}
        </div>
      </section>
    );
  }

  const latency = report.latency_ms || {};
  const under = report.under_200ms || {};
  const abstention = report.abstention || {};
  const gaugePct = latency.p100 ? Math.min(100, (Number(latency.p100) / 200) * 100) : 0;

  return (
    <section className={`signal-panel benchmark-panel ${compact ? 'compact-benchmark' : ''}`} aria-labelledby="benchmark-title">
      <div className="section-heading">
        <img src="/hhgoa/badges/latency-target.svg" alt="" aria-hidden="true" />
        <div>
          <p>{report.queries_measured} measured queries · {report.generated_at}</p>
          <h2 id="benchmark-title">{compact ? 'Chunking comparison' : 'Benchmark proof'}</h2>
        </div>
      </div>

      {!compact && (
        <>
          <div className="metrics-grid">
            <StatCard label="P50" value={ms(latency.p50)} />
            <StatCard label="P70" value={ms(latency.p70)} />
            <StatCard label="P95" value={ms(latency.p95)} />
            <StatCard label="P100" value={ms(latency.p100)} note="worst observed" />
          </div>

          <div className="gauge-row">
            <div className="target-gauge" style={{ '--gauge': `${gaugePct}%` }}>
              <span>200ms target</span>
              <strong>{ms(latency.p100)}</strong>
              <small>measured maximum</small>
            </div>
            <div className="outcomes-grid">
              <StatCard label="Under 200ms" value={under.pct == null ? '-' : `${under.pct}%`} note={`${under.count}/${under.of}`} />
              <StatCard label="Cold start" value={ms(report.cold_start_ms)} note="excluded from percentiles" />
              <StatCard label="Answered" value={pct(abstention.in_domain_answer_rate)} note={`${abstention.in_domain_answered}/${abstention.in_domain_total}`} />
              <StatCard label="Declined OOD" value={`${abstention.ood_abstained ?? '-'}/${abstention.ood_total ?? '-'}`} />
              <StatCard label="Unsafe blocked" value={`${abstention.unsafe_blocked ?? '-'}/${abstention.unsafe_total ?? '-'}`} />
            </div>
          </div>

          <p className="panel-note">{report.latency_scope}</p>
          <StageBars stages={report.stage_p50_ms} />
        </>
      )}

      <p className="score-explainer">
        Metadata-aware leads R@1/R@5/MRR@10 in this report, while context-enriched leads R@10.
        The selected strategy and active benchmark strategy are shown separately.
      </p>
      <StrategyTable
        comparison={report.strategy_comparison}
        activeStrategy={report.active_strategy}
        selectedStrategy={selectedStrategy}
        compact={compact}
      />
    </section>
  );
}
