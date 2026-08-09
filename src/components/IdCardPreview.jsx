import React from 'react';

export default function IdCardPreview({ data, photoUrl, getFilterStyle }) {
  return (
    <div className={`id-card-wrapper theme-${data.theme}`}>
      <div className="id-card-header-bar">
        <span className="left">2:47 PM STUDIO</span>
        <span className="right">28 — 31 OCT 2026</span>
      </div>

      <div className="id-card-inner">
        <div className="id-card-title-row">
          <div className="id-card-main-title">HACKER HOUSE</div>
          <div className="id-card-goa-badge">गोवा 🌴</div>
        </div>

        <div className="id-card-sub-title">GOA, INDIA • BUILDER ID CARD</div>
        <div className="id-card-divider" />

        <div className="id-card-photo-box">
          <div className="id-card-verified-badge">VERIFIED BUILDER</div>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Photo"
              className="id-card-photo-img"
              style={{
                transform: `scale(${data.zoom}) translate(${data.offsetX}px, ${data.offsetY}px)`,
                ...getFilterStyle(),
              }}
            />
          ) : (
            <div className="id-card-photo-placeholder">YOUR PHOTO</div>
          )}
        </div>

        {data.stickers.length > 0 && (
          <div className="id-card-stickers-column">
            {data.stickers.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        )}

        <div className="id-card-name">{(data.name || 'YOUR NAME HERE').toUpperCase()}</div>

        <div>
          <div className="id-card-role-pill">{(data.role || 'FULL STACK DEVELOPER').toUpperCase()}</div>
        </div>

        <div className="id-card-title-box">
          <span className="id-card-title-label">BUILDER CLASS</span>
          <div className="id-card-title-text">"{data.title || '🌴 CODE SURFER'}"</div>
        </div>

        <div className="id-card-footer">
          <div className="id-card-barcode">|||| ||| ||||</div>
          <div className="id-card-hashtag-badge">#FrameInGoa</div>
          <div className="id-card-serial">
            <div>{data.serial || 'PASS #849204'}</div>
            <div style={{ color: '#6B7280', fontSize: '9px' }}>GOA, INDIA</div>
          </div>
        </div>
      </div>
    </div>
  );
}
