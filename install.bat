@echo off
echo Installing portfolio website dependencies...
echo.

if not exist package.json (
    echo Error: package.json not found!
    echo Please make sure you are in the portfolio directory.
    pause
    exit /b 1
)

echo Found package.json, running npm install...
echo.

call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Installation completed successfully!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Copy .env.local.example to .env.local
    echo 2. Edit .env.local with your information
    echo 3. Run: npm run dev
    echo.
) else (
    echo.
    echo ========================================
    echo Installation failed!
    echo ========================================
    echo.
    echo Make sure Node.js is installed.
    echo Download from: https://nodejs.org/
    echo.
)

pause

