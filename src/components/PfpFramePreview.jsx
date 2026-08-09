import React from 'react';

export default function PfpFramePreview({ data, photoUrl, getFilterStyle }) {
  return (
    <div className="pfp-frame-wrapper">
      <div className="pfp-top-badge">🌴 HH GOA 2026 🌴</div>

      <div className="pfp-avatar-circle">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Photo"
            className="pfp-avatar-img"
            style={{
              transform: `scale(${data.zoom}) translate(${data.offsetX}px, ${data.offsetY}px)`,
              ...getFilterStyle(),
            }}
          />
        ) : (
          <div style={{ color: '#FFFFFF', fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: '800' }}>
            UPLOAD PHOTO
          </div>
        )}
      </div>

      <div className="pfp-bottom-badge">#FrameInGoa</div>
    </div>
  );
}
