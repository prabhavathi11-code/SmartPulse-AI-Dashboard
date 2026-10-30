@echo off
title Push SmartPulse BI to GitHub
echo ===================================================================
echo     SmartPulse - GitHub Automated Push & Publish Tool
echo     GitHub Account: prabhavathi11-code
echo ===================================================================
echo.

:: Refresh Path to ensure gh and git are loaded
set "PATH=%LOCALAPPDATA%\Programs\GitHub CLI;%PATH%"

echo [1/3] Checking GitHub CLI authentication...
gh auth status >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ---------------------------------------------------------------
    echo You need to log in to GitHub once.
    echo A browser window will open. Click 'Authorize' and return here.
    echo ---------------------------------------------------------------
    echo.
    gh auth login -h github.com -p https -w
)

echo.
echo [2/3] Creating public GitHub repository: SmartPulse-AI-Dashboard ...
gh repo create SmartPulse-AI-Dashboard --public --source=. --remote=origin --push

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===============================================================
    echo [SUCCESS] Your repository is published and live at:
    echo https://github.com/prabhavathi11-code/SmartPulse-AI-Dashboard
    echo ===============================================================
) else (
    echo.
    echo Repository might already exist. Attempting direct push...
    git push -u origin main
)

echo.
pause
