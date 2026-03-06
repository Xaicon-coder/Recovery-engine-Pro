# 📦 INSTALLAZIONE - FileRecoveryPro v3.0

## 🚀 Quick Start

```bash
# 1. Estrai il progetto
unzip FileRecoveryPro_v3.0_GITHUB.zip
cd FileRecoveryPro_v3_FINAL

# 2. Installa dipendenze
npm install

# 3. Avvia in modalità development
npm run dev
```

**Fatto!** L'app si aprirà automaticamente.

---

## 📋 Prerequisiti

### Richiesti
- **Node.js** ≥ 16.0.0 ([Download](https://nodejs.org/))
- **npm** ≥ 7.0.0 (incluso con Node.js)

### Opzionali (per funzionalità complete)
- **Windows 10/11** - Per VSS e USN Journal
- **Privilegi Admin** - Per Volume Shadow Copies

### Verifica Installazione

```bash
# Controlla versioni
node --version   # Deve essere ≥ v16.0.0
npm --version    # Deve essere ≥ 7.0.0
```

Se mancanti, installa da [nodejs.org](https://nodejs.org/)

---

## 📥 Installazione Dettagliata

### Step 1: Download

**Da GitHub:**
```bash
git clone https://github.com/tuousername/FileRecoveryPro.git
cd FileRecoveryPro
```

**Da ZIP:**
```bash
unzip FileRecoveryPro_v3.0_GITHUB.zip
cd FileRecoveryPro_v3_FINAL
```

### Step 2: Installazione Dipendenze

```bash
npm install
```

**Output atteso:**
```
added 234 packages in 15s
```

**Se errori:**
```bash
# Pulisci cache npm
npm cache clean --force

# Riprova
rm -rf node_modules package-lock.json
npm install
```

### Step 3: Verifica Installazione

```bash
# Lista file principali
ls -la electron/
ls -la src/

# Verifica package.json
cat package.json
```

**Dovrebbe contenere:**
- electron: ^27.0.0
- react: ^18.0.0
- vite: ^5.0.0

---

## 🎮 Modalità di Esecuzione

### Development Mode

**Avvio:**
```bash
npm run dev
```

**Features:**
- Hot reload automatico
- DevTools aperte di default
- Logging verbose in console
- Nessuna compilazione necessaria

**Output:**
```
VITE v5.0.0 ready in 234 ms
➜  Local:   http://localhost:5173/
➜  Electron app starting...
```

### Build Production

**Compilazione:**
```bash
npm run build
```

**Output:**
```
dist/
├── index.html
├── assets/
│   ├── index-abc123.js
│   └── index-def456.css
└── electron/
```

**Esecuzione build:**
```bash
npm start
```

### Build Distribuzione

**Windows:**
```bash
npm run build:win
```

**Output:**
```
release/
└── FileRecoveryPro-Setup-3.0.0.exe
```

**Linux:**
```bash
npm run build:linux
```

**Output:**
```
release/
├── FileRecoveryPro-3.0.0.AppImage
└── FileRecoveryPro-3.0.0.deb
```

**macOS:**
```bash
npm run build:mac
```

**Output:**
```
release/
└── FileRecoveryPro-3.0.0.dmg
```

---

## 🔧 Configurazione

### Variabili Ambiente

Crea `.env` nella root:

```bash
# Development
NODE_ENV=development

# Production
NODE_ENV=production

# Custom port (dev)
PORT=5173

# Logging level
LOG_LEVEL=INFO
```

### Performance Tuning

Modifica `electron/recovery/index.js`:

```javascript
const PERF_CONFIG = {
  BATCH_SIZE: 100,           // Dimensione batch (50-200)
  BATCH_FLUSH_MS: 150,       // Intervallo flush (100-300ms)
  YIELD_EVERY: 30,           // Frequenza yield (20-50)
  PROGRESS_THROTTLE_MS: 150, // Throttle progress (100-300ms)
  MAX_BUFFER_SIZE: 50000,    // Limite memoria (10k-100k)
};
```

**Linee guida:**
- PC lento: Aumenta YIELD_EVERY a 20, riduci BATCH_SIZE a 50
- PC veloce: Riduci YIELD_EVERY a 50, aumenta BATCH_SIZE a 200
- RAM limitata: Riduci MAX_BUFFER_SIZE a 10000
- RAM abbondante: Aumenta MAX_BUFFER_SIZE a 100000

---

## 🐛 Troubleshooting

### Errore: "Cannot find module 'electron'"

```bash
# Reinstalla dipendenze
rm -rf node_modules
npm install
```

### Errore: "EACCES: permission denied"

**Linux/macOS:**
```bash
# Fix permissions npm global
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

**Windows:**
```powershell
# Esegui come Administrator
npm install --global windows-build-tools
```

### Errore: "Port 5173 already in use"

```bash
# Cambia porta
export PORT=5174
npm run dev
```

O modifica `vite.config.js`:
```javascript
export default {
  server: {
    port: 5174
  }
}
```

### App non si avvia

**Verifica log:**
```bash
# Windows
type %USERPROFILE%\.filerecoverypro\logs\app.log

# Linux/macOS
cat ~/.filerecoverypro/logs/app.log
```

**Verifica Electron:**
```bash
# Test Electron
npx electron --version

# Se manca, reinstalla
npm install electron@latest --save-dev
```

### Build fallisce

**Pulizia completa:**
```bash
# Rimuovi tutto
rm -rf node_modules dist build out release
rm package-lock.json

# Reinstalla
npm install

# Riprova build
npm run build
```

---

## 📁 Struttura Installazione

```
FileRecoveryPro_v3_FINAL/
├── electron/               # Backend Electron
│   ├── main.js            # Main process
│   ├── preload.js         # IPC bridge
│   ├── recovery/          # Engine scansione
│   ├── export.js          # Export features
│   └── logger.js          # Logging system
├── src/                   # Frontend React
│   ├── App.jsx           # Root component
│   ├── main.jsx          # Entry point
│   └── components/       # UI components
├── scripts/              # Build scripts
├── package.json          # Dependencies
├── vite.config.js        # Vite config
├── index.html            # HTML entry
├── README.md             # Documentazione
├── CHANGELOG.md          # Storia versioni
├── FEATURES.md           # Features list
└── .gitignore           # Git exclusions
```

---

## 🧪 Testing

### Test Manuale

1. **Avvia app**: `npm run dev`
2. **Seleziona drive**: C:
3. **Modalità**: Quick
4. **Avvia scansione**
5. **Verifica**:
   - ✅ Oscilloscopio animato
   - ✅ Progress fluido
   - ✅ File appaiono
   - ✅ STOP funziona
6. **Vai a Results**
7. **Test export**:
   - Click EXPORT
   - Scegli CSV
   - Salva file
   - Verifica contenuto

### Test Automatico

```bash
# Lint
npm run lint

# Test unitari (se implementati)
npm test
```

---

## 🔄 Aggiornamento

### Da v2.5 a v3.0

```bash
# Backup vecchia versione
cp -r FileRecoveryPro_v2.5 FileRecoveryPro_v2.5_backup

# Sostituisci con v3.0
rm -rf FileRecoveryPro_v2.5
unzip FileRecoveryPro_v3.0_GITHUB.zip
cd FileRecoveryPro_v3_FINAL

# Installa
npm install
npm run dev
```

**Dati utente preservati:**
- ✅ Log files (se esistenti)
- ✅ Configurazioni
- ❌ Node modules (reinstallare)
- ❌ Build cache (ricreare)

### Aggiornamenti Futuri

L'app controlla automaticamente aggiornamenti all'avvio.

**Manuale:**
```bash
# Check update disponibile
npm run check:update

# Download e installa
npm run update
```

---

## 🎓 Primo Utilizzo

### 1. Avvio Iniziale

```bash
npm run dev
```

**Prima volta:**
- Electron scarica binari (~100 MB)
- Vite compila frontend (~30s)
- App si apre automaticamente

### 2. Setup

1. **Permessi Admin** (Windows):
   - Right-click app → "Run as administrator"
   - Necessario per VSS e USN Journal

2. **Seleziona Drive**:
   - Dropdown mostra tutti i drive
   - C: è selezionato di default

3. **Scegli Modalità**:
   - **Quick**: Solo Cestino (~1 min)
   - **Standard**: + Cartelle utente (~5 min)
   - **Deep**: + Filesystem (~15 min)
   - **Full**: Tutto (~30 min, richiede admin)

4. **Filtri** (opzionale):
   - Seleziona tipi: image, video, document, etc.
   - Nessun filtro = tutti i tipi

### 3. Prima Scansione

1. Click **AVVIA SCANSIONE**
2. Osserva:
   - Oscilloscopio live
   - Pipeline fasi (5 step)
   - File che appaiono
   - Statistiche real-time
3. Test **STOP** (opzionale)
4. Attendi completamento
5. Notifica desktop appare
6. Vai a **Results** automaticamente

### 4. Primo Export

1. Results screen
2. Click **EXPORT**
3. Seleziona **CSV**
4. Salva su Desktop
5. Notifica conferma
6. Click **APRI FILE**
7. Vedi in Excel/Notepad

### 5. Primo Recupero

1. Seleziona 1-2 file
2. Scegli **SCEGLI…** come destinazione
3. Seleziona cartella Desktop
4. Click **RECUPERA**
5. Progress bar animata
6. Verifica SHA-256
7. Notifica completamento
8. Controlla Desktop

**Congratulazioni!** Hai completato il primo ciclo completo! 🎉

---

## 📞 Supporto

### Problemi Comuni

1. **App non si avvia**
   - Verifica Node.js ≥ 16
   - Reinstalla: `npm install`
   - Check log: `~/.filerecoverypro/logs/app.log`

2. **Scansione lenta**
   - Normale per Deep/Full mode
   - Riduci BATCH_SIZE se PC lento
   - Usa Quick mode per test

3. **Nessun file trovato**
   - Normale se Cestino vuoto
   - Prova Deep/Full mode
   - Verifica privilegi admin per VSS

### Contatti

- **GitHub Issues**: [link repository]
- **Email**: support@filerecoverypro.com
- **Documentazione**: Vedi README.md

---

## ✅ Checklist Post-Installazione

- [ ] Node.js ≥ 16 installato
- [ ] npm install completato senza errori
- [ ] npm run dev avvia app
- [ ] App si apre (finestra Electron)
- [ ] Lista drive visibile
- [ ] Scansione Quick funziona
- [ ] File appaiono nel feed
- [ ] STOP funziona
- [ ] Results screen si apre
- [ ] Export CSV funziona
- [ ] Recupero file funziona
- [ ] Notifiche desktop appaiono
- [ ] Log files creati in ~/.filerecoverypro/logs/

**Tutti check ✅? Perfetto, sei pronto!** 🚀

---

**FileRecoveryPro v3.0** - Installation complete! Buon recupero! 💾
