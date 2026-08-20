import React, { useEffect, useState } from 'react';
import { getBenchmark } from '../lib/api.js';

// Renders latency_report.json as measured. No report -> says so.
export default function BenchmarkDashboard() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getBenchmark().then(setReport).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="glass-panel">
        <h3 style={{ fontFamily: 'var(--font-heading)' }}>NO BENCHMARK REPORT</h3>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{error}</p>
        <code style={{ fontSize: '0.8rem' }}>python -m benchmarks.harness --queries 300</code>
      </div>
    );
  }
  if (!report) {
    return <div className="glass-panel"><p style={{ fontFamily: 'var(--font-mono)' }}>Loading benchmark…</p></div>;
  }

  const L = report.latency_ms;
  const cmp = report.strategy_comparison || {};

  const Stat = ({ label, value, note }) => (
    <div style={{
      border: '2px solid var(--card-border)', borderRadius: '14px', padding: '0.85rem 1rem',
      background: 'rgba(255,255,255,0.6)', flex: '1 1 140px',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800 }}>{value}</div>
      {note && <div style={{ fontSize: '0.7rem', color: 'var(--ink-muted)' }}>{note}</div>}
    </div>
  );

  return (
    <div className="glass-panel">
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--ink-muted)' }}>
        MEASURED LATENCY — {report.queries_measured} QUERIES · {report.generated_at}
      </h3>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
        {report.latency_scope}
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '1rem 0' }}>
        <Stat label="P50" value={`${L.p50}ms`} />
        <Stat label="P70" value={`${L.p70}ms`} />
        <Stat label="P95" value={`${L.p95}ms`} />
        <Stat label="P100" value={`${L.p100}ms`} note="worst observed" />
        <Stat label="Under 200ms" value={`${report.under_200ms.pct}%`} note={`${report.under_200ms.count}/${report.under_200ms.of}`} />
        <Stat label="Cold start" value={`${report.cold_start_ms}ms`} note="first query, excluded from percentiles" />
      </div>

      <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
        ABSTENTION BEHAVIOUR
      </h4>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '0.5rem 0 1.5rem' }}>
        <Stat label="In-domain answered" value={`${(report.abstention.in_domain_answer_rate * 100).toFixed(1)}%`} note={`${report.abstention.in_domain_answered}/${report.abstention.in_domain_total}`} />
        <Stat label="Out-of-domain declined" value={`${report.abstention.ood_abstained}/${report.abstention.ood_total}`} />
        <Stat label="Unsafe blocked" value={`${report.abstention.unsafe_blocked}/${report.abstention.unsafe_total}`} />
      </div>

      <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
        STRATEGY COMPARISON — RECALL FROM MSMARCO <code>is_selected</code> GOLD LABELS
      </h4>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--card-border)' }}>
              <th style={{ padding: '6px' }}>strategy</th>
              <th style={{ padding: '6px' }}>chunks</th>
              <th style={{ padding: '6px' }}>R@1</th>
              <th style={{ padding: '6px' }}>R@5</th>
              <th style={{ padding: '6px' }}>R@10</th>
              <th style={{ padding: '6px' }}>MRR@10</th>
              <th style={{ padding: '6px' }}>P50</th>
              <th style={{ padding: '6px' }}>P100</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(cmp).map(([name, m]) => (
              <tr key={name} style={{ borderBottom: '1px solid var(--line)', background: name === report.active_strategy ? 'rgba(4,120,87,0.08)' : 'transparent' }}>
                <td style={{ padding: '6px', fontWeight: 700 }}>{name}</td>
                <td style={{ padding: '6px' }}>{m.chunks?.toLocaleString()}</td>
                <td style={{ padding: '6px' }}>{m['recall@1']}</td>
                <td style={{ padding: '6px' }}>{m['recall@5']}</td>
                <td style={{ padding: '6px' }}>{m['recall@10']}</td>
                <td style={{ padding: '6px' }}>{m['mrr@10']}</td>
                <td style={{ padding: '6px' }}>{m.p50_ms}ms</td>
                <td style={{ padding: '6px' }}>{m.p100_ms}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: 'var(--ink-muted)', marginTop: '1.5rem' }}>
        PER-STAGE P50
      </h4>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
        {Object.entries(report.stage_p50_ms || {}).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--line)' }}>
            <span>{k}</span><span style={{ fontWeight: 700 }}>{v}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}
