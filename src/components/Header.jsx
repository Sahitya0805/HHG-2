import React from 'react';

export default function Header() {
  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div className="brand-badge">🌴</div>
        <div>
          <div className="brand-title">HH GOA 2026</div>
          <div className="brand-sub">28–31 OCT 2026 • GOA, INDIA</div>
        </div>
      </div>
      <div className="hashtag-pill">#FrameInGoa</div>
    </header>
  );
}
