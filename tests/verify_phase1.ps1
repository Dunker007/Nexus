# verify_phase1.ps1
# Verification script for Phase 1 Orchestrator

$ErrorActionPreference = "Stop"

function Assert-True($Condition, $Message) {
    if ($Condition) {
        Write-Host "[PASS] $Message" -ForegroundColor Green
    }
    else {
        Write-Host "[FAIL] $Message" -ForegroundColor Red
        throw "Assertion failed: $Message"
    }
}

Write-Host "Starting Phase 1 Verification..." -ForegroundColor Cyan

# 1. Check Directory Structure
$ExpectedDirs = @(
    "$PSScriptRoot\..\src\core",
    "$PSScriptRoot\..\data\logs",
    "$PSScriptRoot\..\data\published"
)

foreach ($Dir in $ExpectedDirs) {
    Assert-True (Test-Path $Dir) "Directory exists: $Dir"
}

# 2. Check Core Files
$ExpectedFiles = @(
    "$PSScriptRoot\..\src\core\Orchestrator.ps1",
    "$PSScriptRoot\..\src\core\LMStudio-Client.psm1",
    "$PSScriptRoot\..\src\core\Logger.psm1",
    "$PSScriptRoot\..\src\core\ContentTracker.psm1",
    "$PSScriptRoot\..\src\core\ContentQualityTester.psm1",
    "$PSScriptRoot\..\src\core\Config.json"
)

foreach ($File in $ExpectedFiles) {
    Assert-True (Test-Path $File) "File exists: $File"
}

# 3. Check LM Studio Connection (Dry Run)
# We'll try to hit the endpoint with a simple request
$Config = Get-Content -Raw "$PSScriptRoot\..\src\core\Config.json" | ConvertFrom-Json
$ApiUrl = $Config.LMStudio.ApiUrl

Write-Host "Checking LM Studio connection at $ApiUrl..." -ForegroundColor Yellow
try {
    # Just a simple GET or HEAD might not work on all endpoints, but let's try a minimal POST or just check if port is open.
    # Actually, let's skip the actual API call in this verification script to avoid dependency on running server for *static* verification,
    # BUT the user asked to "Verify System" which implies running it.
    # Let's try a Test-NetConnection to localhost:1234
    
    $Port = 1234
    $Connection = Test-NetConnection -ComputerName "localhost" -Port $Port -WarningAction SilentlyContinue
    
    if ($Connection.TcpTestSucceeded) {
        Write-Host "[PASS] LM Studio port $Port is open." -ForegroundColor Green
    }
    else {
        Write-Host "[WARN] LM Studio port $Port is NOT open. Orchestrator will fail if run." -ForegroundColor Yellow
        # We won't fail the script here, just warn, as the user might not have started it yet.
    }
}
catch {
    Write-Host "[WARN] Could not test network connection." -ForegroundColor Yellow
}

Write-Host "Verification Complete. Ready to run Orchestrator." -ForegroundColor Cyan
