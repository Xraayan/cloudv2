# CloudTab - Secure File Sharing for Print Shops

Secure file transfer system for internet cafes where customers upload documents, shopkeepers view and print them securely, and all files auto-delete after completion. Built with React, Node.js, and AES-256 encryption.

## Live Deployment

- Customer Portal: https://cloudv2-omega.vercel.app
- Shopkeeper Portal: https://cloudv2-46qq.vercel.app
- Backend API: https://cloudtab-backend-jmxd.onrender.com

## Core Features

**Security**
- AES-256-CBC encryption for all uploaded files
- Session-based access with 6-character unique codes
- Screenshot protection (desktop browsers)
- Auto-deletion after job completion
- CORS protection and secure headers

**Functionality**
- Drag-and-drop file upload with multiple file support
- QR code generation for easy session sharing
- Canvas-based PDF rendering (view-only, no downloads)
- Session expiration after 5 minutes of inactivity
- Responsive design for desktop and mobile

**Supported File Types**
- PDF documents
- Images: JPG, PNG, JPEG
- Max file size: 50MB per file

## Project Structure

```
cloudtab/
├── frontend/                 # Customer upload portal (React + Vite)
│   ├── src/
│   │   ├── components/      # FileUpload, SessionSuccess
│   │   ├── services/        # API client (axios)
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
├── shopkeeper-portal/       # Shopkeeper viewer (React + Vite)
│   ├── src/
│   │   ├── components/      # SessionViewer (PDF.js canvas rendering)
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── routes/         # Upload, shopkeeper routes
│   │   ├── controllers/    # File upload logic
│   │   ├── middleware/     # Error handling
│   │   ├── utils/          # Encryption, session management
│   │   └── server.js
│   ├── sessions/           # Session metadata (JSON)
│   ├── uploads/            # Encrypted files
│   └── package.json
│
└── README.md
```

## Quick Start (Local Development)

### Prerequisites
- Node.js 16+
- npm

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
ENCRYPTION_KEY=your-64-character-hex-key
SESSION_TIMEOUT=300000
```

Generate encryption key:
```bash
npm run generate-key
```

Start backend:
```bash
npm start
```

Backend runs at `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### 3. Shopkeeper Portal Setup

```bash
cd shopkeeper-portal
npm install
npm run dev
```

Shopkeeper portal runs at `http://localhost:5174`

## How It Works

**Customer Flow:**
1. Open customer portal
2. Drag-drop or select files
3. Click "Upload Files"
4. Receive 6-character session ID and QR code
5. Share code with shopkeeper

**Shopkeeper Flow:**
1. Scan QR code or enter session ID
2. View files securely (canvas-rendered, no downloads)
3. Print files using browser print dialog
4. Click "Job Complete" - all files deleted permanently

**Security Flow:**
```
Upload → AES-256 Encrypt → Store Encrypted
Access → Validate Session → Decrypt in Memory → Canvas Render
Complete → Delete Files → Clear Session
```

## Security Architecture

**Encryption**
- Algorithm: AES-256-CBC
- Key size: 256-bit (32 bytes)
- Random IV per file
- Files encrypted at rest, decrypted in memory only

**Session Management**
- 6-character alphanumeric session IDs
- 5-minute auto-expiration
- Single-use sessions (deleted after completion)
- No database - JSON file storage

**Screenshot Protection (Desktop)**
- PrintScreen key blocking
- Keyboard shortcut blocking (Ctrl+P, F12, etc.)
- Window blur detection - black overlay when switching
- Right-click disabled
- Text selection disabled
- Canvas-based rendering (non-selectable content)

**Network Security**
- HTTPS enforced in production
- CORS whitelisting
- No cookies - stateless sessions
- Secure headers (no-cache, no-store)

**Data Privacy**
- Zero permanent storage
- Files auto-deleted on timeout/completion
- Decrypted data exists only in memory
- No logging of file contents

## API Endpoints

```
POST   /api/upload                    Upload files, returns session ID
GET    /api/session/:sessionId        Get session details
GET    /api/session/:sessionId/file/:fileId    Get decrypted file
POST   /api/session/:sessionId/complete        Delete session and files
GET    /api/health                    Health check
```

## Environment Configuration

**Backend (.env)**
```env
PORT=5000
ENCRYPTION_KEY=<64-char-hex-string>
SESSION_TIMEOUT=300000
ALLOWED_ORIGINS=https://cloudv2-omega.vercel.app,https://cloudv2-46qq.vercel.app
```

**Frontend (.env)**
```env
VITE_API_URL=https://cloudtab-backend-jmxd.onrender.com
```

**Shopkeeper Portal (.env)**
```env
VITE_API_URL=https://cloudtab-backend-jmxd.onrender.com
```

## Tech Stack

**Frontend & Shopkeeper Portal**
- React 18
- Vite (build tool)
- Axios (API client)
- QRCode.react (QR generation)
- PDF.js (canvas-based PDF rendering)

**Backend**
- Node.js + Express
- Multer (file uploads)
- Crypto (AES-256 encryption)
- CORS (cross-origin security)

**Deployment**
- Vercel (frontends)
- Render (backend)

## Troubleshooting

**Port conflicts:**
```bash
npx kill-port 5000  # Backend
npx kill-port 5173  # Frontend
npx kill-port 5174  # Shopkeeper portal
```

**CORS errors:**
Ensure ALLOWED_ORIGINS in backend includes your frontend URLs.

**Session not found:**
Session may have expired (5-minute timeout) or invalid session ID format.

## License

MIT License

---

Built for secure file handling in print shops and internet cafes.
