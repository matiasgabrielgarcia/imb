# Start all three services simultaneously
Write-Host "Starting all services..." -ForegroundColor Green

# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\back'; Write-Host 'Starting Backend...' -ForegroundColor Cyan; npm run dev"

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\front'; Write-Host 'Starting Frontend...' -ForegroundColor Yellow; npm run dev"

# Start WhatsApp service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\wapp'; Write-Host 'Starting WhatsApp Service...' -ForegroundColor Magenta; npm run dev"

Write-Host "`nAll services started in separate windows!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "WhatsApp: http://localhost:3002" -ForegroundColor Magenta

