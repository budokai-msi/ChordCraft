# ChordCraft Full Stack Start Script
Write-Host "Starting ChordCraft Full Stack..." -ForegroundColor Yellow

# Start backend in background
Write-Host "Starting backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit","-Command","`"Set-Location '$PSScriptRoot\backend'; python app.py`""

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit","-Command","`"Set-Location '$PSScriptRoot\frontend'; npm run dev`""
