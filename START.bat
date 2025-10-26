@echo off
echo ========================================
echo PDF to Excel Converter - Quick Start
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MySQL is installed
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] MySQL command not found in PATH
    echo Make sure MySQL is installed and running
    echo.
)

echo [1/4] Checking environment...
echo.

REM Check if backend .env exists
if not exist "backend\.env" (
    echo [INFO] Creating backend .env file from template...
    copy "backend\.env.example" "backend\.env"
    echo.
    echo IMPORTANT: Please edit backend\.env with your MySQL password
    echo Press any key after editing .env file...
    pause
)

echo [2/4] Installing backend dependencies...
cd backend
if not exist "node_modules" (
    call npm install
) else (
    echo Backend dependencies already installed
)
echo.

echo [3/4] Installing frontend dependencies...
cd ..\frontend
if not exist "node_modules" (
    call npm install
) else (
    echo Frontend dependencies already installed
)
cd ..
echo.

echo [4/4] Initializing database...
cd backend
call npm run init-db
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Database initialization failed!
    echo Please check:
    echo   1. MySQL is running
    echo   2. Credentials in backend\.env are correct
    echo   3. MySQL user has proper permissions
    echo.
    pause
    exit /b 1
)
cd ..
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Starting servers...
echo   - Backend will run on http://localhost:5000
echo   - Frontend will run on http://localhost:3000
echo.
echo Press Ctrl+C to stop the servers
echo.
echo Opening backend and frontend in new windows...
echo.

REM Start backend in new window
start "PDF Converter - Backend" cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "PDF Converter - Frontend" cmd /k "cd frontend && npm run dev"

REM Wait a moment
timeout /t 5 /nobreak >nul

REM Open browser
echo Opening browser...
start http://localhost:3000

echo.
echo ========================================
echo Application is running!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo You can close this window.
echo The application will continue running in the other windows.
echo.
pause
