import React, { useState } from 'react';
import SessionViewer from './components/SessionViewer';
import './App.css';

function App() {
  const [sessionId, setSessionId] = useState('');
  const [activeSession, setActiveSession] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    const id = sessionId.trim().toUpperCase();
    
    if (!/^[A-Z0-9]{6}$/.test(id)) {
      alert('Invalid session ID. Must be 6 characters.');
      return;
    }
    
    setActiveSession(id);
  };

  const handleBack = () => {
    setActiveSession(null);
    setSessionId('');
  };

  if (activeSession) {
    return <SessionViewer sessionId={activeSession} onBack={handleBack} />;
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo">CloudTab</div>
        <h1>Shopkeeper Portal</h1>
        
        <div className="info-box">
          Enter the 6-digit session ID provided by the customer to access and view their files securely.
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="sessionId">Session ID</label>
            <input
              type="text"
              id="sessionId"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value.toUpperCase())}
              placeholder="Enter code"
              maxLength={6}
              className="session-input"
              required
            />
          </div>
          <button type="submit" className="btn-primary full-width">Access Session</button>
        </form>
      </div>
      
      <footer className="page-footer">
        <p>CloudTab Secure File System</p>
      </footer>
    </div>
  );
}

export default App;
