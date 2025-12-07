# HtmlPublisher.psm1
# Module for publishing content as HTML

function Publish-ContentAsHtml {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Title,

        [Parameter(Mandatory = $true)]
        [string]$Content,

        [string]$OutputDir = "..\..\data\published",
        [string[]]$Keywords = @(),
        [string]$TemplateName = "default",
        [object]$Config = @{}
    )

    # Import AdManager if available (suppress warnings)
    $AdManagerPath = Join-Path $PSScriptRoot "..\revenue\AdManager.psm1"
    if (Test-Path $AdManagerPath) {
        Import-Module $AdManagerPath -Force -WarningAction SilentlyContinue | Out-Null
    }

    # Generate filename
    $DateStr = Get-Date -Format "yyyy-MM-dd"
    $SanitizedTitle = $Title -replace "[^a-zA-Z0-9]", "-"
    $HtmlFileName = "$SanitizedTitle.html"

    # Ensure output directory exists
    $TargetDir = Join-Path (Join-Path $PSScriptRoot $OutputDir) $DateStr
    if (-not (Test-Path $TargetDir)) {
        New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
    }

    # Load template
    $TemplatePath = Join-Path $PSScriptRoot "..\..\config\templates\$TemplateName.html"
    if (Test-Path $TemplatePath) {
        $HtmlTemplate = Get-Content $TemplatePath -Raw
    }
    else {
        $HtmlTemplate = Get-DefaultHtmlTemplate
    }

    # Generate meta description (first 155 chars of content)
    $MetaDescription = ($Content -replace '<[^>]+>', '' -replace '\s+', ' ').Trim()
    if ($MetaDescription.Length -gt 155) {
        $MetaDescription = $MetaDescription.Substring(0, 155) + "..."
    }

    # Add affiliate links (if AdManager loaded)
    $ProcessedContent = $Content
    if (Get-Command "Add-AffiliateLinks" -ErrorAction SilentlyContinue) {
        $ProcessedContent = Add-AffiliateLinks -Content $Content -Config $Config
    }

    # Get ad codes (if AdManager loaded)
    $AdHeader = ""; $AdSidebar = ""; $AdContent = ""
    if (Get-Command "Get-AdCode" -ErrorAction SilentlyContinue) {
        $AdHeader = Get-AdCode -Position "Header" -Config $Config
        $AdSidebar = Get-AdCode -Position "Sidebar" -Config $Config
        $AdContent = Get-AdCode -Position "Content" -Config $Config
    }

    # Build the HTML
    $Html = $HtmlTemplate `
        -replace '{{TITLE}}', $Title `
        -replace '{{CONTENT}}', $ProcessedContent `
        -replace '{{DATE}}', (Get-Date -Format "MMMM dd, yyyy") `
        -replace '{{YEAR}}', (Get-Date -Format "yyyy") `
        -replace '{{KEYWORDS}}', ($Keywords -join ', ') `
        -replace '{{META_DESCRIPTION}}', $MetaDescription `
        -replace '{{AD_HEADER}}', $AdHeader `
        -replace '{{AD_SIDEBAR}}', $AdSidebar `
        -replace '{{AD_CONTENT}}', $AdContent

    # Save HTML file
    $HtmlPath = Join-Path $TargetDir $HtmlFileName
    Set-Content -Path $HtmlPath -Value $Html -Encoding UTF8

    # Return result object
    return @{
        HtmlPath     = $HtmlPath
        MarkdownPath = $null
        Title        = $Title
        PublishedAt  = Get-Date
    }
}

function Publish-LocalBlog {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Title,

        [Parameter(Mandatory = $true)]
        [string]$Content,

        [string]$OutputDir = "..\..\data\published",
        [string[]]$Keywords = @(),
        [object]$Config = @{}
    )
    
    return Publish-ContentAsHtml `
        -Title $Title `
        -Content $Content `
        -OutputDir $OutputDir `
        -Keywords $Keywords `
        -Config $Config
}

function Get-DefaultHtmlTemplate {
    return @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{TITLE}}</title>
    <!-- AdSense Header Code -->
    {{AD_HEADER}}
</head>
<body>
    <h1>{{TITLE}}</h1>
    <!-- AdSense Content Top -->
    {{AD_CONTENT}}
    {{CONTENT}}
    <!-- AdSense Sidebar (Placeholder, might not render well without proper layout) -->
    {{AD_SIDEBAR}}
</body>
</html>
"@
}

Export-ModuleMember -Function Publish-ContentAsHtml, Publish-LocalBlog