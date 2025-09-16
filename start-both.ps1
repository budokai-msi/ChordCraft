# ChordCraft Full Stack Start Script
Write-Host "Starting ChordCraft Full Stack..." -ForegroundColor Yellow

# Start backend in background
Write-Host "Starting backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-File", "start-backend.ps1" -WindowStyle Minimized

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Blue
cd frontend
npm run dev
