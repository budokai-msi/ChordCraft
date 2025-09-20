# ChordCraft Startup Guide

## How to Start ChordCraft (Start Mining)

### Quick Start Options

**Option 1: Automatic Start (Recommended)**
```bash
# Linux/Mac
./start.sh

# Windows
start.bat
# or
.\start-both.ps1
```

**Option 2: Manual Start**
```bash
# Start Backend (Terminal 1)
cd backend
pip install -r requirements.txt
python app.py

# Start Frontend (Terminal 2) 
cd frontend
npm install
npm run dev
```

### What This Starts
- **Backend Server**: http://localhost:5000 (Flask + AI analysis)
- **Frontend App**: http://localhost:5173 (React development server)

### Prerequisites
- Python 3.8+ installed
- Node.js 18+ installed
- Git installed

## Deployment and Public Access

### Current Deployment Status
The application is configured for Vercel deployment with these settings:

**Public Access**: 
- The app can be made public through Vercel deployment
- Currently configured for: `https://chord-craft-l32h.vercel.app`
- CORS allows specific domains for API access

**Making It Public**:
1. Deploy to Vercel (already configured)
2. Set environment variables in Vercel dashboard
3. Configure custom domain if desired
4. Backend needs separate hosting (VPS/cloud provider)

### Environment Setup for Public Deployment
```bash
# Frontend environment variables needed:
VITE_BACKEND_URL=https://your-api-domain.com
VITE_FFMPEG_CORE_URL=https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js

# Backend environment variables:
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-key
```

## Architecture Overview
- **Frontend**: React app with audio processing capabilities
- **Backend**: Python Flask server with Microsoft Muzic AI integration
- **Database**: Supabase (PostgreSQL) for user data and project storage
- **Audio Processing**: FFmpeg WebAssembly for client-side audio manipulation

## Troubleshooting
- If backend fails to start: Check Python dependencies in requirements.txt
- If frontend has CORS errors: Verify backend URL in environment variables
- If audio processing fails: Check FFmpeg WebAssembly loading from unpkg.com