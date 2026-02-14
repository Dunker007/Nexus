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
    Write-Host "2. Creating Tunnel '$TunnelName'..." -ForegroundColor Yellow
    # Create tunnel and capture UUID
    $CreateOutput = ./cloudflared.exe tunnel create $TunnelName 2>&1
    
    # Extract UUID (regex for UUID pattern)
    if ($CreateOutput -match "([a-f0-9-]{36})") {
        $UUID = $matches[1]
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
        ./cloudflared.exe tunnel route dns $TunnelName bridge.dlxstudios.online
        
        Write-Host "4. Starting Tunnel..." -ForegroundColor Green
        ./cloudflared.exe tunnel run $TunnelName
    }
    else {
        Write-Error "Failed to extract UUID. Output: $CreateOutput"
    }
}

Install-Cloudflared
Initialize-Tunnel
