import React from 'react';

export default function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="HH Goa 2026 generator home">
        <span className="brand-mark" aria-hidden="true">
          <i />
          <b>H</b>
        </span>
        <span>
          <strong>HH GOA <em>26</em></strong>
          <small>BUILDER SIGNAL GENERATOR</small>
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
