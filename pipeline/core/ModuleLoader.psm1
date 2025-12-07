# ModuleLoader.psm1
# Safe module loading with dependency injection, error handling, and initialization patterns

class ModuleContainer {
    [hashtable]$Modules = @{}
    [hashtable]$Dependencies = @{}

    [void]Register([string]$Name, [scriptblock]$Factory, [string[]]$Deps = @()) {
        $this.Dependencies[$Name] = $Deps
        $this.Modules[$Name] = @{
            Factory     = $Factory
            Instance    = $null
            Initialized = $false
        }
    }

    [object]Resolve([string]$Name) {
        if (-not $this.Modules.ContainsKey($Name)) {
            throw "Module '$Name' not registered."
        }

        $moduleInfo = $this.Modules[$Name]

        if ($null -eq $moduleInfo.Instance) {
            # Resolve dependencies
            $deps = @{}
            foreach ($dep in $this.Dependencies[$Name]) {
                $deps[$dep] = $this.Resolve($dep)
            }

            # Instantiate module
            try {
                $moduleInfo.Instance = & $moduleInfo.Factory $deps
            }
            catch {
                throw "Failed to instantiate module '$Name': $_"
            }
        }

        return $moduleInfo.Instance
    }

    [void]Initialize([string]$Name) {
        $instance = $this.Resolve($Name)
        if ($instance -and (Get-Member -InputObject $instance -Name 'Initialize' -MemberType Method)) {
            try {
                $instance.Initialize()
                $this.Modules[$Name].Initialized = $true
            }
            catch {
                throw "Failed to initialize module '$Name': $_"
            }
        }
    }

    [void]InitializeAll() {
        foreach ($name in $this.Modules.Keys) {
            $this.Initialize($name)
        }
    }
}

function New-ModuleContainer {
    return [ModuleContainer]::new()
}

function Import-SafeModule {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [switch]$Force
    )

    try {
        if (-not (Test-Path $Path)) {
            throw "Module file not found: $Path"
        }

        Import-Module $Path -Force:$Force -ErrorAction Stop
        Write-Host "Successfully imported module: $Path"
    }
    catch {
        Write-Error "Failed to import module '$Path': $_"
        throw
    }
}

function Import-CoreModules {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BasePath,

        [ModuleContainer]$Container = (New-ModuleContainer)
    )

    # Register Logger
    $Container.Register('Logger', {
            param($deps)
            Import-SafeModule -Path (Join-Path $BasePath 'Logger.psm1')
            return @{
                WriteLog = ${function:Write-Log}
            }
        })

    # Register ConfigManager
    $Container.Register('ConfigManager', {
            param($deps)
            Import-SafeModule -Path (Join-Path $BasePath 'ConfigManager.psm1')
            return @{
                GetConfig = ${function:Get-Config}
            }
        })

    # Register LMStudio Client
    $Container.Register('LMStudioClient', {
            param($deps)
            Import-SafeModule -Path (Join-Path $BasePath 'LMStudio-Client.psm1')
            return @{
                InvokeGeneration = ${function:Invoke-LMStudioGeneration}
            }
        }, @('Logger', 'ConfigManager'))

    # Register ContentTracker
    $Container.Register('ContentTracker', {
            param($deps)
            Import-SafeModule -Path (Join-Path $BasePath 'ContentTracker.psm1')
            return @{
                TrackContent = ${function:Track-Content}
            }
        }, @('Logger'))

    # Register ContentQualityTester
    $Container.Register('ContentQualityTester', {
            param($deps)
            Import-SafeModule -Path (Join-Path $BasePath 'ContentQualityTester.psm1')
            return @{
                TestQuality = ${function:Test-ContentQuality}
            }
        }, @('Logger', 'LMStudioClient'))

    return $Container
}

function Import-PublisherModules {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PublisherPath,

        [ModuleContainer]$Container = (New-ModuleContainer)
    )

    # Load HtmlPublisher.psm1
    if (Test-Path (Join-Path $PublisherPath 'HtmlPublisher.psm1')) {
        $Container.Register('HtmlPublisher', {
                param($deps)
                Import-SafeModule -Path (Join-Path $PublisherPath 'HtmlPublisher.psm1')
                return @{
                    PublishHtml = ${function:Publish-ContentAsHtml}
                }
            }, @('Logger', 'ConfigManager'))
    }

    # Load WordPressPublisher.psm1
    if (Test-Path (Join-Path $PublisherPath 'WordPressPublisher.psm1')) {
        $Container.Register('WordPressPublisher', {
                param($deps)
                Import-SafeModule -Path (Join-Path $PublisherPath 'WordPressPublisher.psm1')
                return @{
                    InitializeWordPress = ${function:Initialize-WordPressPublisher}
                    PublishWordPress    = ${function:Publish-WordPressPost}
                }
            }, @('Logger', 'ConfigManager'))
    }

    return $Container
}

Export-ModuleMember -Function New-ModuleContainer, Import-SafeModule, Import-CoreModules, Import-PublisherModules