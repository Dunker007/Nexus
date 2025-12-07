# WordPressPublisher.ps1
# Module for publishing content to WordPress via REST API

$script:WordPressConfig = @{
    SiteUrl       = ""
    Username      = ""
    AppPassword   = ""
    DefaultStatus = "draft"  # "draft" or "publish"
}

function Initialize-WordPressPublisher {
    param(
        [Parameter(Mandatory = $true)]
        [string]$SiteUrl,
        
        [Parameter(Mandatory = $true)]
        [string]$Username,
        
        [Parameter(Mandatory = $true)]
        [string]$AppPassword,
        
        [string]$DefaultStatus = "draft"
    )
    
    $script:WordPressConfig.SiteUrl = $SiteUrl.TrimEnd('/')
    $script:WordPressConfig.Username = $Username
    $script:WordPressConfig.AppPassword = $AppPassword
    $script:WordPressConfig.DefaultStatus = $DefaultStatus
    
    # Test connection
    $testResult = Test-WordPressConnection
    if (-not $testResult) {
        throw "Failed to connect to WordPress site. Please verify credentials."
    }
    
    Write-Verbose "WordPress publisher initialized successfully"
    return $true
}

function Test-WordPressConnection {
    try {
        if ([string]::IsNullOrEmpty($script:WordPressConfig.SiteUrl)) {
            return $false
        }
        
        $endpoint = "$($script:WordPressConfig.SiteUrl)/wp-json/wp/v2/users/me"
        $auth = [Convert]::ToBase64String(
            [Text.Encoding]::ASCII.GetBytes(
                "$($script:WordPressConfig.Username):$($script:WordPressConfig.AppPassword)"
            )
        )
        
        $headers = @{
            "Authorization" = "Basic $auth"
        }
        
        $response = Invoke-RestMethod -Uri $endpoint -Headers $headers -Method Get -TimeoutSec 10
        return $true
    }
    catch {
        Write-Warning "WordPress connection test failed: $_"
        return $false
    }
}

function Publish-WordPressPost {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Title,
        
        [Parameter(Mandatory = $true)]
        [string]$Content,
        
        [string]$Status = $null,
        [string[]]$Categories = @(),
        [string[]]$Tags = @(),
        [string]$FeaturedImageUrl = $null,
        [object]$Config = @{} # Added for revenue integration
    )
    
    if ([string]::IsNullOrEmpty($script:WordPressConfig.SiteUrl)) {
        throw "WordPress not initialized. Call Initialize-WordPressPublisher first."
    }
    
    $status = if ($Status) { $Status } else { $script:WordPressConfig.DefaultStatus }

    # Import AdManager if available (suppress warnings)
    $AdManagerPath = Join-Path $PSScriptRoot "..\revenue\AdManager.psm1"
    if (Test-Path $AdManagerPath) {
        Import-Module $AdManagerPath -Force -WarningAction SilentlyContinue | Out-Null
    }

    $ProcessedContent = $Content
    
    # Add affiliate links (if AdManager loaded)
    if (Get-Command "Add-AffiliateLinks" -ErrorAction SilentlyContinue) {
        $ProcessedContent = Add-AffiliateLinks -Content $ProcessedContent -Config $Config
    }

    # Inject AdSense In-Content Ad (if AdManager loaded)
    if (Get-Command "Get-AdCode" -ErrorAction SilentlyContinue) {
        $AdContent = Get-AdCode -Position "Content" -Config $Config
        # Insert ad after the first paragraph
        if ($ProcessedContent -match '<\/p>') {
            $ProcessedContent = $ProcessedContent -replace '<\/p>', "$&`n$AdContent", 1
        }
        else {
            # If no paragraphs, prepend the ad
            $ProcessedContent = "$AdContent`n$ProcessedContent"
        }
    }
    
    # Create excerpt (first 160 chars)
    $excerpt = ($ProcessedContent -replace '<[^>]+>', '' -replace '\s+', ' ').Trim()
    if ($excerpt.Length -gt 160) {
        $excerpt = $excerpt.Substring(0, 160) + "..."
    }
    
    # Prepare post data
    $postData = @{
        title   = $Title
        content = $ProcessedContent
        status  = $status
        excerpt = $excerpt
    }
    
    # Add categories if provided
    if ($Categories.Count -gt 0) {
        $categoryIds = @()
        foreach ($cat in $Categories) {
            $catId = Get-OrCreateWordPressCategory -Name $cat
            if ($catId) {
                $categoryIds += $catId
            }
        }
        if ($categoryIds.Count -gt 0) {
            $postData.categories = $categoryIds
        }
    }
    
    # Add tags if provided
    if ($Tags.Count -gt 0) {
        $tagIds = @()
        foreach ($tag in $Tags) {
            $tagId = Get-OrCreateWordPressTag -Name $tag
            if ($tagId) {
                $tagIds += $tagId
            }
        }
        if ($tagIds.Count -gt 0) {
            $postData.tags = $tagIds
        }
    }
    
    # Convert to JSON
    $body = $postData | ConvertTo-Json -Depth 10
    
    # Prepare auth
    $auth = [Convert]::ToBase64String(
        [Text.Encoding]::ASCII.GetBytes(
            "$($script:WordPressConfig.Username):$($script:WordPressConfig.AppPassword)"
        )
    )
    
    $headers = @{
        "Authorization" = "Basic $auth"
        "Content-Type"  = "application/json"
    }
    
    try {
        $endpoint = "$($script:WordPressConfig.SiteUrl)/wp-json/wp/v2/posts"
        $response = Invoke-RestMethod -Uri $endpoint -Method Post -Headers $headers -Body $body -TimeoutSec 30
        
        return @{
            Success     = $true
            PostId      = $response.id
            Url         = $response.link
            Status      = $response.status
            PublishedAt = Get-Date
        }
    }
    catch {
        return @{
            Success = $false
            Error   = $_.Exception.Message
        }
    }
}

function Get-OrCreateWordPressCategory {
    param([string]$Name)
    
    try {
        $auth = [Convert]::ToBase64String(
            [Text.Encoding]::ASCII.GetBytes(
                "$($script:WordPressConfig.Username):$($script:WordPressConfig.AppPassword)"
            )
        )
        
        $headers = @{
            "Authorization" = "Basic $auth"
        }
        
        # Search for existing category
        $endpoint = "$($script:WordPressConfig.SiteUrl)/wp-json/wp/v2/categories?search=$([uri]::EscapeDataString($Name))"
        $existing = Invoke-RestMethod -Uri $endpoint -Headers $headers -Method Get -TimeoutSec 10
        
        if ($existing -and $existing.Count -gt 0) {
            return $existing[0].id
        }
        
        # Create new category
        $createEndpoint = "$($script:WordPressConfig.SiteUrl)/wp-json/wp/v2/categories"
        $body = @{ name = $Name } | ConvertTo-Json
        $headers["Content-Type"] = "application/json"
        
        $newCat = Invoke-RestMethod -Uri $createEndpoint -Method Post -Headers $headers -Body $body -TimeoutSec 10
        return $newCat.id
    }
    catch {
        Write-Warning "Failed to get/create category '$Name': $_"
        return $null
    }
}

function Get-OrCreateWordPressTag {
    param([string]$Name)
    
    try {
        $auth = [Convert]::ToBase64String(
            [Text.Encoding]::ASCII.GetBytes(
                "$($script:WordPressConfig.Username):$($script:WordPressConfig.AppPassword)"
            )
        )
        
        $headers = @{
            "Authorization" = "Basic $auth"
        }
        
        # Search for existing tag
        $endpoint = "$($script:WordPressConfig.SiteUrl)/wp-json/wp/v2/tags?search=$([uri]::EscapeDataString($Name))"
        $existing = Invoke-RestMethod -Uri $endpoint -Headers $headers -Method Get -TimeoutSec 10
        
        if ($existing -and $existing.Count -gt 0) {
            return $existing[0].id
        }
        
        # Create new tag
        $createEndpoint = "$($script:WordPressConfig.SiteUrl)/wp-json/wp/v2/tags"
        $body = @{ name = $Name } | ConvertTo-Json
        $headers["Content-Type"] = "application/json"
        
        $newTag = Invoke-RestMethod -Uri $createEndpoint -Method Post -Headers $headers -Body $body -TimeoutSec 10
        return $newTag.id
    }
    catch {
        Write-Warning "Failed to get/create tag '$Name': $_"
        return $null
    }
}

Export-ModuleMember -Function Initialize-WordPressPublisher, Test-WordPressConnection, Publish-WordPressPost
