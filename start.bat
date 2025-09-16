@echo off
echo Starting ChordCraft Studio...
echo.

echo Starting Backend (Flask + Muzic AI)...
start "ChordCraft Backend" cmd /k "cd backend && python app.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend (React + Vite)...
start "ChordCraft Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ChordCraft Studio is starting up!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause
