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

title AWSRT Frontend

if not exist "frontend\.env.local" (
    if exist "frontend\.env.local.example" (
        echo.
        echo frontend\.env.local was not found.
        echo Creating it from frontend\.env.local.example...
        copy /Y "frontend\.env.local.example" "frontend\.env.local" >nul
    )
)

echo.
echo ============================================================
echo  AWSRT FRONTEND
echo ============================================================
echo.
echo Starting frontend on http://localhost:3000
echo.
echo Leave this window open while using AWSRT.
echo Open http://localhost:3000 in your web browser.
echo Press Ctrl+C to stop the frontend.
echo.

npm --prefix frontend run dev

echo.
echo AWSRT frontend has stopped.
echo.
pause
