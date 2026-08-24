import React from 'react';

const NAV = [
  ['ask', 'Ask'],
  ['evidence', 'Evidence'],
  ['benchmarks', 'Benchmarks'],
  ['system', 'System'],
];

export default function Header({ activeTab, setActiveTab, health, healthError, onOpenVideo }) {
  const healthy = health?.status === 'ok';
  const degraded = health?.status === 'degraded' || healthError;

  return (
    <header className="app-header">
      <div className="brand-lockup">
        <img src="/hhgoa/official/hacker-house.png" alt="Hacker House" className="hh-mark" />
        <img src="/hhgoa/official/goa-hindi.svg" alt="HHGoa 2026" className="goa-mark" />
        <img src="/hhgoa/official/247pm.svg" alt="2:47PM" className="pm-mark" />
      </div>

      <div className="header-title">
        <span>EchoRAG / Task 02</span>
        <img src="/hhgoa/badges/rag-in-goa.svg" alt="#RAGInGoa" />
      </div>

      <div className="header-actions">
        <nav className="nav-tabs" aria-label="Primary">
          {NAV.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`nav-tab ${id === 'ask' ? 'ask-tab' : ''} ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        {onOpenVideo && (
          <div className="video-buttons-group">
            <button
              type="button"
              className="video-btn video-btn-process"
              onClick={() => onOpenVideo('video1')}
              title="Watch Video 1: Team & Process"
            >
              🎬 Process
            </button>
            <button
              type="button"
              className="video-btn video-btn-demo"
              onClick={() => onOpenVideo('video2')}
              title="Watch Video 2: Product Demo"
            >
              🎬 Demo
            </button>
          </div>
        )}

        <label className="mobile-nav-select">
          <span>Destination</span>
          <select value={activeTab === 'ask' ? 'evidence' : activeTab} onChange={(e) => setActiveTab(e.target.value)}>
            {NAV.filter(([id]) => id !== 'ask').map(([id, label]) => (
              <option value={id} key={id}>{label}</option>
            ))}
          </select>
        </label>
        <div className={`health-pill ${healthy ? 'ok' : degraded ? 'degraded' : 'loading'}`} title={healthError || health?.startup_error || health?.status || 'Checking backend'}>
          <span className="health-dot" />
          <span>{healthy ? 'Live' : degraded ? 'Degraded' : 'Checking'}</span>
        </div>
      </div>
    </header>
  );
}


