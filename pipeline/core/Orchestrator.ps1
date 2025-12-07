# Orchestrator.ps1
# Main entry point for Fresh-Start

# Get script directory to resolve relative paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Import Modules
Import-Module "$ScriptDir\ConfigManager.psm1" -Force
Import-Module "$ScriptDir\Logger.psm1" -Force
Import-Module "$ScriptDir\LMStudio-Client.psm1" -Force
Import-Module "$ScriptDir\ContentQualityTester.psm1" -Force
Import-Module "$ScriptDir\ContentTracker.psm1" -Force
Import-Module "$ScriptDir\..\revenue\AdManager.psm1" -Force
Import-Module "$ScriptDir\..\publishers\HtmlPublisher.psm1" -Force
Import-Module "$ScriptDir\..\publishers\WordPressPublisher.psm1" -Force

# Load Config
$ConfigPath = "$ScriptDir\Config.json"
$Config = Get-Config -ConfigPath $ConfigPath

# Resolve Paths
$LogDir = Join-Path $ScriptDir $Config.Paths.Logs
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}
$LogDir = (Resolve-Path $LogDir).Path
$LogPath = Join-Path $LogDir "orchestrator.log"
$OutputDir = Join-Path $ScriptDir $Config.Paths.Output

# Helper for logging with consistent path
function Log {
    param(
        [Parameter(Mandatory = $true)][string]$Message,
        [string]$Level = "INFO"
    )
    Write-Log -Message $Message -Level $Level -LogPath $LogPath
}

Log -Message "Orchestrator started." -Level "INFO"

# 1. Define Task
$Topic = $Config.Defaults.Topic
Log -Message "Selected topic: $Topic" -Level "INFO"

# 2. Call LM Studio
Log -Message "Connecting to LM Studio at $($Config.LMStudio.ApiUrl)..." -Level "INFO"

$Result = Invoke-LMStudioGeneration `
    -ApiUrl $Config.LMStudio.ApiUrl `
    -SystemPrompt $Config.Defaults.SystemPrompt `
    -UserPrompt "Write a blog post about: $Topic" `
    -Model $Config.LMStudio.Model `
    -MaxTokens $Config.LMStudio.MaxTokens `
    -Temperature $Config.LMStudio.Temperature

if ($Result.Success) {
    Log -Message "Content generated successfully." -Level "SUCCESS"

    # 3. Quality Check
        
    $SanitizedTopic = $Topic -replace "[^a-zA-Z0-9]", "-"
    $MdFileName = "blog-$SanitizedTopic.md"
    $MdFilePath = Join-Path $TargetDir $MdFileName
        
    $MarkdownContent = "# $Topic`n`n$($Result.Content)"
    Set-Content -Path $MdFilePath -Value $MarkdownContent
        
    Log -Message "Saved markdown to: $MdFilePath" -Level "SUCCESS"
        
    # 5. Publish as HTML (Local)
    Log -Message "Publishing HTML..." -Level "INFO"
        
    $PublishResult = Publish-ContentAsHtml `
        -Title $Topic `
        -Content $Result.Content `
        -OutputDir $Config.Paths.Output `
        -Keywords $Keywords `
        -Config $Config
        
    if ($PublishResult -and $PublishResult.HtmlPath) {
        Log -Message "Published HTML to: $($PublishResult.HtmlPath)" -Level "SUCCESS"

        # Track HTML Content
        Add-ContentEntry `
            -Title $Topic `
            -Slug $SanitizedTopic `
            -Content $Result.Content `
            -Platform "LocalHTML" `
            -Url $PublishResult.HtmlPath `
            -Metadata @{ QualityScore = $QualityResult.TotalScore; Grade = $QualityResult.Grade }
    }
    else {
        Log -Message "HTML publishing returned null or invalid result" -Level "ERROR"
    }

    # 6. Publish to WordPress (if enabled)
    if ($Config.WordPress.Enabled -eq $true) {
        Log -Message "WordPress publishing enabled. Initializing..." -Level "INFO"
            
        try {
            $initResult = Initialize-WordPressPublisher `
                -SiteUrl $Config.WordPress.SiteUrl `
                -Username $Config.WordPress.Username `
                -AppPassword $Config.WordPress.AppPassword `
                -DefaultStatus $Config.WordPress.DefaultStatus
                
            if ($initResult) {
                Log -Message "WordPress connection successful." -Level "SUCCESS"
                    
                $wpResult = Publish-WordPressPost `
                    -Title $Topic `
                    -Content $Result.Content `
                    -Categories $Config.WordPress.Categories `
                    -Tags $Config.WordPress.Tags `
                    -Config $Config # Pass config for AdManager integration
                    
                if ($wpResult.Success) {
                    Log -Message "Published to WordPress! Post ID: $($wpResult.PostId), URL: $($wpResult.Url)" -Level "SUCCESS"

                    Add-ContentEntry `
                        -Title $Topic `
                        -Slug $SanitizedTopic `
                        -Content $Result.Content `
                        -Platform "WordPress" `
                        -Url $wpResult.Url `
                        -Metadata @{ QualityScore = $QualityResult.TotalScore; Grade = $QualityResult.Grade; PostId = $wpResult.PostId }
                }
                else {
                    Log -Message "WordPress publish failed: $($wpResult.Error)" -Level "ERROR"
                }
            }
        }
        catch {
            Log -Message "WordPress publishing error: $_" -Level "ERROR"
        }
    }
    else {
        Log -Message "WordPress publishing disabled in config." -Level "INFO"
    }
}
else {
    Log -Message "Generation failed: $($Result.Error)" -Level "ERROR"
}

Log -Message "Orchestrator finished." -Level "INFO"
