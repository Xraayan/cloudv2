import React, { useState, useEffect, useRef } from 'react';
import { getSession, completeSession } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function SessionViewer({ sessionId, onBack }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [viewerContent, setViewerContent] = useState(null);
  const [completed, setCompleted] = useState(false);
  const pdfCanvasRef = useRef(null);
  const currentFileUrlRef = useRef(null);

  useEffect(() => {
    loadSession();
    
    // Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };
    
    // Disable keyboard shortcuts
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        alert('Saving files is disabled for security reasons.');
        return false;
      }
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sessionId]);

  // Refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      loadSession();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSession(sessionId);
      setSession(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = async (file) => {
    setCurrentFile(file);
    setViewerContent('loading');

    try {
      const response = await fetch(`${API_BASE}/api/session/${sessionId}/file/${file.id}/view`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      currentFileUrlRef.current = url;

      if (file.type.includes('pdf')) {
        // Load PDF.js dynamically
        if (!window.pdfjsLib) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            renderPDF(url);
          };
          document.head.appendChild(script);
        } else {
          renderPDF(url);
        }
      } else if (file.type.includes('image')) {
        setViewerContent({ type: 'image', url });
      } else {
        setViewerContent({ type: 'unsupported' });
      }
    } catch (err) {
      setViewerContent({ type: 'error', message: err.message });
    }
  };

  const renderPDF = async (url) => {
    try {
      const pdf = await window.pdfjsLib.getDocument(url).promise;
      const canvases = [];
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.display = 'block';
        canvas.style.margin = '10px auto';
        canvas.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        canvas.oncontextmenu = () => false;
        
        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context, viewport }).promise;
        
        canvases.push(canvas);
      }
      
      setViewerContent({ type: 'pdf', canvases });
    } catch (err) {
      setViewerContent({ type: 'error', message: 'Error loading PDF' });
    }
  };

  const handlePrint = () => {
    if (!currentFile || !currentFileUrlRef.current) {
      alert('⚠️ Please select and view a file first, then click Print.');
      return;
    }

    if (currentFile.type.includes('pdf') && viewerContent?.canvases) {
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = 'none';
      printFrame.style.visibility = 'hidden';
      document.body.appendChild(printFrame);

      const doc = printFrame.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print</title>
          <style>
            body { margin: 0; padding: 0; }
            img { display: block; width: 100%; page-break-after: always; }
            img:last-child { page-break-after: avoid; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
      `);

      viewerContent.canvases.forEach(canvas => {
        const imgData = canvas.toDataURL('image/png');
        doc.write(`<img src="${imgData}">`);
      });

      doc.write('</body></html>');
      doc.close();

      printFrame.contentWindow.onload = () => {
        setTimeout(() => {
          printFrame.contentWindow.print();
          setTimeout(() => {
            document.body.removeChild(printFrame);
          }, 1000);
        }, 300);
      };
    } else if (currentFile.type.includes('image')) {
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = 'none';
      printFrame.style.visibility = 'hidden';
      document.body.appendChild(printFrame);

      const doc = printFrame.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            img { max-width: 100%; max-height: 100%; }
            @media print { body { margin: 0; } img { max-width: 100%; } }
          </style>
        </head>
        <body>
          <img src="${currentFileUrlRef.current}" onload="window.print();">
        </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 5000);
    } else {
      alert('This file type cannot be printed directly.');
    }
  };

  const handleComplete = async () => {
    try {
      await completeSession(sessionId);
      setCompleted(true);
    } catch (err) {
      alert('Failed to complete session: ' + err.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (category) => {
    const icons = {
      pdf: 'PDF',
      image: 'IMG',
      document: 'DOC',
      spreadsheet: 'XLS',
      file: 'FILE'
    };
    return icons[category] || 'FILE';
  };

  const getExpiresIn = () => {
    if (!session?.expiresAt) return 0;
    return Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000 / 60));
  };

  if (completed) {
    return (
      <div className="session-page">
        <div className="modal-overlay">
          <div className="modal-popup">
            <div className="modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="check-icon">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2>Session Completed</h2>
            <p>All files have been securely deleted.</p>
            <button className="btn-primary" onClick={onBack}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  // This block won't be reached but keeping structure
  if (false) {
    return (
      <div className="completed-page">
        <div className="completed-icon">✅</div>
        <h1>Session Completed</h1>
        <p>All files have been securely deleted.</p>
        <button className="btn-primary" onClick={onBack}>Done</button>
      </div>
    );
  }

  if (loading) {
    return <div className="loading-page">Loading session...</div>;
  }

  if (error) {
    return (
      <div className="error-page">
        <div className="error-container">
          <h1>Session Not Found</h1>
          <p>{error}</p>
          <button className="btn-primary" onClick={onBack}>Back to Portal</button>
        </div>
      </div>
    );
  }

  const expiresIn = getExpiresIn();

  return (
    <div className="session-page">
      <div className="session-container">
        <div className="session-header">
          <h1>CloudTab Shopkeeper</h1>
          <p className="session-subtitle">Secure file viewing and printing</p>
          <div className="session-info">
            <div className="info-item">
              <div className="info-label">Session ID</div>
              <div className="info-value">{session.sessionId}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Files</div>
              <div className="info-value">{session.files?.length || 0}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Expires in</div>
              <div className="info-value"><span className="timer">{expiresIn} min</span></div>
            </div>
          </div>
        </div>

        <div className="content">
          <div className="warning-box">
            Session expires in <strong>{expiresIn} minutes</strong>. All files will be automatically deleted after expiration.
          </div>

          <div className="section-title">Uploaded Files</div>
          <div className="files-grid">
            {session.files && session.files.length > 0 ? (
              session.files.map((file) => (
                <div
                  key={file.id}
                  className={`file-item ${currentFile?.id === file.id ? 'active' : ''}`}
                  onClick={() => handleFileClick(file)}
                >
                  <div className="file-icon">{getFileIcon(file.category)}</div>
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{formatFileSize(file.size)}</div>
                  <div className="file-hint">Click to view</div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No files uploaded yet</p>
            )}
          </div>

          <div className="section-title">File Viewer</div>
          <div className="viewer-container" onContextMenu={(e) => e.preventDefault()}>
            {!viewerContent && (
              <div className="viewer-placeholder">Select a file to view</div>
            )}
            
            {viewerContent === 'loading' && (
              <div className="viewer-placeholder">Loading...</div>
            )}
            
            {viewerContent?.type === 'pdf' && (
              <div className="pdf-canvas-container" ref={pdfCanvasRef}>
                {viewerContent.canvases.map((canvas, i) => (
                  <canvas
                    key={i}
                    ref={(el) => {
                      if (el && !el.hasChildNodes()) {
                        el.width = canvas.width;
                        el.height = canvas.height;
                        el.getContext('2d').drawImage(canvas, 0, 0);
                      }
                    }}
                    style={{
                      display: 'block',
                      margin: '10px auto',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                ))}
              </div>
            )}
            
            {viewerContent?.type === 'image' && (
              <img
                src={viewerContent.url}
                alt="Preview"
                className="image-viewer"
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
              />
            )}
            
            {viewerContent?.type === 'unsupported' && (
              <div className="viewer-placeholder">
                File type not viewable in browser. Use print to save.
              </div>
            )}
            
            {viewerContent?.type === 'error' && (
              <div className="viewer-placeholder">
                Error loading file: {viewerContent.message}
              </div>
            )}
          </div>

          <div className="actions">
            <button className="btn-primary" onClick={handlePrint}>Print Document</button>
            <button className="btn-danger" onClick={handleComplete}>Complete Job</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionViewer;
