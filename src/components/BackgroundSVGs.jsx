import React from 'react';

export default function BackgroundSVGs() {
  return (
    <div className="goa-bg-decorations" aria-hidden="true">
      {/* Top Left Floating Palm SVG Silhouette */}
      <svg className="bg-svg bg-palm-left" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 180 Q95 120 40 80 Q90 90 100 180 Z" fill="rgba(3, 41, 29, 0.08)"/>
        <path d="M100 180 Q105 110 160 70 Q110 90 100 180 Z" fill="rgba(8, 115, 63, 0.12)"/>
        <path d="M100 180 Q80 130 20 130 Q70 140 100 180 Z" fill="rgba(254, 225, 1, 0.2)"/>
        <path d="M100 180 Q120 130 180 140 Q130 145 100 180 Z" fill="rgba(3, 41, 29, 0.08)"/>
        <path d="M100 180 Q100 100 100 20 Q105 80 100 180 Z" fill="rgba(8, 115, 63, 0.1)"/>
      </svg>

      {/* Top Right Floating Sun & Orbit Rays */}
      <svg className="bg-svg bg-sun-right" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="150" cy="150" r="70" fill="url(#sunGlowBeige)" />
        <circle cx="150" cy="150" r="100" stroke="rgba(3, 41, 29, 0.12)" strokeWidth="2" strokeDasharray="6 6" className="spinning-ring" />
        <circle cx="150" cy="150" r="130" stroke="rgba(254, 225, 1, 0.3)" strokeWidth="1.5" strokeDasharray="12 12" className="spinning-ring-reverse" />
        <defs>
          <radialGradient id="sunGlowBeige" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(150 150) scale(70)">
            <stop stopColor="#fee101" stopOpacity="0.4" />
            <stop offset="1" stopColor="#ff087c" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Bottom Wave Lines SVG */}
      <svg className="bg-svg bg-waves-bottom" viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 100 C 360 160 720 40 1080 120 C 1260 160 1380 90 1440 100 L1440 200 L0 200 Z" fill="rgba(3, 41, 29, 0.04)" />
        <path d="M0 130 C 360 80 720 170 1080 90 C 1260 50 1380 120 1440 110 L1440 200 L0 200 Z" fill="rgba(8, 115, 63, 0.05)" />
        <path d="M0 150 C 400 120 800 180 1440 140" stroke="rgba(3, 41, 29, 0.12)" strokeWidth="2" className="floating-wave" />
      </svg>

      {/* Floating Ambient Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
    </div>
  );
}
