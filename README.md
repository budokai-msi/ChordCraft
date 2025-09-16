# ChordCraft Studio

🎵 **AI-Powered Music Studio** - Transform audio into playable code using Microsoft Muzic AI

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Git

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

### Backend (Flask + Muzic AI)
```bash
cd backend
pip install -r requirements.txt
python app.py
```

## 🎯 Features

- 🧠 **Microsoft Muzic AI** - Advanced audio analysis
- ⚡ **Real-time Code Generation** - Instant ChordCraft code from audio
- 🎹 **Live Playback** - Hear your code as music
- 📱 **Dual Interface** - Timeline and Classic views
- ☁️ **Cloud Sync** - Supabase integration
- 🔐 **Authentication** - Secure user management

## 🏗️ Architecture

- **Frontend**: React + Vite + Tailwind CSS + Supabase
- **Backend**: Flask + Microsoft Muzic AI + Librosa
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 📁 Project Structure

```
chordcraft/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── services/      # Audio engine
│   │   └── utils/         # Utilities
│   └── package.json
├── backend/           # Flask backend
│   ├── app.py         # Main Flask app
│   ├── muzic_integration.py  # Muzic AI integration
│   └── requirements.txt
├── database/          # Database schemas
└── README.md
```

## 🎵 How It Works

1. **Upload Audio** - Drop your audio file
2. **AI Analysis** - Microsoft Muzic AI analyzes tempo, key, harmony
3. **Get Code** - Receive clean, editable ChordCraft code
4. **Play & Edit** - Hear your code and make adjustments

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
```

### Backend Development
```bash
cd backend
python app.py        # Start Flask server
```

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for musicians everywhere**