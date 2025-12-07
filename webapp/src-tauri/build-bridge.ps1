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
$dirs = @("services", "config", "prisma", "templates")
foreach ($dir in $dirs) {
    if (Test-Path "$source\$dir") {
        Copy-Item -Recurse "$source\$dir" "$dest\$dir"
    }
}

Write-Host "Bridge bundle created at $dest"
