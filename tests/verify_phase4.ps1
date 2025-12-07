$ErrorActionPreference = "Stop"

Write-Host "Verifying Phase 4 implementation..."

# 1. Verify AdManager
Write-Host "Checking AdManager..."
try {
    Import-Module ".\src\revenue\AdManager.psm1" -Force
    if (Get-Command "Get-AdCode" -ErrorAction SilentlyContinue) {
        Write-Host "  [OK] AdManager loaded."
    }
    else {
        throw "Get-AdCode not found."
    }
}
catch {
    Write-Error "AdManager failed: $_"
    exit 1
}

# 2. Verify Config
Write-Host "Checking Config.json..."
try {
    $Config = Get-Content ".\src\core\Config.json" | ConvertFrom-Json
    if ($Config.Revenue.AdSense.Enabled) {
        Write-Host "  [OK] Revenue config found."
    }
    else {
        throw "Revenue config missing or disabled."
    }
}
catch {
    Write-Error "Config check failed: $_"
    exit 1
}

# 3. Verify Template
Write-Host "Checking HTML Template..."
if (Test-Path ".\config\templates\default.html") {
    $content = Get-Content ".\config\templates\default.html" -Raw
    if ($content -match "{{AD_HEADER}}") {
        Write-Host "  [OK] Template has ad placeholders."
    }
    else {
        throw "Template missing {{AD_HEADER}} placeholder."
    }
}
else {
    Write-Error "Template file missing."
    exit 1
}

# 4. Verify Orchestrator Syntax
Write-Host "Checking Orchestrator syntax..."
$errors = $null
[System.Management.Automation.PSParser]::Tokenize((Get-Content ".\src\core\Orchestrator.ps1" -Raw), [ref]$errors) | Out-Null
if ($errors) {
    foreach ($err in $errors) { Write-Error "Syntax error: $($err.Message)" }
    exit 1
}
Write-Host "  [OK] Orchestrator syntax valid."

Write-Host "Phase 4 Verification Complete!" -ForegroundColor Green
