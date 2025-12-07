# ConfigManager.psm1
# Configuration management module with JSON/YAML support and environment variable overrides

function Get-Config {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ConfigPath,

        [hashtable]$Overrides = @{}
    )

    # Determine file type
    $extension = [System.IO.Path]::GetExtension($ConfigPath).ToLower()
    $configData = $null

    if ($extension -eq '.json') {
        if (-not (Test-Path $ConfigPath)) {
            throw "Configuration file not found: $ConfigPath"
        }
        $configJson = Get-Content -Raw $ConfigPath
        $configData = ConvertFrom-Json $configJson
    }
    elseif ($extension -eq '.yaml' -or $extension -eq '.yml') {
        if (-not (Test-Path $ConfigPath)) {
            throw "Configuration file not found: $ConfigPath"
        }
        # For YAML, assume PowerShell YAML module is available or use ConvertFrom-Yaml
        # If not available, fall back to JSON or throw error
        try {
            $configYaml = Get-Content -Raw $ConfigPath
            $configData = ConvertFrom-Yaml $configYaml
        }
        catch {
            throw "YAML support requires PSYaml module or similar. Install with: Install-Module -Name PSYaml. Error: $_"
        }
    }
    else {
        throw "Unsupported configuration file format: $extension. Supported: .json, .yaml, .yml"
    }

    # Apply environment variable overrides
    $configData = Set-EnvironmentOverrides -Config $configData

    # Apply manual overrides
    foreach ($key in $Overrides.Keys) {
        $configData = Set-NestedProperty -Object $configData -PropertyPath $key -Value $Overrides[$key]
    }

    return $configData
}

function Set-EnvironmentOverrides {
    param(
        [Parameter(Mandatory = $true)]
        $Config
    )

    # Environment variables prefixed with CONFIG_ can override config values
    # e.g., CONFIG_LMStudio_ApiUrl overrides Config.LMStudio.ApiUrl
    $envVars = Get-ChildItem Env: | Where-Object { $_.Name -like "CONFIG_*" }

    foreach ($envVar in $envVars) {
        $pathParts = $envVar.Name -replace '^CONFIG_', '' -split '_'
        $value = $envVar.Value

        # Convert value to appropriate type (string, int, bool)
        if ($value -match '^\d+$') {
            $value = [int]$value
        }
        elseif ($value -eq 'true' -or $value -eq 'false') {
            $value = [bool]::Parse($value)
        }

        $Config = Set-NestedProperty -Object $Config -PropertyPath ($pathParts -join '.') -Value $value
    }

    return $Config
}

function Set-NestedProperty {
    param(
        [Parameter(Mandatory = $true)]
        $Object,

        [Parameter(Mandatory = $true)]
        [string]$PropertyPath,

        [Parameter(Mandatory = $true)]
        $Value
    )

    $pathParts = $PropertyPath -split '\.'
    $current = $Object

    for ($i = 0; $i -lt $pathParts.Length - 1; $i++) {
        $part = $pathParts[$i]
        if (-not $current.PSObject.Properties.Match($part)) {
            $current | Add-Member -MemberType NoteProperty -Name $part -Value ([PSCustomObject]@{})
        }
        $current = $current.$part
    }

    $lastPart = $pathParts[-1]
    if ($current.PSObject.Properties.Match($lastPart)) {
        $current.$lastPart = $Value
    }
    else {
        $current | Add-Member -MemberType NoteProperty -Name $lastPart -Value $Value
    }

    return $Object
}

Export-ModuleMember -Function Get-Config