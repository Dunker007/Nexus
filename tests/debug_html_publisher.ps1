$ErrorActionPreference = "Stop"

Write-Host "Importing HtmlPublisher..."
Import-Module ".\src\publishers\HtmlPublisher.psm1" -Force

Write-Host "Calling Publish-ContentAsHtml..."
try {
    $res = Publish-ContentAsHtml `
        -Title "Test Title" `
        -Content "Test Content" `
        -OutputDir ".\data\published" `
        -Keywords @("test") `
        -Config @{}
    
    Write-Host "Result Type: $($res.GetType().FullName)"
    Write-Host "Result: $($res | ConvertTo-Json)"
}
catch {
    Write-Error "Call failed: $_"
    $_.InvocationInfo | Out-Host
}
