#!/usr/bin/env pwsh
param([string]$Action = "start")

function Write-Info($msg)    { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[OK]   $msg" -ForegroundColor Green }
function Write-ErrorMsg($msg){ Write-Host "[ERR]  $msg" -ForegroundColor Red }

function Stop-Processes {
    Write-Info "Deteniendo procesos..."
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Success "Procesos detenidos"
}

function Start-Backend {
    Write-Info "Iniciando backend..."
    Set-Location "backend"
    Start-Process ".\mvnw.cmd" -ArgumentList "spring-boot:run","-Dspring-boot.run.profiles=development" -NoNewWindow
    Set-Location ".."
    Write-Success "Backend iniciado en http://localhost:8080/swagger-ui/index.html#/"
}

function Start-Frontend {
    Write-Info "Iniciando frontend..."
    Set-Location "frontend"
    Start-Process "npm.cmd" -ArgumentList "run","dev" -NoNewWindow
    Set-Location ".."
    Write-Success "Frontend iniciado en http://localhost:5173"
}

if ($Action -eq "start") {
    Stop-Processes
    Start-Backend
    Start-Frontend
    Write-Info "Presiona Ctrl+C para detener la aplicación"
    while ($true) { Start-Sleep -Seconds 30 }
}
elseif ($Action -eq "stop") {
    Stop-Processes
}
else {
    Write-ErrorMsg "Acción no válida. Usa: .\run-project.ps1 start | stop"
}
