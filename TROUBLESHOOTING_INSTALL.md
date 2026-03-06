# 🔧 TROUBLESHOOTING - Problemi Installazione

## ⚠️ PROBLEMA: "Il programma è in esecuzione"

### Sintomi
- Installer dice "Il programma è già in esecuzione"
- Task Manager non mostra l'app
- Impossibile installare o reinstallare
- Dopo "riprova" l'app non si avvia

### Causa
Processi **Electron** o **Node.js** residui bloccati in background che l'installer non riesce a chiudere.

---

## 🚀 SOLUZIONE RAPIDA (3 Metodi)

### METODO 1: Script Automatico (RACCOMANDATO)

#### Windows - File BAT
```cmd
1. Vai nella cartella del progetto
2. Naviga in: scripts\
3. Doppio click su: cleanup-windows.bat
4. Attendi completamento
5. Riprova installazione
```

#### Windows - PowerShell (Più Potente)
```powershell
1. Click destro su Start → Windows PowerShell (Admin)
2. Naviga alla cartella progetto:
   cd "C:\...\FileRecoveryPro_v3_FINAL"
3. Esegui:
   .\scripts\cleanup-windows.ps1
4. Conferma con 'S' se richiesto
5. Riprova installazione
```

---

### METODO 2: Task Manager Manuale

#### Step by Step:

**1. Apri Task Manager**
```
Ctrl + Shift + Esc
```

**2. Vai su "Dettagli"**
```
Click sulla tab "Dettagli" in alto
```

**3. Cerca e termina questi processi:**
```
✓ File Recovery Pro.exe
✓ file-recovery-pro.exe
✓ electron.exe
✓ node.exe
```

**4. Per ogni processo:**
```
- Click destro
- "Termina processo"
- Conferma "Termina processo"
```

**5. Verifica tutti terminati:**
```
- Ordina per nome (click su "Nome")
- Scorri e verifica nessun processo sopra
```

**6. Riprova installazione**

---

### METODO 3: Pulizia Profonda (Se metodi 1-2 falliscono)

#### A. Termina TUTTI i processi
```cmd
1. Apri Prompt dei comandi come Admin
   (Click destro Start → Prompt comandi (Admin))

2. Esegui questi comandi:

taskkill /F /IM "File Recovery Pro.exe"
taskkill /F /IM "file-recovery-pro.exe"
taskkill /F /IM electron.exe
taskkill /F /IM node.exe

3. Attendi 5 secondi
```

#### B. Rimuovi file di lock
```cmd
del /F /Q "%TEMP%\file-recovery-pro.lock"
del /F /Q "%LOCALAPPDATA%\file-recovery-pro\*.lock"
del /F /Q "%APPDATA%\file-recovery-pro\*.lock"
```

#### C. Pulisci cache
```cmd
rd /S /Q "%TEMP%\file-recovery-pro-updater"
rd /S /Q "%LOCALAPPDATA%\file-recovery-pro-updater"
rd /S /Q "%LOCALAPPDATA\Temp\file-recovery-pro"
```

#### D. Riavvia computer
```
Start → Riavvia
```

#### E. Riprova installazione dopo riavvio

---

## 🛠️ INSTALLAZIONE PULITA (Reset Completo)

Se **TUTTI** i metodi sopra falliscono:

### Step 1: Disinstalla completamente

```cmd
1. Pannello di controllo → Programmi → Disinstalla
2. Cerca "File Recovery Pro"
3. Disinstalla (se presente)
4. Aspetta completamento
```

### Step 2: Pulisci file residui

```cmd
1. Apri Esplora File
2. Vai a queste cartelle e ELIMINA se esistono:

   %LOCALAPPDATA%\file-recovery-pro
   %APPDATA%\file-recovery-pro
   C:\Program Files\File Recovery Pro
   C:\Program Files (x86)\File Recovery Pro

3. Svuota Cestino
```

### Step 3: Pulisci registro (OPZIONALE)

```
⚠️ ATTENZIONE: Solo se sei esperto!

1. Win + R → regedit
2. Cerca (Ctrl+F): "file-recovery-pro"
3. Elimina chiavi trovate (click destro → Elimina)
4. F3 per trovare prossima, ripeti
```

### Step 4: Script cleanup

```powershell
Esegui lo script PowerShell (Metodo 1 sopra)
```

### Step 5: Riavvia

```
Riavvia il computer
```

### Step 6: Reinstalla

```
1. Estrai nuovo ZIP
2. npm install
3. npm run build
4. Installa l'exe prodotto
```

---

## 🔍 DEBUG AVANZATO

### Verifica processi attivi

**PowerShell:**
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*file-recovery*" -or 
                             $_.ProcessName -like "*electron*" -or 
                             $_.ProcessName -like "*node*"} | 
              Format-Table Id, ProcessName, StartTime
```

**Output atteso se tutto OK:**
```
(Nessun risultato)
```

**Se vedi processi:**
```
Annota i PID (Process ID)
Usa taskkill /F /PID <numero>
```

### Verifica file di lock

**PowerShell:**
```powershell
Get-ChildItem -Path $env:TEMP, $env:LOCALAPPDATA, $env:APPDATA -Recurse -Filter "*file-recovery*.lock" -ErrorAction SilentlyContinue
```

**Se trovi lock files:**
```powershell
# Elimina
Remove-Item -Path "C:\path\to\lock\file" -Force
```

### Verifica porte in uso

**PowerShell:**
```powershell
netstat -ano | findstr "5173"
```

Se porta 5173 (Vite dev) occupata:
```cmd
# Trova PID
netstat -ano | findstr "5173"

# Killa processo
taskkill /F /PID <numero>
```

---

## 🎯 PREVENZIONE

### Durante sviluppo:

**1. Chiudi correttamente:**
```
- Usa sempre Ctrl+C nel terminal
- NON chiudere finestra terminal bruscamente
- Aspetta "Press any key to continue..."
```

**2. Stop script appropriato:**
```bash
# Invece di chiudere finestra:
npm run dev
# Poi Ctrl+C quando vuoi fermare
```

**3. Pulisci dopo crash:**
```bash
# Se crash durante dev:
npm run cleanup:win  # (Se aggiungi script)
```

### Prima del build:

```bash
# Sequenza pulita:
npm run cleanup:win  # Pulizia processi
npm run build        # Build pulito
```

---

## 📋 CHECKLIST RISOLUZIONE

Prima di dichiarare "non funziona":

- [ ] Eseguito cleanup script (BAT o PS1)
- [ ] Verificato Task Manager (nessun electron/node)
- [ ] Chiuso tutte le finestre terminal/cmd
- [ ] Eliminato file lock manualmente
- [ ] Pulito cache (TEMP, LOCALAPPDATA)
- [ ] Riavviato computer
- [ ] Disinstallato versione vecchia
- [ ] Eliminato cartelle residue
- [ ] Installato da zip fresco
- [ ] Eseguito come Administrator

**Se TUTTI ✓ e ancora problema:**
→ Problema diverso, vedi sotto

---

## 🆘 ALTRI PROBLEMI COMUNI

### Problema: "Access Denied" durante installazione

**Causa:** Mancano permessi Admin

**Soluzione:**
```
1. Click destro su installer.exe
2. "Esegui come amministratore"
3. Conferma UAC
```

### Problema: "File corrotto" o "Checksum failed"

**Causa:** Download ZIP incompleto

**Soluzione:**
```
1. Re-download ZIP
2. Verifica dimensione (deve essere ~95 KB)
3. Estrai di nuovo
4. Riprova
```

### Problema: Installazione completa ma app non si avvia

**Causa 1:** Antivirus blocca Electron

**Soluzione:**
```
1. Apri Antivirus
2. Aggiungi eccezione per:
   - File Recovery Pro.exe
   - Cartella C:\Program Files\File Recovery Pro
3. Riavvia app
```

**Causa 2:** File mancanti

**Soluzione:**
```
1. Vai a C:\Program Files\File Recovery Pro
2. Verifica presenza:
   - File Recovery Pro.exe
   - resources/
   - locales/
   - electron.asar
3. Se manca qualcosa → reinstalla
```

### Problema: Schermata bianca all'avvio

**Causa:** DevTools aperto in produzione

**Soluzione:**
```
Modifica electron/main.js:
// Rimuovi o commenta questa riga:
// win.webContents.openDevTools();
```

---

## 📞 SUPPORTO

Se **niente funziona**:

**1. Raccogli info:**
```powershell
# Esegui questo e copia output:
Get-Process | Where-Object {$_.ProcessName -like "*file*" -or 
                             $_.ProcessName -like "*electron*"}
Get-EventLog -LogName Application -Newest 10 -Source "File Recovery Pro" -ErrorAction SilentlyContinue
```

**2. Apri issue con:**
- Output comando sopra
- Screenshot errore
- File log: `%USERPROFILE%\.filerecoverypro\logs\app.log`
- Versione Windows
- Passi già provati

**3. Workaround temporaneo:**
```bash
# Usa in modalità development:
npm install
npm run dev
# Non ideale ma funziona mentre debuggiamo
```

---

## ✅ SOLUZIONE FUNZIONANTE?

Una volta risolto:

**Crea punto di ripristino:**
```
1. Start → "Crea punto ripristino"
2. "Crea..."
3. Nome: "Prima di FileRecoveryPro"
4. Crea
```

**Documenta cosa ha funzionato:**
```
Aiuta altri utenti! Commenta su GitHub issue
con la soluzione che ha funzionato per te.
```

---

## 🎓 PREVENZIONE FUTURA

### Build migliore:

Il problema deriva da Electron che non chiude pulito.

**TODO per developer:**
```javascript
// electron/main.js
app.on('before-quit', () => {
  // Force kill tutti i child process
  // Cleanup file lock
  // Release porte
});
```

Questa è già implementata nella v3.0.1, ma serve testare.

---

**FileRecoveryPro v3.0.1** - Installazione senza problemi! 🚀

Se hai ancora problemi dopo questa guida, è un caso molto particolare!
