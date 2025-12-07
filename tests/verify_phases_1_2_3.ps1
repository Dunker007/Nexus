$ErrorActionPreference = "Stop"

function Log { param($Message) Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] $Message" }

Log "=== DOUBLE CHECKING PHASES 1, 2, and 3 ==="

# --- PHASE 1: ORCHESTRATION & CORE ---
Log "Checking Phase 1: Core Infrastructure..."
try {
    $Modules = @(
        "src\core\ConfigManager.psm1",
        "src\core\Logger.psm1",
        "src\core\ModuleLoader.psm1",
        "src\core\Orchestrator.ps1"
    )
    foreach ($m in $Modules) {
        if (Test-Path $m) { Log "  [OK] Found $m" } else { throw "Missing $m" }
    }
    Log "Phase 1: Core files present."
}
catch {
    Log "Phase 1 FAILED: $_"
    exit 1
}

# --- PHASE 2: AI PIPELINE (LM STUDIO) ---
Log "`nChecking Phase 2: AI Pipeline..."
try {
    if (Test-Path "src\core\LMStudio-Client.psm1") {
        Import-Module ".\src\core\LMStudio-Client.psm1" -Force
        Log "  [OK] LMStudio-Client module loaded."
        
        # Verify function exists
        if (Get-Command "Invoke-LMStudioGeneration" -ErrorAction SilentlyContinue) {
            Log "  [OK] Invoke-LMStudioGeneration command available."
        }
        else {
            throw "Invoke-LMStudioGeneration not exported."
        }
    }
    else {
        throw "Missing LMStudio-Client.psm1"
    }
    Log "Phase 2: AI Client ready."
}
catch {
    Log "Phase 2 FAILED: $_"
    exit 1
}

# --- PHASE 3: PUBLISHING PIPELINE ---
Log "`nChecking Phase 3: Publishing Pipeline..."
try {
    # HTML Publisher
    if (Test-Path "src\publishers\HtmlPublisher.psm1") {
        Import-Module ".\src\publishers\HtmlPublisher.psm1" -Force
        if (Get-Command "Publish-ContentAsHtml" -ErrorAction SilentlyContinue) {
            Log "  [OK] HtmlPublisher loaded & command available."
        }
        else {
            throw "Publish-ContentAsHtml not exported."
        }
    }
    else {
        throw "Missing HtmlPublisher.psm1"
    }

    # WordPress Publisher
    if (Test-Path "src\publishers\WordPressPublisher.psm1") {
        Import-Module ".\src\publishers\WordPressPublisher.psm1" -Force
        if (Get-Command "Publish-WordPressPost" -ErrorAction SilentlyContinue) {
            Log "  [OK] WordPressPublisher loaded & command available."
        }
        else {
            throw "Publish-WordPressPost not exported."
        }
    }
    else {
        throw "Missing WordPressPublisher.psm1"
    }
    Log "Phase 3: Publishers ready."
}
catch {
    Log "Phase 3 FAILED: $_"
    exit 1
}

Log "`n=== ALL SYSTEMS GO FOR PHASE 4 ==="
