@echo off
REM ===================================================================
REM CLEANUP SCRIPT - FileRecoveryPro
REM Elimina processi residui di Electron/Node che bloccano l'installazione
REM ===================================================================

echo.
echo ============================================
echo   FileRecoveryPro - Cleanup Processi
echo ============================================
echo.

echo [1/4] Chiusura FileRecoveryPro...
taskkill /F /IM "File Recovery Pro.exe" 2>nul
taskkill /F /IM "file-recovery-pro.exe" 2>nul
taskkill /F /IM "FileRecoveryPro.exe" 2>nul
timeout /t 1 /nobreak >nul

echo [2/4] Chiusura processi Electron...
taskkill /F /IM electron.exe 2>nul
timeout /t 1 /nobreak >nul

echo [3/4] Chiusura processi Node...
taskkill /F /IM node.exe 2>nul
timeout /t 1 /nobreak >nul

echo [4/4] Pulizia cache temporanea...
if exist "%TEMP%\file-recovery-pro-updater" (
    rd /s /q "%TEMP%\file-recovery-pro-updater" 2>nul
)
if exist "%LOCALAPPDATA%\file-recovery-pro-updater" (
    rd /s /q "%LOCALAPPDATA%\file-recovery-pro-updater" 2>nul
)

echo.
echo ============================================
echo   Cleanup completato!
echo ============================================
echo.
echo Ora puoi reinstallare l'applicazione.
echo.
pause
