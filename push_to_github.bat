@echo off
title Push SmartPulse BI to GitHub
echo ===================================================================
echo     SmartPulse - GitHub Code Pusher
echo     Target: https://github.com/prabhavathi11-code/SmartPulse-AI-Dashboard
echo ===================================================================
echo.
echo Pushing local 'main' branch to GitHub...
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===============================================================
    echo [SUCCESS] Your repository is published and live at:
    echo https://github.com/prabhavathi11-code/SmartPulse-AI-Dashboard
    echo ===============================================================
) else (
    echo.
    echo ---------------------------------------------------------------
    echo If your repository was just created on github.com, please
    echo verify you clicked the green 'Create repository' button
    echo and then press any key to retry.
    echo ---------------------------------------------------------------
)

echo.
pause
