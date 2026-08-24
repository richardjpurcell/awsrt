@echo off
setlocal
cd /d "%~dp0"

rem ------------------------------------------------------------
rem Find Conda and activate the awsrt environment.
rem This supports the most common Anaconda/Miniconda locations.
rem ------------------------------------------------------------

where conda.bat >nul 2>&1
if not errorlevel 1 (
    call conda.bat activate awsrt
    if not errorlevel 1 goto conda_ready
)

if exist "%USERPROFILE%\anaconda3\condabin\conda.bat" (
    call "%USERPROFILE%\anaconda3\condabin\conda.bat" activate awsrt
    if not errorlevel 1 goto conda_ready
)

if exist "%USERPROFILE%\miniconda3\condabin\conda.bat" (
    call "%USERPROFILE%\miniconda3\condabin\conda.bat" activate awsrt
    if not errorlevel 1 goto conda_ready
)

if exist "%LOCALAPPDATA%\anaconda3\condabin\conda.bat" (
    call "%LOCALAPPDATA%\anaconda3\condabin\conda.bat" activate awsrt
    if not errorlevel 1 goto conda_ready
)

if exist "%LOCALAPPDATA%\miniconda3\condabin\conda.bat" (
    call "%LOCALAPPDATA%\miniconda3\condabin\conda.bat" activate awsrt
    if not errorlevel 1 goto conda_ready
)

if exist "%ProgramData%\anaconda3\condabin\conda.bat" (
    call "%ProgramData%\anaconda3\condabin\conda.bat" activate awsrt
    if not errorlevel 1 goto conda_ready
)

echo.
echo ERROR: Could not activate the Conda environment "awsrt".
echo.
echo Make sure:
echo   1. Anaconda or Miniconda is installed.
echo   2. The environment was created with the name: awsrt
echo.
echo If Conda is installed in a non-standard location, open Anaconda Prompt,
echo go to this AWSRT folder, and run this .bat file from there.
echo.
pause
exit /b 1

:conda_ready

title AWSRT Backend
set "PYTHONPATH=backend"

echo.
echo ============================================================
echo  AWSRT BACKEND
echo ============================================================
echo.
echo Starting backend on http://127.0.0.1:8000
echo Health check:       http://127.0.0.1:8000/health
echo.
echo Leave this window open while using AWSRT.
echo Press Ctrl+C to stop the backend.
echo.

python -m uvicorn api.main:app --reload --port 8000

echo.
echo AWSRT backend has stopped.
echo.
pause
