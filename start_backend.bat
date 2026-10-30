@echo off
title SmartPulse - Backend API (FastAPI)
echo ===================================================
echo   SmartPulse AI Business Intelligence Backend
echo   Starting FastAPI Server on http://127.0.0.1:8000
echo ===================================================
cd /d "%~dp0backend"
call venv\Scripts\activate
python run.py
pause

