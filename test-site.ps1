# Portfolio Site Testing Script
# This script tests all aspects of your portfolio site

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PORTFOLIO SITE TESTING SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$TestName,
        [string]$ExpectedStatus = "200"
    )
    
    Write-Host "Testing: $TestName" -NoNewline
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host " [PASSED]" -ForegroundColor Green
            $script:testsPassed++
            return $true
        } else {
            Write-Host " [FAILED] (Status: $($response.StatusCode))" -ForegroundColor Red
            $script:testsFailed++
            return $false
        }
    } catch {
        Write-Host " [FAILED] ($($_.Exception.Message))" -ForegroundColor Red
        $script:testsFailed++
        return $false
    }
}

function Test-Build {
    Write-Host "`n[1/4] BUILD TEST" -ForegroundColor Yellow
    Write-Host "Running production build test..." -NoNewline
    try {
        $buildOutput = npm run build 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host " [PASSED]" -ForegroundColor Green
            $script:testsPassed++
            return $true
        } else {
            Write-Host " [FAILED]" -ForegroundColor Red
            Write-Host $buildOutput -ForegroundColor Red
            $script:testsFailed++
            return $false
        }
    } catch {
        Write-Host " [FAILED]" -ForegroundColor Red
        $script:testsFailed++
        return $false
    }
}

function Test-Lint {
    Write-Host "`n[2/4] CODE QUALITY TEST" -ForegroundColor Yellow
    Write-Host "Running ESLint..." -NoNewline
    try {
        $lintOutput = npm run lint 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host " [PASSED]" -ForegroundColor Green
            $script:testsPassed++
        } else {
            Write-Host " [WARNINGS]" -ForegroundColor Yellow
            $script:testsFailed++
        }
    } catch {
        Write-Host " [FAILED]" -ForegroundColor Red
        $script:testsFailed++
    }
}

function Test-Server {
    Write-Host "`n[3/4] SERVER AVAILABILITY TEST" -ForegroundColor Yellow
    Write-Host "Waiting for server to be ready..."
    Start-Sleep -Seconds 5
    
    Test-Endpoint -Url "$baseUrl" -TestName "Homepage" | Out-Null
    Test-Endpoint -Url "$baseUrl/sitemap.xml" -TestName "Sitemap" | Out-Null
    Test-Endpoint -Url "$baseUrl/robots.txt" -TestName "Robots.txt" | Out-Null
    Test-Endpoint -Url "$baseUrl/api/contact" -TestName "Contact API (POST required)" -ExpectedStatus "405" | Out-Null
}

function Test-Content {
    Write-Host "`n[4/4] CONTENT VERIFICATION TEST" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $baseUrl -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        $content = $response.Content
        
        $checks = @(
            @{ Name = "HTML Content"; Pattern = "<html"; Expected = $true }
            @{ Name = "Meta Tags"; Pattern = "<meta"; Expected = $true }
            @{ Name = "Structured Data"; Pattern = 'application/ld\+json'; Expected = $true }
            @{ Name = "No Build Errors"; Pattern = "Error|error"; Expected = $false }
        )
        
        foreach ($check in $checks) {
            Write-Host "Checking: $($check.Name)" -NoNewline
            $found = $content -match $check.Pattern
            if ($found -eq $check.Expected -or ($check.Expected -and $found)) {
                Write-Host " [PASSED]" -ForegroundColor Green
                $script:testsPassed++
            } else {
                Write-Host " [FAILED]" -ForegroundColor Red
                $script:testsFailed++
            }
        }
    } catch {
        Write-Host " [FAILED] Cannot verify content: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFailed++
    }
}

function Show-Summary {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
    Write-Host "Tests Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -gt 0) { "Red" } else { "Green" })
    Write-Host ""
    
    if ($testsFailed -eq 0) {
        Write-Host "[SUCCESS] All tests passed! Your portfolio site is ready." -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Some tests failed. Please review the output above." -ForegroundColor Yellow
    }
    
    Write-Host "`nYour site is running at: $baseUrl" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C in the dev server terminal to stop the server." -ForegroundColor Gray
}

# Run all tests
Write-Host "Starting comprehensive tests...`n" -ForegroundColor Yellow

# Note: Build test is commented out as it stops the dev server
# Uncomment if you want to test production build separately
# Test-Build

Test-Lint
Test-Server
Test-Content
Show-Summary

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  MANUAL TESTING CHECKLIST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please test these manually in your browser:" -ForegroundColor Yellow
Write-Host "  [ ] Homepage loads correctly"
Write-Host "  [ ] All sections are visible (Hero, About, Projects, Achievements, Contact)"
Write-Host "  [ ] Dark/Light theme toggle works"
Write-Host "  [ ] Navigation menu works"
Write-Host "  [ ] Project cards display correctly"
Write-Host "  [ ] Project modals open and close"
Write-Host "  [ ] Contact form validation works"
Write-Host "  [ ] Responsive design (test on mobile/tablet sizes)"
Write-Host "  [ ] All links work (social media, projects, resume)"
Write-Host "  [ ] Animations and transitions are smooth"
Write-Host ""
Write-Host "Open your browser at: $baseUrl" -ForegroundColor Cyan

