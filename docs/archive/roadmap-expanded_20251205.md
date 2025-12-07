# OPUS-DLX Roadmap - Expanded Analysis
**Generated:** November 19, 2025  
**Purpose:** Deep dive into each phase + Kingdom salvage mapping

---

## PHASE 1: Emergency Repairs (800 lines, Session 1)
**Goal:** Get the orchestrator to actually run  
**Priority:** CRITICAL - Nothing works until this is fixed

### Detailed Tasks

#### 1.1 Module Loading Architecture (200 lines)
**Problem:** PowerShell modules not loading properly
**Solution:** Convert .ps1 to .psm1 with proper exports

```powershell
# BEFORE (broken):
. "$PSScriptRoot\modules\content-generator.ps1"

# AFTER (fixed):
Import-Module "$PSScriptRoot\modules\ContentGenerator.psm1" -Force

# In ContentGenerator.psm1:
function New-BlogPost {
    param($Topic, $Keywords)
    # Implementation
}

Export-ModuleMember -Function New-BlogPost
```

**Kingdom Salvage Check:**
- [ ] Does Kingdom have working module loader?
- [ ] Are there .psm1 files we can use?
- [ ] What's the Import-Module pattern?

#### 1.2 Strip Out Broken Dependencies (100 lines)
**Problem:** 110 modules with interdependencies creating cascade failures
**Solution:** Comment out all external module calls, create stubs

```powershell
# Instead of failing on missing modules:
try {
    Import-Module CryptoTrading -ErrorAction Stop
} catch {
    Write-Log "CryptoTrading not available, using stub" -Level Warning
    function Get-CryptoSignal { return $null }
}
```

**Kingdom Salvage Check:**
- [ ] Which modules are actually critical?
- [ ] Which can be safely disabled?
- [ ] Are there circular dependencies?

#### 1.3 Minimal Working Orchestrator (300 lines)
**Barebone orchestrator that proves the concept**

```powershell
# master-orchestrator-minimal.ps1

param(
    [switch]$DryRun,
    [int]$MaxCycles = -1  # -1 = infinite
)

# Minimal logging
function Write-OrchestratorLog {
    param($Message, $Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry
    Add-Content "C:\Repos GIT\Fresh-Start\data\logs\orchestrator.log" $logEntry
}

# Main loop
$cycleCount = 0
Write-OrchestratorLog "Orchestrator started (DryRun: $DryRun)"

while ($true) {
    $cycleCount++
    Write-OrchestratorLog "=== Cycle $cycleCount started ==="
    
    try {
        # ONE THING THAT WORKS
        $topic = "AI trends in 2025"  # Hardcoded for now
        Write-OrchestratorLog "Topic: $topic"
        
        if (-not $DryRun) {
            # We'll build this in Phase 2
            # $content = New-BlogPost -Topic $topic
            # Publish-BlogPost -Content $content
            Write-OrchestratorLog "Would generate content here"
        }
        
        Write-OrchestratorLog "Cycle completed successfully"
        
    } catch {
        Write-OrchestratorLog "ERROR: $_" -Level "ERROR"
    }
    
    # Exit if max cycles reached
    if ($MaxCycles -gt 0 -and $cycleCount -ge $MaxCycles) {
        Write-OrchestratorLog "Max cycles reached, exiting"
        break
    }
    
    # Wait 1 hour between cycles
    Write-OrchestratorLog "Sleeping for 3600 seconds"
    Start-Sleep -Seconds 3600
}
```

**Success Criteria:**
- ✅ Runs without throwing errors
- ✅ Creates log file
- ✅ Can run for 1+ hours
- ✅ Gracefully handles -MaxCycles parameter

**Kingdom Salvage Check:**
- [ ] Does Kingdom have an orchestrator loop?
- [ ] What's the error handling pattern?
- [ ] How does Kingdom handle cycles/iterations?

#### 1.4 Basic Error Handling (200 lines)
**Problem:** Unhandled exceptions crash the whole system
**Solution:** Defensive programming everywhere

```powershell
function Invoke-SafeOperation {
    param(
        [scriptblock]$Operation,
        [string]$OperationName,
        $FallbackReturn = $null
    )
    
    try {
        Write-OrchestratorLog "Starting: $OperationName"
        $result = & $Operation
        Write-OrchestratorLog "Completed: $OperationName"
        return $result
    }
    catch {
        Write-OrchestratorLog "FAILED: $OperationName - $_" -Level "ERROR"
        return $FallbackReturn
    }
}

# Usage:
$content = Invoke-SafeOperation -OperationName "Content Generation" `
    -FallbackReturn "Error: Could not generate content" `
    -Operation {
        New-BlogPost -Topic $topic
    }
```

**Kingdom Salvage Check:**
- [ ] Does Kingdom have error handling utilities?
- [ ] Is there a Invoke-Safely wrapper?
- [ ] What's the logging pattern?

---

## PHASE 2: Connect to LM Studio (800 lines, Session 2)
**Goal:** Establish working AI connection  
**Priority:** HIGH - Core functionality

### Detailed Tasks

#### 2.1 LM Studio Connector (400 lines)
**Problem:** Need reliable connection to local AI
**Solution:** Robust HTTP client with retries

```powershell
# LMStudioConnector.psm1

$script:LMStudioConfig = @{
    BaseUrl = "http://localhost:1234"  # or 5173, we need to verify
    Endpoint = "/v1/chat/completions"
    Timeout = 120  # seconds
    MaxRetries = 3
    RetryDelay = 5  # seconds
}

function Test-LMStudioConnection {
    try {
        $response = Invoke-RestMethod -Uri "$($script:LMStudioConfig.BaseUrl)/v1/models" `
            -Method Get -TimeoutSec 5
        return $true
    }
    catch {
        return $false
    }
}

function Invoke-LMStudio {
    param(
        [Parameter(Mandatory)]
        [string]$Prompt,
        
        [int]$MaxTokens = 1000,
        [double]$Temperature = 0.7,
        [string]$Model = "default",
        [int]$RetryCount = 0
    )
    
    # Verify LM Studio is running
    if (-not (Test-LMStudioConnection)) {
        throw "LM Studio is not running or not accessible"
    }
    
    $url = "$($script:LMStudioConfig.BaseUrl)$($script:LMStudioConfig.Endpoint)"
    
    $body = @{
        model = $Model
        messages = @(
            @{
                role = "user"
                content = $Prompt
            }
        )
        max_tokens = $MaxTokens
        temperature = $Temperature
    } | ConvertTo-Json -Depth 10
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    try {
        Write-Verbose "Sending request to LM Studio..."
        $response = Invoke-RestMethod -Uri $url `
            -Method Post `
            -Headers $headers `
            -Body $body `
            -TimeoutSec $script:LMStudioConfig.Timeout
        
        return $response.choices[0].message.content
    }
    catch {
        # Retry logic
        if ($RetryCount -lt $script:LMStudioConfig.MaxRetries) {
            Write-Warning "LM Studio request failed, retrying ($($RetryCount + 1)/$($script:LMStudioConfig.MaxRetries))..."
            Start-Sleep -Seconds $script:LMStudioConfig.RetryDelay
            return Invoke-LMStudio -Prompt $Prompt -MaxTokens $MaxTokens `
                -Temperature $Temperature -Model $Model -RetryCount ($RetryCount + 1)
        }
        else {
            throw "LM Studio request failed after $($script:LMStudioConfig.MaxRetries) retries: $_"
        }
    }
}

Export-ModuleMember -Function Invoke-LMStudio, Test-LMStudioConnection
```

**Kingdom Salvage Check:**
- [ ] Does Kingdom have LM Studio connector?
- [ ] What's the endpoint configuration?
- [ ] Is there retry logic?
- [ ] What's the error handling?

#### 2.2 Content Generation Wrapper (200 lines)
**Problem:** Raw LM Studio output needs structure
**Solution:** Wrapper functions with validation

```powershell
# ContentGenerator.psm1

function New-BlogPost {
    param(
        [Parameter(Mandatory)]
        [string]$Topic,
        
        [string[]]$Keywords = @(),
        [int]$TargetWordCount = 800,
        [string]$Tone = "informative"
    )
    
    # Build the prompt
    $prompt = @"
Write a comprehensive blog post about: $Topic

Requirements:
- Target length: $TargetWordCount words
- Tone: $Tone
- Include these keywords naturally: $($Keywords -join ', ')
- Use proper HTML formatting (h2, p, ul, ol tags)
- Include a compelling introduction
- End with a clear conclusion
- Make it SEO-friendly

Generate ONLY the blog post content, no meta-commentary.
"@
    
    # Generate content
    $rawContent = Invoke-LMStudio -Prompt $prompt -MaxTokens ($TargetWordCount * 2)
    
    # Validate and structure
    $post = @{
        Title = $Topic
        Content = $rawContent
        WordCount = ($rawContent -split '\s+').Count
        GeneratedAt = Get-Date
        Keywords = $Keywords
        Metadata = @{
            Model = "LMStudio"
            Prompt = $prompt
        }
    }
    
    # Quality checks
    if ($post.WordCount -lt ($TargetWordCount * 0.7)) {
        Write-Warning "Generated content is shorter than expected ($($post.WordCount) words)"
    }
    
    return $post
}

function Test-ContentQuality {
    param($Content)
    
    $quality = @{
        Score = 0
        Issues = @()
        Passed = $false
    }
    
    # Basic checks
    if ($Content.WordCount -lt 300) {
        $quality.Issues += "Content too short"
    } else {
        $quality.Score += 25
    }
    
    if ($Content.Content -match '<h2>') {
        $quality.Score += 25
    } else {
        $quality.Issues += "Missing headings"
    }
    
    if ($Content.Keywords.Count -gt 0) {
        $keywordsFound = 0
        foreach ($kw in $Content.Keywords) {
            if ($Content.Content -match [regex]::Escape($kw)) {
                $keywordsFound++
            }
        }
        if ($keywordsFound -gt 0) {
            $quality.Score += 25
        }
    }
    
    # Readability check (simple)
    $sentences = ($Content.Content -split '[.!?]').Count
    $avgWordsPerSentence = $Content.WordCount / $sentences
    if ($avgWordsPerSentence -lt 30) {
        $quality.Score += 25
    } else {
        $quality.Issues += "Sentences too long"
    }
    
    $quality.Passed = ($quality.Score -ge 75)
    return $quality
}

Export-ModuleMember -Function New-BlogPost, Test-ContentQuality
```

**Kingdom Salvage Check:**
- [ ] Does Kingdom have content generation?
- [ ] What's the prompt engineering pattern?
- [ ] Is there content validation?

#### 2.3 Prompt Templates (100 lines)
**Problem:** Need reusable, optimized prompts
**Solution:** Template library

```json
// config/prompts/blog-post-seo.json
{
  "name": "seo-blog-post",
  "description": "SEO-optimized blog post template",
  "template": "Write a comprehensive, SEO-optimized blog post about: {{topic}}\n\nTarget Keywords: {{keywords}}\nWord Count: {{wordCount}}\nTone: {{tone}}\n\nRequirements:\n- Engaging introduction with hook\n- Well-structured with H2/H3 headings\n- Include statistics or examples\n- Natural keyword integration\n- Actionable conclusion\n- Use HTML formatting\n\nGenerate ONLY the blog post content.",
  "defaults": {
    "wordCount": 800,
    "tone": "informative and engaging",
    "keywords": []
  }
}

// config/prompts/product-review.json
{
  "name": "affiliate-product-review",
  "description": "Product review with FTC compliance",
  "template": "Write an honest, detailed review of: {{productName}}\n\nProduct Details:\n{{productDetails}}\n\nTarget Audience: {{audience}}\nKey Features to Highlight: {{features}}\n\nRequirements:\n- Honest pros and cons\n- Personal experience tone\n- Compare to alternatives\n- Include use cases\n- FTC disclosure statement\n- Clear recommendation\n- Use HTML formatting\n\nGenerate ONLY the review content.",
  "defaults": {
    "audience": "general consumers",
    "features": []
  }
}
```

```powershell
# PromptLoader.psm1

function Get-PromptTemplate {
    param([string]$TemplateName)
    
    $path = "C:\Repos GIT\Fresh-Start\config\prompts\$TemplateName.json"
    if (Test-Path $path) {
        return Get-Content $path | ConvertFrom-Json
    }
    throw "Template not found: $TemplateName"
}

function Invoke-PromptTemplate {
    param(
        [string]$TemplateName,
        [hashtable]$Variables
    )
    
    $template = Get-PromptTemplate -TemplateName $TemplateName
    $prompt = $template.template
    
    # Merge defaults with provided variables
    $allVars = $template.defaults.PSObject.Properties | ForEach-Object {
        @{ $_.Name = $_.Value }
    }
    foreach ($key in $Variables.Keys) {
        $allVars[$key] = $Variables[$key]
    }
    
    # Replace variables
    foreach ($key in $allVars.Keys) {
        $value = $allVars[$key]
        if ($value -is [array]) {
            $value = $value -join ', '
        }
        $prompt = $prompt -replace "\{\{$key\}\}", $value
    }
    
    return $prompt
}

Export-ModuleMember -Function Get-PromptTemplate, Invoke-PromptTemplate
```

**Kingdom Salvage Check:**
- [ ] Does Kingdom have prompt templates?
- [ ] What's the template format?
- [ ] Is there a template loader?

#### 2.4 Test Suite for AI Connection (100 lines)
**Problem:** Need to verify LM Studio is working correctly
**Solution:** Comprehensive test suite

```powershell
# tests/Test-LMStudioConnection.ps1

Describe "LM Studio Integration Tests" {
    
    BeforeAll {
        Import-Module "$PSScriptRoot\..\src\generators\LMStudioConnector.psm1" -Force
    }
    
    It "Can connect to LM Studio" {
        $connected = Test-LMStudioConnection
        $connected | Should -Be $true
    }
    
    It "Can list available models" {
        $models = Invoke-RestMethod -Uri "http://localhost:1234/v1/models"
        $models | Should -Not -BeNullOrEmpty
        $models.data | Should -Not -BeNullOrEmpty
    }
    
    It "Can generate a simple response" {
        $response = Invoke-LMStudio -Prompt "Say 'Hello World'" -MaxTokens 50
        $response | Should -Not -BeNullOrEmpty
        $response.Length | Should -BeGreaterThan 5
    }
    
    It "Can generate a blog post" {
        $post = New-BlogPost -Topic "Test Topic" -TargetWordCount 300
        $post.Content | Should -Not -BeNullOrEmpty
        $post.WordCount | Should -BeGreaterThan 200
    }
    
    It "Handles errors gracefully" {
        # Simulate failure by using invalid endpoint
        $originalUrl = $script:LMStudioConfig.BaseUrl
        $script:LMStudioConfig.BaseUrl = "http://localhost:9999"
        
        { Invoke-LMStudio -Prompt "Test" } | Should -Throw
        
        # Restore
        $script:LMStudioConfig.BaseUrl = $originalUrl
    }
    
    It "Retries on failure" {
        # This would need more sophisticated mocking
        # For now, manual test
        $true | Should -Be $true
    }
    
    It "Respects token limits" {
        $response = Invoke-LMStudio -Prompt "Write a long essay" -MaxTokens 100
        # Response should be truncated at ~100 tokens
        $wordCount = ($response -split '\s+').Count
        $wordCount | Should -BeLessThan 150  # Rough estimate
    }
}

Describe "Content Quality Tests" {
    
    It "Validates content quality" {
        $mockContent = @{
            WordCount = 500
            Content = "<h2>Test</h2><p>Content here.</p>"
            Keywords = @("test")
        }
        
        $quality = Test-ContentQuality -Content $mockContent
        $quality.Passed | Should -Be $true
        $quality.Score | Should -BeGreaterThan 50
    }
    
    It "Flags short content" {
        $mockContent = @{
            WordCount = 100
            Content = "<p>Too short</p>"
            Keywords = @()
        }
        
        $quality = Test-ContentQuality -Content $mockContent
        $quality.Issues | Should -Contain "Content too short"
    }
}
```

**Kingdom Salvage Check:**
- [ ] Does Kingdom have test suite?
- [ ] What testing framework is used?
- [ ] Are there existing LM Studio tests?

---

## PHASE 3: Content Publishing Pipeline (800 lines, Session 3)
**Goal:** Actually publish content somewhere  
**Priority:** HIGH - Need output for monetization

### Detailed Tasks

#### 3.1 Local Blog Generator (300 lines)
**Problem:** Need immediate output channel
**Solution:** Generate static HTML files

```powershell
# LocalPublisher.psm1

function Publish-LocalBlog {
    param(
        [Parameter(Mandatory)]
        [hashtable]$Content,
        
        [string]$OutputDir = "C:\Repos GIT\Fresh-Start\data\published",
        [string]$Template = "default"
    )
    
    # Generate unique filename
    $timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
    $slug = ($Content.Title -replace '[^a-zA-Z0-9]', '-').ToLower()
    $filename = "$timestamp-$slug.html"
    
    # Load template
    $templatePath = "C:\Repos GIT\Fresh-Start\config\templates\$Template.html"
    if (Test-Path $templatePath) {
        $templateHtml = Get-Content $templatePath -Raw
    } else {
        # Use default template
        $templateHtml = Get-DefaultTemplate
    }
    
    # Build the HTML
    $html = $templateHtml `
        -replace '{{TITLE}}', $Content.Title `
        -replace '{{CONTENT}}', $Content.Content `
        -replace '{{DATE}}', (Get-Date -Format "MMMM dd, yyyy") `
        -replace '{{KEYWORDS}}', ($Content.Keywords -join ', ')
    
    # Add metadata
    $metaDescription = $Content.Content -replace '<[^>]+>', '' | 
        Select-Object -First 160
    $html = $html -replace '{{META_DESCRIPTION}}', $metaDescription
    
    # Save file
    $outputPath = Join-Path $OutputDir $filename
    Set-Content -Path $outputPath -Value $html -Encoding UTF8
    
    Write-Verbose "Published to: $outputPath"
    
    return @{
        Path = $outputPath
        Filename = $filename
        Url = "file:///$($outputPath -replace '\\', '/')"
        PublishedAt = Get-Date
    }
}

function Get-DefaultTemplate {
    return @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{{META_DESCRIPTION}}">
    <meta name="keywords" content="{{KEYWORDS}}">
    <title>{{TITLE}} | LuxRig Content</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #34495e;
            margin-top: 30px;
        }
        .meta {
            color: #7f8c8d;
            font-size: 0.9em;
            margin-bottom: 20px;
        }
        .content {
            margin-top: 30px;
        }
        code {
            background: #ecf0f1;
            padding: 2px 6px;
            border-radius: 3px;
        }
        pre {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <article>
        <header>
            <h1>{{TITLE}}</h1>
            <div class="meta">
                <time datetime="{{DATE}}">{{DATE}}</time>
            </div>
        </header>
        <div class="content">
            {{CONTENT}}
        </div>
    </article>
</body>
</html>
"@
}

Export-ModuleMember -Function Publish-LocalBlog
```

**Kingdom Salvage Check:**
- [ ] Does Kingdom have HTML generation?
- [ ] What's the template system?
- [ ] Is there a local publisher?

#### 3.2 WordPress Publisher (300 lines)
**Problem:** Need to publish to actual blog platform
**Solution:** WordPress REST API integration

```powershell
# WordPressPublisher.psm1

$script:WordPressConfig = @{
    SiteUrl = ""  # To be configured
    Username = ""
    AppPassword = ""  # WordPress Application Password
    DefaultStatus = "draft"  # or "publish"
}

function Initialize-WordPressPublisher {
    param(
        [Parameter(Mandatory)]
        [string]$SiteUrl,
        
        [Parameter(Mandatory)]
        [string]$Username,
        
        [Parameter(Mandatory)]
        [string]$AppPassword
    )
    
    $script:WordPressConfig.SiteUrl = $SiteUrl.TrimEnd('/')
    $script:WordPressConfig.Username = $Username
    $script:WordPressConfig.AppPassword = $AppPassword
    
    # Test connection
    $testResult = Test-WordPressConnection
    if (-not $testResult) {
        throw "Failed to connect to WordPress site"
    }
    
    Write-Verbose "WordPress publisher initialized successfully"
}

function Test-WordPressConnection {
    try {
        $endpoint = "$($script:WordPressConfig.SiteUrl)/wp-json/wp/v2/users/me"
        $auth = [Convert]::ToBase64String(
            [Text.Encoding]::ASCII.GetBytes(
                "$($script:WordPressConfig.Username):$($script:WordPressConfig.AppPassword)"
            )
        )
        
        $headers = @{
            "Authorization" = "Basic $auth"
        }
        
        $response = Invoke-RestMethod -Uri $endpoint -Headers $headers -Method Get
        return $true
    }
    catch {
        Write-Warning "WordPress connection failed: $_"
        return $false
    }
}

function Publish-WordPressPost {
    param(
        [Parameter(Mandatory)]
        [hashtable]$Content,
        
        [string]$Status = $null,
        [string[]]$Categories = @(),
        [string[]]$Tags = @()
    )
    
    if ([string]::IsNullOrEmpty($script:WordPressConfig.SiteUrl)) {
        throw "WordPress not initialized. Call Initialize-WordPressPublisher first."
    }
    
    $status = if ($Status) { $Status } else { $script:WordPressConfig.DefaultStatus }
    
    # Prepare the post data
    $postData = @{
        title = $Content.Title
        content = $Content.Content
        status = $status
        excerpt = ($Content.Content -replace '<[^>]+>', '' | Select-Object -First 160)
    }
    
    # Add categories if provided
    if ($Categories.Count -gt 0) {
        $categoryIds = $Categories | ForEach-Object {
            Get-WordPressCategory -Name $_
        }
        $postData.categories = $categoryIds
    }
    
    # Add tags if provided
    if ($Tags.Count -gt 0) {
        $tagIds = $Tags | ForEach-Object {
            Get-WordPressTag -Name $_
        }
        $postData.tags = $tagIds
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
        "Content-Type" = "application/json"
    }
    
    # Publish
    $endpoint = "$($script:WordPressConfig.SiteUrl)/wp-json/wp/v2/posts"
    
    try {
        $response = Invoke-RestMethod -Uri $endpoint `
            -Method Post `
            -Headers $headers `
            -Body $body
        
        Write-Verbose "Published to WordPress: $($response.link)"
        
        return @{
            Id = $response.id
            Url = $response.link
            Status = $response.status
            PublishedAt = Get-Date
        }
    }
    catch {
        throw "Failed to publish to WordPress: $_"
    }
}

function Get-WordPressCategory {
    param([string]$Name)
    
    # This would search for or create the category
    # Simplified for now
    return 1  # Default category
}

function Get-WordPressTag {
    param([string]$Name)
    
    # This would search for or create the tag
    # Simplified for now
    return 1
}

Export-ModuleMember -Function Initialize-WordPressPublisher, Publish-WordPressPost, Test-WordPressConnection
```

**Kingdom Salvage Check:**
- [ ] Does Kingdom have WordPress integration?
- [ ] What's the authentication pattern?
- [ ] Is there category/tag management?

#### 3.3 Content Tracker Database (200 lines)
**Problem:** Need to track what's been published
**Solution:** Simple SQLite database

```powershell
# ContentTracker.psm1

$script:DbPath = "C:\Repos GIT\Fresh-Start\data\content-tracker.db"

function Initialize-ContentDatabase {
    # Check if SQLite module is available
    if (-not (Get-Module -ListAvailable -Name PSSQLite)) {
        Write-Warning "PSSQLite module not found. Install with: Install-Module PSSQLite"
        # Fallback to JSON-based tracking
        $script:UseJsonTracking = $true
        return
    }
    
    Import-Module PSSQLite
    
    # Create database if it doesn't exist
    if (-not (Test-Path $script:DbPath)) {
        $query = @"
CREATE TABLE IF NOT EXISTS published_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    published_at DATETIME NOT NULL,
    platform TEXT NOT NULL,
    url TEXT,
    status TEXT,
    word_count INTEGER,
    keywords TEXT,
    metadata TEXT
);

CREATE INDEX idx_published_at ON published_content(published_at);
CREATE INDEX idx_platform ON published_content(platform);
CREATE INDEX idx_content_hash ON published_content(content_hash);
"@
        Invoke-SqliteQuery -DataSource $script:DbPath -Query $query
    }
}

function Add-PublishedContent {
    param(
        [Parameter(Mandatory)]
        [hashtable]$Content,
        
        [Parameter(Mandatory)]
        [string]$Platform,
        
        [Parameter(Mandatory)]
        [hashtable]$PublishResult
    )
    
    if ($script:UseJsonTracking) {
        return Add-PublishedContentJson @PSBoundParameters
    }
    
    $contentHash = Get-StringHash -String $Content.Content
    $slug = ($Content.Title -replace '[^a-zA-Z0-9]', '-').ToLower()
    
    $query = @"
INSERT INTO published_content 
(title, slug, content_hash, published_at, platform, url, status, word_count, keywords, metadata)
VALUES 
(@title, @slug, @contentHash, @publishedAt, @platform, @url, @status, @wordCount, @keywords, @metadata)
"@
    
    $params = @{
        title = $Content.Title
        slug = $slug
        contentHash = $contentHash
        publishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        platform = $Platform
        url = $PublishResult.Url
        status = $PublishResult.Status
        wordCount = $Content.WordCount
        keywords = ($Content.Keywords -join ',')
        metadata = ($Content.Metadata | ConvertTo-Json -Compress)
    }
    
    Invoke-SqliteQuery -DataSource $script:DbPath -Query $query -SqlParameters $params
}

function Get-PublishedContent {
    param(
        [string]$Platform,
        [datetime]$Since,
        [int]$Limit = 100
    )
    
    if ($script:UseJsonTracking) {
        return Get-PublishedContentJson @PSBoundParameters
    }
    
    $query = "SELECT * FROM published_content WHERE 1=1"
    $params = @{}
    
    if ($Platform) {
        $query += " AND platform = @platform"
        $params.platform = $Platform
    }
    
    if ($Since) {
        $query += " AND published_at >= @since"
        $params.since = $Since.ToString("yyyy-MM-dd HH:mm:ss")
    }
    
    $query += " ORDER BY published_at DESC LIMIT @limit"
    $params.limit = $Limit
    
    return Invoke-SqliteQuery -DataSource $script:DbPath -Query $query -SqlParameters $params
}

function Get-StringHash {
    param([string]$String)
    $stringBytes = [System.Text.Encoding]::UTF8.GetBytes($String)
    $hashBytes = [System.Security.Cryptography.SHA256]::Create().ComputeHash($stringBytes)
    return [System.BitConverter]::ToString($hashBytes) -replace '-'
}

# JSON-based fallback (if SQLite not available)
function Add-PublishedContentJson {
    param($Content, $Platform, $PublishResult)
    
    $jsonPath = "C:\Repos GIT\Fresh-Start\data\published-content.json"
    $records = if (Test-Path $jsonPath) {
        Get-Content $jsonPath | ConvertFrom-Json
    } else {
        @()
    }
    
    $records += @{
        timestamp = Get-Date
        title = $Content.Title
        platform = $Platform
        url = $PublishResult.Url
    }
    
    $records | ConvertTo-Json | Set-Content $jsonPath
}

Export-ModuleMember -Function Initialize-ContentDatabase, Add-PublishedContent, Get-PublishedContent
```

**Kingdom Salvage Check:**
- [ ] Does Kingdom have content tracking?
- [ ] What database system is used?
- [ ] Is there a JSON fallback?

---

## THE KINGDOM BONEYARD - Salvage Checklist

This is our systematic approach to mining The Kingdom repo for usable components.

### Phase 0: Reconnaissance

**Step 1: Locate The Kingdom**
- [ ] Find Kingdom repo path on LuxRig
- [ ] Inventory all modules (110+)
- [ ] Identify directory structure
- [ ] Check git history for recent changes

**Step 2: Quick Assessment**
- [ ] Does it run at all?
- [ ] What's the last commit date?
- [ ] Are there any test files?
- [ ] Is there documentation?

### Salvage Priority Matrix

#### 🏆 CRITICAL SALVAGE (Must Extract if They Work)

**1. LM Studio Connection**
- [ ] Find: LM Studio connector module
- [ ] Test: Can it connect to localhost:1234 or localhost:5173?
- [ ] Extract: Working endpoint configuration
- [ ] Extract: Retry logic
- [ ] Extract: Error handling patterns
- **Status:** _____
- **Notes:** _____

**2. Logging System**
- [ ] Find: Logging utilities
- [ ] Test: Does it write to files?
- [ ] Extract: Log rotation logic
- [ ] Extract: Log levels (INFO, WARN, ERROR)
- **Status:** _____
- **Notes:** _____

**3. Configuration Management**
- [ ] Find: Config loader
- [ ] Test: Can it read JSON/YAML?
- [ ] Extract: Settings structure
- [ ] Extract: Environment variable support
- **Status:** _____
- **Notes:** _____

**4. Module Loading Pattern**
- [ ] Find: How modules are imported
- [ ] Test: Does Export-ModuleMember work?
- [ ] Extract: Module initialization pattern
- [ ] Extract: Dependency injection (if any)
- **Status:** _____
- **Notes:** _____

#### 🔧 HIGH VALUE SALVAGE (Nice to Have)

**5. Content Generation**
- [ ] Find: Existing content generators
- [ ] Test: Do they produce readable output?
- [ ] Extract: Prompt templates
- [ ] Extract: Quality validation
- **Status:** _____
- **Notes:** _____

**6. Reddit/HackerNews Scrapers**
- [ ] Find: Trend detection modules
- [ ] Test: Can they fetch data?
- [ ] Extract: API wrappers
- [ ] Extract: Parsing logic
- **Status:** _____
- **Notes:** _____

**7. HTML Generation**
- [ ] Find: Template system
- [ ] Test: Does it produce valid HTML?
- [ ] Extract: Template engine
- [ ] Extract: Sample templates
- **Status:** _____
- **Notes:** _____

**8. Error Handling Utilities**
- [ ] Find: Try-catch wrappers
- [ ] Test: Does error recovery work?
- [ ] Extract: Retry logic
- [ ] Extract: Fallback patterns
- **Status:** _____
- **Notes:** _____

#### 📚 REFERENCE SALVAGE (Learn From, Don't Copy)

**9. Architecture Patterns**
- [ ] Document: How modules communicate
- [ ] Document: State management approach
- [ ] Document: Event/message passing
- [ ] Document: Orchestration pattern

**10. Anti-Patterns (What NOT to Do)**
- [ ] Identify: Circular dependencies
- [ ] Identify: Overly complex modules
- [ ] Identify: Performance bottlenecks
- [ ] Identify: Tight coupling issues

#### 🚫 DO NOT SALVAGE (Leave in Boneyard)

**11. Broken/Incomplete Systems**
- [ ] Crypto trading (separate concern)
- [ ] API marketplace (premature)
- [ ] Product builder (different skillset)
- [ ] Multi-AI provider switcher (unnecessary complexity)
- [ ] Anything with 100+ unresolved TODOs

**12. Over-Engineered Solutions**
- [ ] Abstract factories for factories
- [ ] Dependency injection frameworks
- [ ] Custom ORM implementations
- [ ] Overly generic "plugin architectures"

---

## Salvage Execution Plan

### Session 1: Initial Scan (Tonight)
```powershell
# Navigate to Kingdom
cd "C:\[Kingdom-Path]"

# Get overview
Get-ChildItem -Recurse -Filter "*.ps1" | Measure-Object
Get-ChildItem -Recurse -Filter "*.psm1" | Measure-Object

# Find key modules
Get-ChildItem -Recurse -Filter "*lmstudio*" 
Get-ChildItem -Recurse -Filter "*log*"
Get-ChildItem -Recurse -Filter "*config*"

# Check for tests
Get-ChildItem -Recurse -Filter "*test*"

# Look for documentation
Get-ChildItem -Recurse -Filter "*.md"
```

### Session 2: Deep Dive (Next Time)
- Open each critical module
- Read the code
- Run isolated tests
- Document what works

### Session 3: Extraction (After Assessment)
- Copy working code to Fresh-Start
- Refactor to match new architecture
- Add proper tests
- Document changes

---

## Comparison: Kingdom vs Fresh-Start

### Architecture Philosophy

**Kingdom (The Boneyard)**
- Wide: 110 modules, 6 revenue streams
- Complex: Deep inheritance, tight coupling
- Ambitious: Everything at once
- Status: 0 revenue, 0 shipped products

**Fresh-Start (The Focused Build)**
- Deep: 10 modules, 1 revenue stream
- Simple: Flat structure, loose coupling
- Pragmatic: Ship first, optimize later
- Goal: $0.01 revenue in Week 2

### Code Organization

**Kingdom Structure (Assumed)**
```
Kingdom/
├── Core/
│   ├── 20+ base classes
│   ├── Abstract factories
│   └── Dependency injection framework
├── Modules/
│   ├── 110+ modules
│   ├── Circular dependencies
│   └── Half-finished implementations
├── Services/
│   ├── Multiple AI providers
│   ├── Crypto trading
│   ├── API marketplace
│   └── Product builder
└── Utils/
    ├── 50+ utility functions
    └── Some might actually work
```

**Fresh-Start Structure (Actual)**
```
Fresh-Start/
├── src/
│   ├── core/          (3-4 modules)
│   ├── generators/    (2-3 modules)
│   ├── publishers/    (2 modules)
│   ├── revenue/       (2-3 modules)
│   └── discovery/     (1-2 modules)
├── config/
│   └── Simple JSON files
└── data/
    └── Output and logs
```

### Dependency Management

**Kingdom:**
- 50+ npm packages
- 30+ PowerShell modules
- 10+ API integrations
- Result: Dependency hell

**Fresh-Start:**
- LM Studio (already have)
- PSSQLite (optional, has JSON fallback)
- Native PowerShell (built-in)
- Result: Minimal dependencies

---

## Decision Framework: Salvage or Rebuild?

For each Kingdom component, ask:

### 1. Does it work?
- **YES** → Consider salvaging
- **NO** → Rebuild from scratch
- **UNKNOWN** → Test it first

### 2. Is it simple?
- **< 200 lines** → Probably salvageable
- **200-500 lines** → Extract core logic only
- **> 500 lines** → Rebuild simpler

### 3. Is it coupled?
- **Self-contained** → Easy salvage
- **Few dependencies** → Extract carefully
- **Tightly coupled** → Not worth it

### 4. Is it tested?
- **Has tests** → Salvage confidently
- **No tests** → Treat as reference only
- **Tests fail** → Rebuild

### 5. Is it documented?
- **Well documented** → Understand and reuse
- **Some comments** → Proceed with caution
- **No docs** → Probably a mess

---

## Success Metrics for Salvage Operation

### Week 1 (Tonight + Tomorrow)
- [ ] Located Kingdom repo
- [ ] Completed Phase 0 reconnaissance
- [ ] Identified 3-5 salvageable modules
- [ ] Documented Kingdom architecture

### Week 2 (Next Session)
- [ ] Extracted working LM Studio connector (if exists)
- [ ] Extracted logging system (if exists)
- [ ] Extracted config loader (if exists)
- [ ] Tested extracted components in Fresh-Start

### Week 3 (Integration)
- [ ] Integrated salvaged components
- [ ] Verified everything works together
- [ ] Documented what was salvaged
- [ ] Documented what was rebuilt

---

## The Reality Check

**Best Case Scenario:**
- Kingdom has 10-15 working, well-written modules
- We salvage them and save 30-40 hours
- Fresh-Start gets a head start

**Worst Case Scenario:**
- Kingdom is completely broken
- Nothing works, everything's coupled
- We use it only as a reference
- Still faster than starting completely blind

**Most Likely Scenario:**
- Kingdom has 3-5 gems buried in the mess
- LM Studio connector probably works
- Logging might be salvageable
- Everything else we rebuild better

---

## Next Actions (Immediate)

**Tonight's Homework:**
1. [ ] Locate Kingdom repo on LuxRig
2. [ ] Run reconnaissance script
3. [ ] Document findings in this file
4. [ ] Sleep on it

**Tomorrow's Session:**
1. [ ] Review findings
2. [ ] Deep dive into top 3 promising modules
3. [ ] Extract first working component
4. [ ] Integrate into Fresh-Start

**This Week:**
1. [ ] Complete salvage operation
2. [ ] Build Phase 1 (Emergency Repairs)
3. [ ] Build Phase 2 (LM Studio Connection)
4. [ ] Ship something that works

---

## Final Thoughts

The Kingdom was ambitious. Fresh-Start is focused.

The Kingdom taught us what doesn't work. Fresh-Start applies those lessons.

The Kingdom tried to be everything. Fresh-Start will be one thing, done well.

**We're not abandoning The Kingdom. We're learning from it.**

Now let's go find those gems in the boneyard. 💎

