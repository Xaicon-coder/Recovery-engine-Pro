'use strict';

/**
 * LOGGER AVANZATO - Sistema di logging con livelli e rotazione
 * 
 * Livelli: DEBUG, INFO, WARN, ERROR
 * Features:
 * - Log su file con rotazione automatica
 * - Timestamp precisi
 * - Colori in console
 * - Filtri per livello
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const COLORS = {
  DEBUG: '\x1b[36m', // Cyan
  INFO: '\x1b[32m',  // Green
  WARN: '\x1b[33m',  // Yellow
  ERROR: '\x1b[31m', // Red
  RESET: '\x1b[0m'
};

class Logger {
  constructor(options = {}) {
    this.level = options.level || 'INFO';
    this.logToFile = options.logToFile !== false;
    this.logToConsole = options.logToConsole !== false;
    this.logDir = options.logDir || path.join(os.homedir(), '.filerecoverypro', 'logs');
    this.maxLogSize = options.maxLogSize || 10 * 1024 * 1024; // 10MB default
    this.maxLogFiles = options.maxLogFiles || 5;
    
    if (this.logToFile) {
      this._ensureLogDir();
      this._rotateLogsIfNeeded();
    }
  }

  _ensureLogDir() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (err) {
      console.error('Failed to create log directory:', err);
      this.logToFile = false;
    }
  }

  _getCurrentLogFile() {
    return path.join(this.logDir, 'app.log');
  }

  _rotateLogsIfNeeded() {
    try {
      const currentLog = this._getCurrentLogFile();
      if (!fs.existsSync(currentLog)) return;
      
      const stats = fs.statSync(currentLog);
      if (stats.size >= this.maxLogSize) {
        // Rotazione: app.log -> app.1.log -> app.2.log -> ... -> app.N.log
        for (let i = this.maxLogFiles - 1; i >= 1; i--) {
          const oldFile = path.join(this.logDir, `app.${i}.log`);
          const newFile = path.join(this.logDir, `app.${i + 1}.log`);
          if (fs.existsSync(oldFile)) {
            if (i === this.maxLogFiles - 1) {
              fs.unlinkSync(oldFile); // Elimina il più vecchio
            } else {
              fs.renameSync(oldFile, newFile);
            }
          }
        }
        fs.renameSync(currentLog, path.join(this.logDir, 'app.1.log'));
      }
    } catch (err) {
      console.error('Log rotation failed:', err);
    }
  }

  _shouldLog(level) {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  _formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ' ' + JSON.stringify(data) : '';
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  _log(level, message, data) {
    if (!this._shouldLog(level)) return;

    const formatted = this._formatMessage(level, message, data);

    // Console
    if (this.logToConsole) {
      const colored = `${COLORS[level]}${formatted}${COLORS.RESET}`;
      console.log(colored);
    }

    // File
    if (this.logToFile) {
      try {
        this._rotateLogsIfNeeded();
        fs.appendFileSync(this._getCurrentLogFile(), formatted + '\n', 'utf8');
      } catch (err) {
        console.error('Failed to write log:', err);
      }
    }
  }

  debug(message, data) {
    this._log('DEBUG', message, data);
  }

  info(message, data) {
    this._log('INFO', message, data);
  }

  warn(message, data) {
    this._log('WARN', message, data);
  }

  error(message, data) {
    this._log('ERROR', message, data);
  }

  // Metodi di utilità
  logScanStart(opts) {
    this.info('Scan started', {
      drive: opts.drive,
      mode: opts.mode,
      types: opts.types,
      isAdmin: opts.isAdmin
    });
  }

  logScanComplete(total, duration) {
    this.info('Scan completed', {
      totalFiles: total,
      durationMs: duration,
      durationSec: (duration / 1000).toFixed(2)
    });
  }

  logRecoveryStart(fileCount, dest) {
    this.info('Recovery started', {
      files: fileCount,
      destination: dest
    });
  }

  logRecoveryComplete(ok, fail) {
    this.info('Recovery completed', {
      success: ok,
      failed: fail,
      total: ok + fail
    });
  }

  logError(operation, error) {
    this.error(`${operation} failed`, {
      message: error.message,
      stack: error.stack
    });
  }

  // Cleanup logs vecchi (chiamare all'avvio)
  cleanupOldLogs(daysToKeep = 30) {
    try {
      const files = fs.readdirSync(this.logDir);
      const now = Date.now();
      const cutoff = daysToKeep * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (!file.endsWith('.log')) continue;
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > cutoff) {
          fs.unlinkSync(filePath);
          this.debug('Deleted old log file', { file });
        }
      }
    } catch (err) {
      this.warn('Failed to cleanup old logs', { error: err.message });
    }
  }
}

// Singleton instance
let loggerInstance = null;

function getLogger(options) {
  if (!loggerInstance) {
    loggerInstance = new Logger(options);
  }
  return loggerInstance;
}

module.exports = { Logger, getLogger };
