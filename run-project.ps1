#!/usr/bin/env pwsh
param([string]$Action = "start")

function Write-Info($msg)    { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[OK]   $msg" -ForegroundColor Green }
function Write-ErrorMsg($msg){ Write-Host "[ERR]  $msg" -ForegroundColor Red }

function Test-ProjectStructure {
    Write-Info "Verifying project structure..."
    
    # Essential validations only once
    if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
        Write-ErrorMsg "Incorrect project structure. Run the script from the project root."
        return $false
    }
    
    if (-not (Test-Path "backend/mvnw.cmd") -and -not (Test-Path "backend/mvnw")) {
        Write-ErrorMsg "Maven wrapper not found in 'backend/' directory."
        return $false
    }
    
    if (-not (Test-Path "frontend/package.json")) {
        Write-ErrorMsg "File 'frontend/package.json' not found."
        return $false
    }
    
    Write-Success "Project structure validated"
    return $true
}

function Stop-Processes {
    Write-Info "Stopping processes..."
    try {
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        Write-Success "Processes stopped"
    } catch {
        Write-ErrorMsg "Error stopping processes: $($_.Exception.Message)"
    }
}

function Start-Backend {
    Write-Info "Starting backend..."
    try {
        Set-Location "backend"
        
        # Determine Maven command based on OS
        $mvnCmd = if ($IsWindows -or $env:OS -eq "Windows_NT") { ".\mvnw.cmd" } else { "./mvnw" }
        
        Start-Process $mvnCmd -ArgumentList "spring-boot:run","-Dspring-boot.run.profiles=development" -NoNewWindow
        Set-Location ".."
        
    } catch {
        Set-Location ".." -ErrorAction SilentlyContinue
        Write-ErrorMsg "Error starting backend: $($_.Exception.Message)"
        throw
    }
}

function Start-Frontend {
    Write-Info "Starting frontend..."
    try {
        Set-Location "frontend"
        
        # Auto-install dependencies if needed
        if (-not (Test-Path "node_modules")) {
            Write-Info "Installing dependencies with npm install..."
            $npmInstallCmd = if ($IsWindows -or $env:OS -eq "Windows_NT") { "npm.cmd" } else { "npm" }
            Start-Process $npmInstallCmd -ArgumentList "install" -Wait -NoNewWindow
        }
        
        # Start development server
        $npmCmd = if ($IsWindows -or $env:OS -eq "Windows_NT") { "npm.cmd" } else { "npm" }
        Start-Process $npmCmd -ArgumentList "run","dev" -NoNewWindow
        
        Set-Location ".."
        
    } catch {
        Set-Location ".." -ErrorAction SilentlyContinue
        Write-ErrorMsg "Error starting frontend: $($_.Exception.Message)"
        throw
    }
}

# Main logic
try {
    if ($Action -eq "start") {
        # Validate project structure only once
        if (-not (Test-ProjectStructure)) {
            Write-ErrorMsg "Validation failed. Aborting execution."
            exit 1
        }
        
        Write-Info "Starting complete application..."
        Stop-Processes
        Start-Backend
        Start-Frontend
        
        Start-Sleep -Seconds 20  # Wait between services
        Write-Success "Application started successfully!"
        Write-Info "Backend: http://localhost:8080/swagger-ui/index.html#/"
        Write-Info "Frontend: http://localhost:5173"
        Write-Info "Press Ctrl+C to stop"
        
        # Keep execution running
        while ($true) { Start-Sleep -Seconds 30 }
    }
    elseif ($Action -eq "stop") {
        Stop-Processes
    }
    else {
        Write-ErrorMsg "Invalid action. Usage: .\run-project.ps1 [start|stop]"
        exit 1
    }
} catch {
    Write-ErrorMsg "Critical error: $($_.Exception.Message)"
    exit 1
}
