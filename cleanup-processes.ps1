# PowerShell script to kill ghost Node.js and Electron processes
# Run this before starting the app to free up RAM

Write-Host "🧹 Cleaning up ghost processes..." -ForegroundColor Cyan

# Kill all node processes
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force
    Write-Host "✅ Node.js processes killed" -ForegroundColor Green
} else {
    Write-Host "✅ No Node.js processes found" -ForegroundColor Green
}

# Kill all electron processes
$electronProcesses = Get-Process -Name "electron" -ErrorAction SilentlyContinue
if ($electronProcesses) {
    Write-Host "Found $($electronProcesses.Count) Electron process(es)" -ForegroundColor Yellow
    $electronProcesses | Stop-Process -Force
    Write-Host "✅ Electron processes killed" -ForegroundColor Green
} else {
    Write-Host "✅ No Electron processes found" -ForegroundColor Green
}

# Kill any orphaned Vite processes
$viteProcesses = Get-Process | Where-Object { $_.CommandLine -like "*vite*" } -ErrorAction SilentlyContinue
if ($viteProcesses) {
    Write-Host "Found $($viteProcesses.Count) Vite process(es)" -ForegroundColor Yellow
    $viteProcesses | Stop-Process -Force
    Write-Host "✅ Vite processes killed" -ForegroundColor Green
}

Write-Host "`n✨ Cleanup complete! You can now run 'npm run dev-desktop'" -ForegroundColor Cyan
