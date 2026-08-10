import React from 'react';

export default function Header() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="HH Goa 2026 generator home">
          <span className="brand-lockup" aria-hidden="true">
            <img className="brand-wordmark" src="/brand/hacker-house.png" alt="" />
            <img className="brand-hindi" src="/brand/goa-hindi.svg" alt="" />
          </span>
        </a>

        <div className="header-task">
          <span>TASK 01</span>
          <strong>FRAME / ID GENERATOR</strong>
        </div>

        <div className="header-actions">
          <a className="hashtag-link" href="https://x.com/search?q=%23FrameInGoa" target="_blank" rel="noreferrer">
            #FrameInGoa ↗
          </a>
          <img className="studio-logo" src="/brand/247pm.svg" alt="2:47PM Studio" />
        </div>
      </header>
      <div className="event-bar">
        <span>GOA, INDIA</span>
        <i aria-hidden="true" />
        <span>28—31 OCT 2026</span>
      </div>
    </>
  );
}
