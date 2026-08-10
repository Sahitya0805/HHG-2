import React from 'react';

export default function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="HH Goa 2026 generator home">
        <span className="brand-lockup" aria-hidden="true">
          <img className="brand-wordmark" src="/brand/hacker-house.png" alt="" />
          <img className="brand-hindi" src="/brand/goa-hindi.svg" alt="" />
        </span>
        <span className="brand-product">
          <strong>FRAME LAB</strong>
          <small>COMMUNITY-BUILT · OPEN TRIAL 01</small>
        </span>
      </a>
      <div className="header-meta">
        <span>28—31 OCT 2026</span>
        <span>GOA, INDIA</span>
      </div>
      <a className="hashtag-link" href="https://x.com/search?q=%23FrameInGoa" target="_blank" rel="noreferrer">
        #FrameInGoa ↗
      </a>
    </header>
  );
}
