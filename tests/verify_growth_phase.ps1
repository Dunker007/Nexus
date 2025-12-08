$ErrorActionPreference = "Stop"

function Log { param($Message) Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] $Message" }

Log "=== VERIFYING GROWTH PHASE: PIPELINE ACTIVE ==="

# --- PHASE 1: ORCHESTRATION & CORE ---
Log "Checking Phase 1: Core Infrastructure..."
try {
    $Modules = @(
        "pipeline\core\ConfigManager.psm1",
        "pipeline\core\Logger.psm1",
        "pipeline\core\ModuleLoader.psm1",
        "pipeline\core\Orchestrator.ps1",
        "pipeline\core\LMStudio-Client.psm1",
        "pipeline\core\ContentQualityTester.psm1",
        "pipeline\core\ContentTracker.psm1"
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
    if (Test-Path "pipeline\core\LMStudio-Client.psm1") {
        Import-Module ".\pipeline\core\LMStudio-Client.psm1" -Force
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
    if (Test-Path "pipeline\publishers\HtmlPublisher.psm1") {
        Import-Module ".\pipeline\publishers\HtmlPublisher.psm1" -Force
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
    if (Test-Path "pipeline\publishers\WordPressPublisher.psm1") {
        Import-Module ".\pipeline\publishers\WordPressPublisher.psm1" -Force
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

# --- PHASE 4: CONFIG ---
Log "`nChecking Phase 4: Configuration..."
try {
    if (Test-Path "pipeline\core\Config.json") {
        $Config = Get-Content ".\pipeline\core\Config.json" | ConvertFrom-Json
        Log "  [OK] Config.json loaded."
        
        if ($Config.LMStudio.ApiUrl) {
            Log "  [OK] LMStudio API URL: $($Config.LMStudio.ApiUrl)"
        }
        
        if ($Config.WordPress) {
            $wpStatus = if ($Config.WordPress.Enabled) { "ENABLED" } else { "DISABLED" }
            Log "  [INFO] WordPress: $wpStatus"
        }
    }
    else {
        throw "Missing Config.json"
    }
    Log "Phase 4: Configuration valid."
}
catch {
    Log "Phase 4 FAILED: $_"
    exit 1
}

Log "`n=== PIPELINE VERIFICATION COMPLETE ==="
Log "Status: UNFROZEN and READY for Growth Phase"
Log ""
Log "Next Steps:"
Log "  1. Ensure LM Studio is running at $($Config.LMStudio.ApiUrl)"
Log "  2. Test dry-run: .\pipeline\core\Orchestrator.ps1"
Log "  3. Check output in: $($Config.Paths.Output)"
