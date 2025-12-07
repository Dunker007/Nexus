$ErrorActionPreference = "Stop"

Write-Host "Verifying module imports..."
try {
    Import-Module ".\src\core\Logger.psm1" -Force
    Import-Module ".\src\core\LMStudio-Client.psm1" -Force
    Import-Module ".\src\core\ContentQualityTester.psm1" -Force
    Import-Module ".\src\core\ContentTracker.psm1" -Force
    Import-Module ".\src\publishers\HtmlPublisher.psm1" -Force
    Import-Module ".\src\publishers\WordPressPublisher.psm1" -Force
    Write-Host "All modules imported successfully." -ForegroundColor Green
}
catch {
    Write-Error "Module import failed: $_"
    exit 1
}

Write-Host "Verifying Orchestrator.ps1 syntax..."
$orchestratorPath = ".\src\core\Orchestrator.ps1"
$errors = $null
[System.Management.Automation.PSParser]::Tokenize((Get-Content $orchestratorPath -Raw), [ref]$errors) | Out-Null
if ($errors) {
    foreach ($err in $errors) {
        Write-Error "Syntax error in Orchestrator.ps1 at line $($err.StartLine): $($err.Message)"
    }
    exit 1
}
Write-Host "Orchestrator.ps1 syntax is valid." -ForegroundColor Green

Write-Host "Verifying master-orchestrator-minimal.ps1 syntax..."
$masterPath = ".\master-orchestrator-minimal.ps1"
$errors = $null
[System.Management.Automation.PSParser]::Tokenize((Get-Content $masterPath -Raw), [ref]$errors) | Out-Null
if ($errors) {
    foreach ($err in $errors) {
        Write-Error "Syntax error in master-orchestrator-minimal.ps1 at line $($err.StartLine): $($err.Message)"
    }
    exit 1
}
Write-Host "master-orchestrator-minimal.ps1 syntax is valid." -ForegroundColor Green

Write-Host "Verification complete." -ForegroundColor Green
