@echo off
title SmartPulse BI Launcher
echo ========================================================
echo   Launching SmartPulse AI Real-Time BI Dashboard
echo ========================================================
echo.
echo 1. Starting Backend API on http://127.0.0.1:8000 ...
start "SmartPulse Backend" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate && python run.py"

timeout /t 3 /nobreak > nul

echo 2. Starting Frontend Dashboard on http://localhost:5173 ...
start "SmartPulse Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Application launched! Open http://localhost:5173 in your browser.
echo ========================================================
pause

