<div align="center">

# 🌪️ FileRecoveryPro v3.0

![Version](https://img.shields.io/badge/version-3.0.0-00ff41?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-0078d7?style=for-the-badge&logo=windows)
![Tech](https://img.shields.io/badge/Tech-Electron%20%2B%20React-61dafb?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**Recuperatore desktop di livello professionale per file eliminati.**
*Sfrutta tecniche avanzate tramite Cestino, Shadow Copies (VSS) e USN Journal per il massimo tasso di successo.*

[Features](#-funzionalità-principali) • [Installazione](#-installazione--setup) • [Struttura](#-struttura-del-progetto) • [Requisiti](#-requisiti-di-sistema)

</div>

---

## 🎯 Funzionalità Principali

### 🔍 Scansione Multi-Livello Avanzata
* **$Recycle.Bin (Cestino):** Recupero file fisicamente intatti (Confidenza: 100%).
* **Volume Shadow Copies (VSS):** Snapshot di sistema e versioni precedenti (Confidenza: 95%).
* **Filesystem & Cartelle Utente:** Scansione ricorsiva profonda con filtri intelligenti.
* **USN Change Journal (NTFS):** Log delle eliminazioni per rintracciare riferimenti storici.

### ⚡ Performance Estreme (v3.0 Engine)
* **Zero Freeze:** Gestione fluida di **100.000+ file** mantenendo la UI a 60 FPS costanti.
* **Batching Intelligente:** Eventi IPC ridotti del 99% per un'esperienza reattiva.
* **Stop Istantaneo:** Interruzione della scansione immediata grazie allo *yield* ultra-frequente.

### 🛡️ Recupero Sicuro & Export
* **Integrità Garantita:** Verifica SHA-256 e preservazione dei timestamp originali.
* **Stream Copy:** Gestione super efficiente per il recupero di file di grandi dimensioni.
* **Export Professionale:** Esporta i risultati della scansione in formati `CSV` o `JSON`.
* **Interfaccia Real-Time:** Oscilloscopio live, pipeline delle fasi e statistiche aggiornate in tempo reale.

---


