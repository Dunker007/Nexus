# ContentQualityTester.psm1
# Module for testing and scoring content quality

function Get-WordCount {
    param([string]$Content)
    return ($Content -split '\s+').Count
}

function Get-HeadingCount {
    param([string]$Content)
    $headingMatches = [regex]::Matches($Content, '^#{1,6}\s')
    return $headingMatches.Count
}

function Get-KeywordDensity {
    param([string]$Content, [string[]]$Keywords)
    if ($Keywords.Count -eq 0) { return 0 }
    $totalWords = Get-WordCount -Content $Content
    if ($totalWords -eq 0) { return 0 }
    $keywordCount = 0
    foreach ($keyword in $Keywords) {
        $keywordMatches = [regex]::Matches($Content.ToLower(), [regex]::Escape($keyword.ToLower()))
        $keywordCount += $keywordMatches.Count
    }
    return [math]::Round(($keywordCount / $totalWords) * 100, 2)
}

function Get-ReadabilityScore {
    param([string]$Content)
    # Simple Flesch Reading Ease approximation
    $sentences = ($Content -split '[.!?]') | Where-Object { $_.Trim().Length -gt 0 }
    $words = ($Content -split '\s+') | Where-Object { $_.Length -gt 0 }
    $syllables = 0
    foreach ($word in $words) {
        # Simple syllable count (vowels = syllables)
        $vowels = [regex]::Matches($word.ToLower(), '[aeiouy]').Count
        $syllables += [math]::Max(1, $vowels)
    }
    $sentenceCount = $sentences.Count
    $wordCount = $words.Count
    if ($sentenceCount -eq 0 -or $wordCount -eq 0) { return 0 }
    $avgSentenceLength = $wordCount / $sentenceCount
    $avgSyllablesPerWord = $syllables / $wordCount
    # Flesch Reading Ease formula
    $score = 206.835 - (1.015 * $avgSentenceLength) - (84.6 * $avgSyllablesPerWord)
    return [math]::Max(0, [math]::Min(100, [math]::Round($score, 1)))
}

function Test-ContentQuality {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Content,
        [string[]]$Keywords = @(),
        [int]$TargetWordCount = 500,
        [int]$MinHeadings = 3
    )

    $wordCount = Get-WordCount -Content $Content
    $headingCount = Get-HeadingCount -Content $Content
    $keywordDensity = Get-KeywordDensity -Content $Content -Keywords $Keywords
    $readability = Get-ReadabilityScore -Content $Content

    # Scoring weights
    $wordCountScore = if ($wordCount -ge $TargetWordCount * 0.8 -and $wordCount -le $TargetWordCount * 1.2) { 25 } else { [math]::Max(0, 25 - [math]::Abs($wordCount - $TargetWordCount) / 10) }
    $headingScore = if ($headingCount -ge $MinHeadings) { 25 } else { [math]::Max(0, 25 * ($headingCount / $MinHeadings)) }
    $keywordScore = if ($keywordDensity -ge 0.5 -and $keywordDensity -le 3) { 25 } else { [math]::Max(0, 25 - [math]::Abs($keywordDensity - 1.5) * 10) }
    $readabilityScore = if ($readability -ge 60) { 25 } else { [math]::Max(0, $readability) }

    $totalScore = [math]::Round($wordCountScore + $headingScore + $keywordScore + $readabilityScore)

    return @{
        WordCount        = $wordCount
        HeadingCount     = $headingCount
        KeywordDensity   = $keywordDensity
        ReadabilityScore = $readability
        TotalScore       = $totalScore
        Grade            = if ($totalScore -ge 90) { "A" } elseif ($totalScore -ge 80) { "B" } elseif ($totalScore -ge 70) { "C" } elseif ($totalScore -ge 60) { "D" } else { "F" }
        Passed           = $totalScore -ge 60
    }
}

Export-ModuleMember -Function Test-ContentQuality