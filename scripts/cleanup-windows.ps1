# ===================================================================
# CLEANUP SCRIPT - FileRecoveryPro (PowerShell)
# Elimina processi residui e file di lock
# ===================================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  FileRecoveryPro - Cleanup Avanzato" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Funzione per killare processo con grace period
function Stop-ProcessSafely {
    param($ProcessName)
    
    $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "[INFO] Chiusura $ProcessName..." -ForegroundColor Yellow
        foreach ($proc in $processes) {
            try {
                $proc.CloseMainWindow() | Out-Null
                Start-Sleep -Milliseconds 500
                if (!$proc.HasExited) {
                    $proc.Kill()
                }
                Write-Host "  ✓ Processo $($proc.Id) terminato" -ForegroundColor Green
            }
            catch {
                Write-Host "  ✗ Errore terminazione: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    else {
        Write-Host "[OK] $ProcessName non in esecuzione" -ForegroundColor Gray
    }
}

# 1. Chiusura applicazione
Write-Host "[1/6] Chiusura FileRecoveryPro..." -ForegroundColor White
Stop-ProcessSafely "File Recovery Pro"
Stop-ProcessSafely "file-recovery-pro"
Stop-ProcessSafely "FileRecoveryPro"

# 2. Chiusura Electron
Write-Host "[2/6] Chiusura processi Electron..." -ForegroundColor White
Stop-ProcessSafely "electron"

# 3. Chiusura Node
Write-Host "[3/6] Chiusura processi Node..." -ForegroundColor White
Stop-ProcessSafely "node"

# 4. Rimozione file di lock
Write-Host "[4/6] Rimozione file di lock..." -ForegroundColor White
$lockPaths = @(
    "$env:TEMP\file-recovery-pro.lock",
    "$env:LOCALAPPDATA\file-recovery-pro\*.lock",
    "$env:APPDATA\file-recovery-pro\*.lock"
)
foreach ($pattern in $lockPaths) {
    $files = Get-Item $pattern -ErrorAction SilentlyContinue
    if ($files) {
        $files | Remove-Item -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Rimossi file lock in $pattern" -ForegroundColor Green
    }
}

# 5. Pulizia cache temporanea
Write-Host "[5/6] Pulizia cache temporanea..." -ForegroundColor White
$cachePaths = @(
    "$env:TEMP\file-recovery-pro-updater",
    "$env:LOCALAPPDATA\file-recovery-pro-updater",
    "$env:LOCALAPPDATA\Temp\file-recovery-pro",
    "$env:APPDATA\file-recovery-pro\Cache"
)
foreach ($path in $cachePaths) {
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Rimossa cache: $path" -ForegroundColor Green
    }
}

# 6. Verifica processi residui
Write-Host "[6/6] Verifica finale..." -ForegroundColor White
$residual = @(
    Get-Process -Name "*file-recovery*" -ErrorAction SilentlyContinue
    Get-Process -Name "electron" -ErrorAction SilentlyContinue
) | Where-Object { $_ -ne $null }

if ($residual) {
    Write-Host ""
    Write-Host "ATTENZIONE: Trovati processi residui:" -ForegroundColor Red
    $residual | Format-Table Id, ProcessName, StartTime -AutoSize
    Write-Host ""
    $response = Read-Host "Vuoi forzare la chiusura? (S/N)"
    if ($response -eq "S" -or $response -eq "s") {
        $residual | Stop-Process -Force
        Write-Host "Processi terminati forzatamente" -ForegroundColor Yellow
    }
}
else {
    Write-Host "  ✓ Nessun processo residuo" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Cleanup completato!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Puoi ora:" -ForegroundColor White
Write-Host "  1. Reinstallare l'applicazione" -ForegroundColor Gray
Write-Host "  2. Riavviare il computer (se persistono problemi)" -ForegroundColor Gray
Write-Host ""

# Pausa
Read-Host "Premi INVIO per uscire"
