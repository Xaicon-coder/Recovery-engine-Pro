'use strict';

/**
 * EXPORT UTILITY - Esporta risultati scansione in CSV/JSON
 * 
 * Funzionalità:
 * - Export CSV con tutti i dettagli file
 * - Export JSON strutturato
 * - Filtri per tipo file
 * - Statistiche aggregate
 */

const fs = require('fs');
const path = require('path');

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB';
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' MB';
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(2) + ' KB';
  return bytes + ' B';
}

/**
 * Esporta risultati in formato CSV
 */
function exportCSV(files, outputPath) {
  const headers = [
    'ID',
    'Nome',
    'Estensione',
    'Tipo',
    'Dimensione (bytes)',
    'Dimensione (leggibile)',
    'Sorgente',
    'Intatto',
    'Confidenza %',
    'Path Corrente',
    'Path Originale',
    'Directory Originale',
    'Data Modifica',
    'Data Creazione',
    'Data Eliminazione'
  ];

  let csv = headers.join(',') + '\n';

  for (const f of files) {
    const row = [
      f.id,
      `"${(f.name || '').replace(/"/g, '""')}"`,
      f.ext || '',
      f.type || '',
      f.size || 0,
      formatSize(f.size),
      f.source || '',
      f.intact ? 'Sì' : 'No',
      f.confidence || 0,
      `"${(f.path || '').replace(/"/g, '""')}"`,
      `"${(f.originalPath || '').replace(/"/g, '""')}"`,
      `"${(f.originalDir || '').replace(/"/g, '""')}"`,
      formatDate(f.modified),
      formatDate(f.created),
      formatDate(f.deletedAt)
    ];
    csv += row.join(',') + '\n';
  }

  fs.writeFileSync(outputPath, csv, 'utf8');
  return { ok: true, path: outputPath, count: files.length };
}

/**
 * Esporta risultati in formato JSON con statistiche
 */
function exportJSON(files, outputPath) {
  // Calcola statistiche
  const stats = {
    total: files.length,
    totalSize: files.reduce((sum, f) => sum + (f.size || 0), 0),
    byType: {},
    bySource: {},
    intactCount: 0,
    averageConfidence: 0
  };

  for (const f of files) {
    // Per tipo
    stats.byType[f.type] = (stats.byType[f.type] || 0) + 1;
    
    // Per sorgente
    stats.bySource[f.source] = (stats.bySource[f.source] || 0) + 1;
    
    // Intatti
    if (f.intact) stats.intactCount++;
    
    // Confidenza media
    stats.averageConfidence += f.confidence || 0;
  }

  stats.averageConfidence = stats.total > 0 
    ? Math.round(stats.averageConfidence / stats.total) 
    : 0;

  const data = {
    exportDate: new Date().toISOString(),
    version: '3.0',
    statistics: stats,
    files: files.map(f => ({
      id: f.id,
      name: f.name,
      ext: f.ext,
      type: f.type,
      size: f.size,
      sizeFormatted: formatSize(f.size),
      source: f.source,
      intact: f.intact,
      confidence: f.confidence,
      path: f.path,
      originalPath: f.originalPath,
      originalDir: f.originalDir,
      modified: f.modified,
      created: f.created,
      deletedAt: f.deletedAt
    }))
  };

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
  return { ok: true, path: outputPath, count: files.length, stats };
}

/**
 * Esporta solo statistiche aggregate
 */
function exportStats(files, outputPath) {
  const stats = {
    exportDate: new Date().toISOString(),
    total: files.length,
    totalSize: files.reduce((sum, f) => sum + (f.size || 0), 0),
    totalSizeFormatted: formatSize(files.reduce((sum, f) => sum + (f.size || 0), 0)),
    
    byType: {},
    bySource: {},
    byExtension: {},
    
    intactCount: 0,
    damagedCount: 0,
    
    averageConfidence: 0,
    highConfidence: 0,  // >= 90%
    mediumConfidence: 0, // 70-89%
    lowConfidence: 0,   // < 70%
    
    largestFile: null,
    oldestFile: null,
    newestFile: null
  };

  for (const f of files) {
    // Per tipo
    if (!stats.byType[f.type]) {
      stats.byType[f.type] = { count: 0, size: 0 };
    }
    stats.byType[f.type].count++;
    stats.byType[f.type].size += f.size || 0;
    
    // Per sorgente
    if (!stats.bySource[f.source]) {
      stats.bySource[f.source] = { count: 0, size: 0 };
    }
    stats.bySource[f.source].count++;
    stats.bySource[f.source].size += f.size || 0;
    
    // Per estensione
    const ext = f.ext || 'nessuna';
    if (!stats.byExtension[ext]) {
      stats.byExtension[ext] = { count: 0, size: 0 };
    }
    stats.byExtension[ext].count++;
    stats.byExtension[ext].size += f.size || 0;
    
    // Intatti vs danneggiati
    if (f.intact) stats.intactCount++;
    else stats.damagedCount++;
    
    // Confidenza
    const conf = f.confidence || 0;
    stats.averageConfidence += conf;
    if (conf >= 90) stats.highConfidence++;
    else if (conf >= 70) stats.mediumConfidence++;
    else stats.lowConfidence++;
    
    // File più grande
    if (!stats.largestFile || (f.size || 0) > (stats.largestFile.size || 0)) {
      stats.largestFile = { name: f.name, size: f.size, sizeFormatted: formatSize(f.size) };
    }
    
    // File più vecchio
    if (f.modified) {
      const date = new Date(f.modified);
      if (!stats.oldestFile || date < new Date(stats.oldestFile.modified)) {
        stats.oldestFile = { name: f.name, modified: f.modified };
      }
    }
    
    // File più recente
    if (f.modified) {
      const date = new Date(f.modified);
      if (!stats.newestFile || date > new Date(stats.newestFile.modified)) {
        stats.newestFile = { name: f.name, modified: f.modified };
      }
    }
  }

  stats.averageConfidence = stats.total > 0 
    ? Math.round(stats.averageConfidence / stats.total) 
    : 0;

  // Formatta dimensioni per tipo
  for (const type in stats.byType) {
    stats.byType[type].sizeFormatted = formatSize(stats.byType[type].size);
  }
  
  for (const source in stats.bySource) {
    stats.bySource[source].sizeFormatted = formatSize(stats.bySource[source].size);
  }
  
  for (const ext in stats.byExtension) {
    stats.byExtension[ext].sizeFormatted = formatSize(stats.byExtension[ext].size);
  }

  fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2), 'utf8');
  return { ok: true, path: outputPath, stats };
}

module.exports = {
  exportCSV,
  exportJSON,
  exportStats
};
