# Cloud Optimization Dashboard Development Server Startup

Write-Host "🚀 Starting Cloud Optimization Dashboard..." -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "Starting Backend API Server..." -ForegroundColor Cyan
Write-Host "Backend will run on: http://localhost:8000" -ForegroundColor Gray
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Gray
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd E:\cloudptimization\backend; uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# Give backend time to start
Start-Sleep -Seconds 3

# Install frontend dependencies if needed
Write-Host ""
Write-Host "Installing Frontend Dependencies..." -ForegroundColor Cyan
cd E:\cloudptimization\frontend
if ((Test-Path "node_modules") -eq $false) {
    npm install
}

# Start Frontend
Write-Host ""
Write-Host "Starting Frontend Development Server..." -ForegroundColor Cyan
Write-Host "Frontend will run on: http://localhost:3000" -ForegroundColor Gray
npm run dev

Write-Host ""
Write-Host "✅ All services started!" -ForegroundColor Green
