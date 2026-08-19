import React from 'react';

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="app-header">
      <div className="brand-logo">
        <img src="/brand/hacker-house.png" alt="Hacker House" className="brand-svg-icon" />
        <div>
          <span className="brand-title">EchoRAG</span>
          <span className="brand-serif">Goa</span>
        </div>
        <span className="brand-tag">Goa '26 🌴</span>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          🎙️ Voice Search
        </button>
        <button
          className={`nav-tab ${activeTab === 'evidence' ? 'active' : ''}`}
          onClick={() => setActiveTab('evidence')}
        >
          🔎 Evidence Viewer
        </button>
        <button
          className={`nav-tab ${activeTab === 'benchmark' ? 'active' : ''}`}
          onClick={() => setActiveTab('benchmark')}
        >
          ⚡ Benchmark Lab
        </button>
        <button
          className={`nav-tab ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          🟢 System Status
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/brand/goa-hindi.svg" alt="Goa Hindi" style={{ height: '26px', filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.15))' }} />
        <div className="target-badge">
          <span className="target-dot"></span>
          <span>Target &lt; 200ms</span>
        </div>
      </div>
    </header>
  );
}
