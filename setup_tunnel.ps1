$ErrorActionPreference = "Stop"

function Install-Cloudflared {
    if (-not (Test-Path "cloudflared.exe")) {
        Write-Host "Downloading cloudflared..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"
    }
}

function Initialize-Tunnel {
    $CertPath = "$env:USERPROFILE\.cloudflared\cert.pem"
    if (-not (Test-Path $CertPath)) {
        Write-Host "1. Login to Cloudflare" -ForegroundColor Yellow
        Write-Host "A browser window will open. Select your domain (dlxstudios.online)."
        ./cloudflared.exe tunnel login
    }
    else {
        Write-Host "1. Already logged in." -ForegroundColor Green
    }
    
    $TunnelName = "nexus-bridge"
    Write-Host "2. Creating/Finding Tunnel '$TunnelName'..." -ForegroundColor Yellow
    
    # Try creating (may fail if exists)
    try {
        ./cloudflared.exe tunnel create $TunnelName 2>&1 | Out-Null
    }
    catch {
        Write-Host "Tunnel likely exists. Checking list..." -ForegroundColor Gray
    }
    
    # Get UUID from list (Reliable)
    $ListOutput = ./cloudflared.exe tunnel list 2>&1
    $UUID = $null
    
    foreach ($line in $ListOutput) {
        # Match 'UUID NAME' format
        if ($line -match "([a-f0-9-]{36})\s+$TunnelName") {
            $UUID = $matches[1]
            break
        }
    }
    
    if ($UUID) {
        Write-Host "Tunnel UUID: $UUID" -ForegroundColor Green
        
        # Create Config
        $Config = @"
tunnel: $UUID
credentials-file: $env:USERPROFILE\.cloudflared\$UUID.json

ingress:
  - hostname: bridge.dlxstudios.online
    service: http://localhost:3456
  - service: http_status:404
"@
        Set-Content "config.yml" $Config
        Write-Host "Config file created."
        
        Write-Host "3. Routing DNS..." -ForegroundColor Yellow
        ./cloudflared.exe tunnel route dns $TunnelName bridge.dlxstudios.online 2>&1 | Out-Null
        
        Write-Host "4. Starting Tunnel..." -ForegroundColor Green
        ./cloudflared.exe tunnel run $TunnelName
    }
    else {
        Write-Error "Could not find tunnel '$TunnelName'. Please run: ./cloudflared.exe tunnel list"
    }
}

Install-Cloudflared
Initialize-Tunnel
