# Pre-build script to copy Bridge files (excludes node_modules)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$source = Join-Path $scriptDir "..\..\bridge"
$dest = Join-Path $scriptDir "bridge-bundle"

Write-Host "Source: $source"
Write-Host "Dest: $dest"

# Clean previous bundle
if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
New-Item -ItemType Directory -Path $dest | Out-Null

# Copy essential files
Copy-Item "$source\server.js" $dest
Copy-Item "$source\package.json" $dest
Copy-Item "$source\package-lock.json" $dest
if (Test-Path "$source\.env") { Copy-Item "$source\.env" $dest }

# Copy directories (excluding node_modules, coverage, __tests__)
$dirs = @("services", "config", "prisma", "templates", "routes")
foreach ($dir in $dirs) {
    if (Test-Path "$source\$dir") {
        Copy-Item -Recurse "$source\$dir" "$dest\$dir"
    }
}

# Create Data directory placeholder (so relative paths don't crash immediately)
$dataDest = Join-Path $dest "data"
New-Item -ItemType Directory -Path $dataDest -Force | Out-Null
New-Item -ItemType Directory -Path "$dataDest\logs" -Force | Out-Null
New-Item -ItemType Directory -Path "$dataDest\published" -Force | Out-Null

# Install Production Dependencies (Pre-bundle) - SKIPPED to avoid build errors/path length issues
# Write-Host "Installing production dependencies in bundle..."
# Push-Location $dest
# try {
#     npm install --production --no-bin-links
# }
# finally {
#     Pop-Location
# }


# ==========================================
# Cloudflared Bundling (Sidecar & Resources)
# ==========================================

# 1. Sidecar Binary (MUST be in src-tauri/bin/ and named with target triple)
$binDir = Join-Path $scriptDir "bin"
if (-not (Test-Path $binDir)) { New-Item -ItemType Directory -Path $binDir | Out-Null }

# Target triple for Windows x64
$sidecarName = "cloudflared-x86_64-pc-windows-msvc.exe"
$sidecarPath = Join-Path $binDir $sidecarName

# Copy cloudflared.exe from project root to sidecar path
$cloudflaredSource = Join-Path $scriptDir "..\..\cloudflared.exe"
if (Test-Path $cloudflaredSource) {
    Copy-Item $cloudflaredSource $sidecarPath -Force
    Write-Host "Bundled Cloudflared sidecar: $sidecarPath"
}
else {
    Write-Error "Cloudflared.exe not found at $cloudflaredSource"
}

# 2. Tunnel Config & Credentials (Resources)
$tunnelResDir = Join-Path $scriptDir "tunnel-config"
if (Test-Path $tunnelResDir) { Remove-Item -Recurse -Force $tunnelResDir }
New-Item -ItemType Directory -Path $tunnelResDir | Out-Null

# Copy config.yml
$configSource = Join-Path $scriptDir "..\..\config.yml"
if (Test-Path $configSource) {
    Copy-Item $configSource $tunnelResDir
}

# Copy the credential JSON file referenced in config.yml
# We need to find the UUID from config.yml or just copy the known one if possible.
# For now, let's copy ALL .json files from .cloudflared (or just the specific one if we knew it).
# A better approach: Read config.yml to find the credential file path.

$content = Get-Content $configSource
$credLine = $content | Where-Object { $_ -match "credentials-file:\s*(.*)" }
if ($credLine) {
    $credPath = $credLine -replace "credentials-file:\s*", ""
    $credPath = $credPath.Trim()
    
    if (Test-Path $credPath) {
        $credFileName = Split-Path $credPath -Leaf
        Copy-Item $credPath (Join-Path $tunnelResDir $credFileName)
        Write-Host "Bundled credential file: $credFileName"
        
        # We must also create a modified config.yml that points to the RELATIVE, Bundled credential file
        # The app will run cloudflared with `--config <bundled_config.yml>`
        # But `cloudflared` expects absolute paths in config usually.
        # Actually, if we pass `--config` it reads relative to CWD? No.
        # We will handle the path rewrite in Rust or just use a template.
        
        # Let's rewrite config.yml in the bundle to use a relative path (./uuid.json)
        # And when we launch cloudflared, we set CWD to the resource directory?
        # Cloudflared might not support relative paths nicely in config file for credentials.
        # Safer: Tauri Main.rs will rewrite this config file at runtime to point to the absolute path of the resource.
        # So we just copy the ID.json file for now.
    }
    else {
        Write-Warning "Credential file not found at $credPath"
    }
}


# Fix permissions to avoid Access Denied during Cargo build
Write-Host "Resetting permissions on bundles..."
cmd /c icacls "$dest" /reset /T
cmd /c icacls "$tunnelResDir" /reset /T


# ==========================================
# Create ZIP Archives (to bypass Cargo/Tauri watcher issues)
# ==========================================

$bridgeZip = Join-Path $scriptDir "bridge.zip"
$tunnelZip = Join-Path $scriptDir "tunnel-config.zip"

Write-Host "Creating archive: $bridgeZip"
if (Test-Path $bridgeZip) { Remove-Item $bridgeZip -Force }
Compress-Archive -Path "$dest\*" -DestinationPath $bridgeZip -Force

Write-Host "Creating archive: $tunnelZip"
if (Test-Path $tunnelZip) { Remove-Item $tunnelZip -Force }
Compress-Archive -Path "$tunnelResDir\*" -DestinationPath $tunnelZip -Force

# Clean up staging directories so Cargo doesn't watch them
Write-Host "Cleaning up staging directories..."
Remove-Item -Recurse -Force $dest
Remove-Item -Recurse -Force $tunnelResDir

Write-Host "Bundling complete. Ready for build."



