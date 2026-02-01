import React from 'react';
import QRCode from 'qrcode.react';

// Shopkeeper portal URL - update for production
const SHOPKEEPER_URL = import.meta.env.VITE_SHOPKEEPER_URL || 'https://cloudv2-46qq.vercel.app';

export function SessionSuccess({ sessionId, expiresAt, files }) {
  const expiresDate = new Date(expiresAt);
  const expiresIn = Math.floor((expiresAt - Date.now()) / 1000 / 60);

  // QR code leads directly to shopkeeper portal with session ID
  const qrUrl = `${SHOPKEEPER_URL}?session=${sessionId}`;

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h1>Upload Successful</h1>
        <p className="subtitle">Your files have been securely uploaded and encrypted.</p>

        <div className="session-details">
          <div className="detail-row">
            <span className="label">Session ID:</span>
            <span className="value highlight">{sessionId}</span>
          </div>
          <div className="detail-row">
            <span className="label">Files Uploaded:</span>
            <span className="value">{files.length}</span>
          </div>
          <div className="detail-row">
            <span className="label">Expires In:</span>
            <span className="value timer">{expiresIn} minutes</span>
          </div>
        </div>

        <div className="qr-section">
          <p>Shopkeeper: Scan this QR to view and print files</p>
          <div className="qr-container">
            <QRCode 
              value={qrUrl}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>

        <div className="files-list">
          <h3>Uploaded Files:</h3>
          {files.map((file, idx) => (
            <div key={idx} className="file-row">
              <span className="file-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </span>
              <span className="file-name">{file.name}</span>
              <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
            </div>
          ))}
        </div>

        <div className="actions">
          <button className="btn btn-secondary" onClick={() => window.location.href = '/upload'}>
            Upload More Files
          </button>
        </div>

        <div className="warning">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{marginRight: '8px', verticalAlign: 'middle'}}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <strong>Important:</strong> Session will expire in {expiresIn} minutes. All files will be automatically deleted.
        </div>
      </div>
    </div>
  );
}
