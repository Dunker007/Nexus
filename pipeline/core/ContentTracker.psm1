# ContentTracker.psm1
# Module for tracking published content using JSON database

$ContentDbPath = "$PSScriptRoot\..\..\data\content-tracker.json"
$CalendarDbPath = "$PSScriptRoot\..\..\data\content-calendar.json"

function Initialize-ContentTracker {
    if (-not (Test-Path $ContentDbPath)) {
        @() | ConvertTo-Json | Set-Content -Path $ContentDbPath
    }
    if (-not (Test-Path $CalendarDbPath)) {
        @() | ConvertTo-Json | Set-Content -Path $CalendarDbPath
    }
}

function Get-ContentHash {
    param([string]$Content)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    $hash = $sha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($Content))
    return [BitConverter]::ToString($hash) -replace '-', ''
}

function Add-ContentEntry {
    param(
        [Parameter(Mandatory = $true)][string]$Title,
        [Parameter(Mandatory = $true)][string]$Slug,
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$Platform,
        [Parameter(Mandatory = $true)][string]$Url,
        [hashtable]$Metadata = @{}
    )

    Initialize-ContentTracker
    $db = Get-Content -Raw $ContentDbPath | ConvertFrom-Json

    # Add revenue tracking fields to metadata if not present
    if (-not $Metadata.ContainsKey('PageViews')) {
        $Metadata.PageViews = 0
    }
    if (-not $Metadata.ContainsKey('Revenue')) {
        $Metadata.Revenue = 0.0
    }
    # Add prompt variant tracking
    if (-not $Metadata.ContainsKey('PromptVariant')) {
        $Metadata.PromptVariant = "N/A"
    }

    $entry = @{
        Title       = $Title
        Slug        = $Slug
        ContentHash = Get-ContentHash -Content $Content
        Platform    = $Platform
        Url         = $Url
        Metadata    = $Metadata
        CreatedAt   = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    }

    $db += $entry

    $db | ConvertTo-Json -Depth 5 | Set-Content -Path $ContentDbPath
}

function Get-ContentEntries {
    param(
        [string]$Platform,
        [string]$Slug
    )

    Initialize-ContentTracker
    $db = Get-Content -Raw $ContentDbPath | ConvertFrom-Json

    if ($Platform) {
        $db = $db | Where-Object { $_.Platform -eq $Platform }
    }
    if ($Slug) {
        $db = $db | Where-Object { $_.Slug -eq $Slug }
    }

    return $db
}

function Get-ContentEntryByHash {
    param([string]$Hash)
    Initialize-ContentTracker
    $db = Get-Content -Raw $ContentDbPath | ConvertFrom-Json
    return $db | Where-Object { $_.ContentHash -eq $Hash }
}

function Add-CalendarEntry {
    param(
        [Parameter(Mandatory = $true)][string]$Topic,
        [Parameter(Mandatory = $true)][datetime]$ScheduleDate,
        [string]$Status = "Scheduled", # Scheduled, InProgress, Completed, Skipped
        [hashtable]$Metadata = @{}
    )

    Initialize-ContentTracker
    $db = Get-Content -Raw $CalendarDbPath | ConvertFrom-Json
    
    $entry = @{
        Topic        = $Topic
        ScheduleDate = $ScheduleDate.ToString("yyyy-MM-dd")
        Status       = $Status
        Metadata     = $Metadata
        CreatedAt    = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    }

    $db += $entry
    $db | ConvertTo-Json -Depth 5 | Set-Content -Path $CalendarDbPath
}

function Get-NextScheduledTopic {
    Initialize-ContentTracker
    $db = Get-Content -Raw $CalendarDbPath | ConvertFrom-Json
    
    # Find the next scheduled topic that is 'Scheduled' and whose date is today or earlier
    $Today = (Get-Date).ToString("yyyy-MM-dd")
    
    $nextTopic = $db | Where-Object {
        $_.Status -eq "Scheduled" -and $_.ScheduleDate -le $Today
    } | Sort-Object ScheduleDate | Select-Object -First 1
    
    return $nextTopic
}

function Update-CalendarEntryStatus {
    param(
        [Parameter(Mandatory = $true)][string]$Topic,
        [Parameter(Mandatory = $true)][string]$ScheduleDate,
        [Parameter(Mandatory = $true)][string]$NewStatus
    )

    Initialize-ContentTracker
    $db = Get-Content -Raw $CalendarDbPath | ConvertFrom-Json
    
    $index = -1
    for ($i = 0; $i -lt $db.Count; $i++) {
        if ($db[$i].Topic -eq $Topic -and $db[$i].ScheduleDate -eq $ScheduleDate) {
            $index = $i
            break
        }
    }

    if ($index -ne -1) {
        $db[$index].Status = $NewStatus
        $db | ConvertTo-Json -Depth 5 | Set-Content -Path $CalendarDbPath
        return $true
    }
    return $false
}

Export-ModuleMember -Function Add-ContentEntry, Get-ContentEntries, Get-ContentEntryByHash, Add-CalendarEntry, Get-NextScheduledTopic, Update-CalendarEntryStatus