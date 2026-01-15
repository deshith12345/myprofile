# Portfolio Setup Checker Script
# Run this script to verify your setup

Write-Host "=== Portfolio Setup Checker ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = & node --version 2>$null
$npmVersion = & npm --version 2>$null

if ($nodeVersion) {
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js NOT found" -ForegroundColor Red
    Write-Host "  Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
}

if ($npmVersion) {
    Write-Host "✓ npm found: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "✗ npm NOT found" -ForegroundColor Red
}

Write-Host ""

# Check portfolio files
Write-Host "Checking portfolio files..." -ForegroundColor Yellow
$requiredFiles = @(
    "package.json",
    "app\page.tsx",
    "app\layout.tsx",
    "components\Header.tsx",
    "components\Hero.tsx",
    "data\profile.ts"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "✗ $file NOT found" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

# Check node_modules
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✓ Dependencies installed (node_modules exists)" -ForegroundColor Green
} else {
    Write-Host "✗ Dependencies NOT installed" -ForegroundColor Red
    Write-Host "  Run: npm install" -ForegroundColor Yellow
}

Write-Host ""

# Check .env.local
Write-Host "Checking environment variables..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✓ .env.local exists" -ForegroundColor Green
} else {
    Write-Host "⚠ .env.local NOT found" -ForegroundColor Yellow
    Write-Host "  Copy .env.local.example to .env.local and configure it" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Check Complete ===" -ForegroundColor Cyan
Write-Host ""

if ($nodeVersion -and $npmVersion -and -not (Test-Path "node_modules")) {
    Write-Host "Ready to install dependencies! Run:" -ForegroundColor Green
    Write-Host "  npm install" -ForegroundColor Cyan
} elseif (-not $nodeVersion) {
    Write-Host "Please install Node.js first from https://nodejs.org/" -ForegroundColor Yellow
}

