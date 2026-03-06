import React, { useState } from 'react';

const IS_EL = typeof window !== 'undefined' && !!window?.api;

/**
 * EXPORT PANEL - Pannello per esportare risultati scansione
 * 
 * Supporta:
 * - Export CSV (compatibile Excel)
 * - Export JSON (con statistiche)
 * - Export solo statistiche
 */
export default function ExportPanel({ files, onClose }) {
  const [format, setFormat] = useState('csv');
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleExport = async () => {
    if (!IS_EL || !files || files.length === 0) return;

    setExporting(true);
    setResult(null);

    try {
      // Chiedi dove salvare
      const defaultName = `FileRecoveryPro_${new Date().toISOString().slice(0,10)}.${format}`;
      const outputPath = await window.api.export.pickFile(defaultName);
      
      if (!outputPath) {
        setExporting(false);
        return;
      }

      // Esegui export
      let res;
      if (format === 'csv') {
        res = await window.api.export.csv({ files, outputPath });
      } else if (format === 'json') {
        res = await window.api.export.json({ files, outputPath });
      } else if (format === 'stats') {
        res = await window.api.export.stats({ files, outputPath });
      }

      if (res.ok) {
        setResult({ success: true, path: res.path, count: res.count });
        // Notifica desktop
        await window.api.notification.show({
          title: 'Export Completato',
          body: `${res.count} file esportati in ${format.toUpperCase()}`
        });
      } else {
        setResult({ success: false, error: res.error });
      }
    } catch (err) {
      setResult({ success: false, error: err.message });
    } finally {
      setExporting(false);
    }
  };

  const handleOpenFile = () => {
    if (result?.path) {
      window.api.recover.open(result.path);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,10,4,.95)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn .2s ease'
    }}>
      <div style={{
        background: 'var(--bg0)',
        border: '1px solid var(--b1)',
        borderRadius: 8,
        padding: '24px',
        maxWidth: 480,
        width: '90%',
        boxShadow: '0 8px 32px rgba(0,255,65,.08)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          paddingBottom: 14,
          borderBottom: '1px solid var(--b0)'
        }}>
          <h2 style={{
            margin: 0,
            fontFamily: 'var(--display)',
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--p0)',
            letterSpacing: '.02em'
          }}>
            ESPORTA RISULTATI
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '4px 10px',
              border: '1px solid var(--b1)',
              borderRadius: 4,
              background: 'transparent',
              color: 'var(--t2)',
              cursor: 'pointer',
              fontFamily: 'var(--mono)',
              fontSize: 12
            }}
          >
            ✕
          </button>
        </div>

        {/* Info */}
        <div style={{
          padding: '10px 12px',
          background: 'rgba(0,255,65,.03)',
          border: '1px solid rgba(0,255,65,.12)',
          borderRadius: 4,
          marginBottom: 18
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t2)', marginBottom: 4 }}>
            FILE DA ESPORTARE
          </div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 700, color: 'var(--p0)' }}>
            {files.length.toLocaleString()}
          </div>
        </div>

        {/* Formato */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: 9,
            color: 'var(--t2)',
            letterSpacing: '.12em',
            marginBottom: 8
          }}>
            FORMATO
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { id: 'csv', label: 'CSV (Excel)', desc: 'Compatibile con Excel, Google Sheets' },
              { id: 'json', label: 'JSON', desc: 'Include statistiche dettagliate' },
              { id: 'stats', label: 'Solo Statistiche', desc: 'Report aggregato senza lista file' }
            ].map(f => (
              <label
                key={f.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  border: `1px solid ${format === f.id ? 'var(--p0)' : 'var(--b0)'}`,
                  borderRadius: 4,
                  background: format === f.id ? 'rgba(0,255,65,.04)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all .15s'
                }}
              >
                <input
                  type="radio"
                  name="format"
                  value={f.id}
                  checked={format === f.id}
                  onChange={e => setFormat(e.target.value)}
                  style={{ accentColor: 'var(--p0)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t0)', marginBottom: 2 }}>
                    {f.label}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--t2)' }}>
                    {f.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Risultato */}
        {result && (
          <div style={{
            padding: '10px 12px',
            background: result.success ? 'rgba(0,255,65,.06)' : 'rgba(255,34,68,.06)',
            border: `1px solid ${result.success ? 'var(--p0)' : 'var(--r0)'}`,
            borderRadius: 4,
            marginBottom: 18
          }}>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: 9,
              color: result.success ? 'var(--p0)' : 'var(--r0)',
              marginBottom: 4
            }}>
              {result.success ? '✓ EXPORT COMPLETATO' : '✗ ERRORE'}
            </div>
            {result.success ? (
              <>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t1)', marginBottom: 6 }}>
                  {result.count} file esportati
                </div>
                <button
                  onClick={handleOpenFile}
                  style={{
                    padding: '4px 10px',
                    border: '1px solid var(--p0)',
                    borderRadius: 3,
                    background: 'rgba(0,255,65,.08)',
                    color: 'var(--p0)',
                    cursor: 'pointer',
                    fontFamily: 'var(--mono)',
                    fontSize: 8
                  }}
                >
                  APRI FILE
                </button>
              </>
            ) : (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--r0)' }}>
                {result.error}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid var(--b1)',
              borderRadius: 4,
              background: 'transparent',
              color: 'var(--t1)',
              cursor: 'pointer',
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '.08em'
            }}
          >
            ANNULLA
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || !files.length}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid var(--p0)',
              borderRadius: 4,
              background: exporting ? 'var(--b0)' : 'rgba(0,255,65,.08)',
              color: exporting ? 'var(--t2)' : 'var(--p0)',
              cursor: exporting ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--mono)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '.08em'
            }}
          >
            {exporting ? 'ESPORTAZIONE...' : 'ESPORTA'}
          </button>
        </div>
      </div>
    </div>
  );
}
