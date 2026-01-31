import React, { useState } from 'react';
import { uploadFiles } from './services/api.js';
import { FileUpload } from './components/FileUpload.jsx';
import { SessionSuccess } from './components/SessionSuccess.jsx';
import './App.css';

function App() {
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (files) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await uploadFiles(files);
      setSessionData(data);
    } catch (err) {
      setError(err.message);
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      {sessionData ? (
        <SessionSuccess
          sessionId={sessionData.sessionId}
          expiresAt={sessionData.expiresAt}
          files={sessionData.files}
        />
      ) : (
        <>
          <FileUpload onUpload={handleFileUpload} isLoading={isLoading} />
          {error && (
            <div className="error-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{marginRight: '8px', verticalAlign: 'middle'}}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
