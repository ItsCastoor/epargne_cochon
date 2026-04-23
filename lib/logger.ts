import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  error?: string;
  stack?: string;
  context?: Record<string, unknown>;
}

const MAX_LOGS = 1000;
const LOGS_KEY = '@app/logs';
const LOGS_DIR = `${FileSystem.DocumentDirectoryPath}/epargne_logs`;
const LOGS_FILE = `${LOGS_DIR}/logs.json`;
const LOGS_ARCHIVE_DIR = `${LOGS_DIR}/archive`;

class Logger {
  private logs: LogEntry[] = [];
  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
      // Créer les répertoires nécessaires
      const dirInfo = await FileSystem.getInfoAsync(LOGS_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(LOGS_DIR, { intermediates: true });
        await FileSystem.makeDirectoryAsync(LOGS_ARCHIVE_DIR, { intermediates: true });
      }

      // Charger les logs du fichier
      const fileInfo = await FileSystem.getInfoAsync(LOGS_FILE);
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(LOGS_FILE);
        this.logs = JSON.parse(content);
      } else {
        // Essayer de charger depuis AsyncStorage (migration)
        const stored = await AsyncStorage.getItem(LOGS_KEY);
        if (stored) {
          this.logs = JSON.parse(stored);
          await this.saveLogs();
        }
      }

      this.isInitialized = true;
      console.log(`[Logger] Initialisé - Fichier: ${LOGS_FILE}`);
    } catch (error) {
      console.error('Logger initialization error:', error);
    }
  }

  private async saveLogs(): Promise<void> {
    try {
      // Garder seulement les MAX_LOGS derniers logs
      const logsToSave = this.logs.slice(-MAX_LOGS);

      // Sauvegarder dans le fichier
      await FileSystem.writeAsStringAsync(LOGS_FILE, JSON.stringify(logsToSave, null, 2));

      // Aussi sauvegarder en backup dans AsyncStorage (pour sécurité)
      await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logsToSave));
    } catch (error) {
      console.error('Error saving logs:', error);
    }
  }

  private createEntry(level: LogLevel, module: string, message: string, context?: Record<string, unknown>, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      error: error?.message,
      stack: error?.stack,
      context,
    };
  }

  async log(level: LogLevel, module: string, message: string, context?: Record<string, unknown>, error?: Error): Promise<void> {
    const entry = this.createEntry(level, module, message, context, error);
    this.logs.push(entry);

    // Log en console selon le niveau
    const consoleMethod = level === LogLevel.ERROR ? console.error : level === LogLevel.WARN ? console.warn : console.log;
    consoleMethod(`[${module}] ${message}`, context || '');

    if (this.isInitialized) {
      await this.saveLogs();
    }
  }

  async debug(module: string, message: string, context?: Record<string, unknown>): Promise<void> {
    await this.log(LogLevel.DEBUG, module, message, context);
  }

  async info(module: string, message: string, context?: Record<string, unknown>): Promise<void> {
    await this.log(LogLevel.INFO, module, message, context);
  }

  async warn(module: string, message: string, context?: Record<string, unknown>): Promise<void> {
    await this.log(LogLevel.WARN, module, message, context);
  }

  async error(module: string, message: string, error?: Error, context?: Record<string, unknown>): Promise<void> {
    await this.log(LogLevel.ERROR, module, message, context, error);
  }

  async getLogs(): Promise<LogEntry[]> {
    return this.logs;
  }

  async getLogsByModule(module: string): Promise<LogEntry[]> {
    return this.logs.filter((log) => log.module === module);
  }

  async getLogsByLevel(level: LogLevel): Promise<LogEntry[]> {
    return this.logs.filter((log) => log.level === level);
  }

  async getLogsAsText(): Promise<string> {
    return this.logs
      .map((log) => {
        const context = log.context ? ` | ${JSON.stringify(log.context)}` : '';
        const error = log.error ? ` | Error: ${log.error}` : '';
        return `[${log.timestamp}] [${log.level}] [${log.module}] ${log.message}${context}${error}`;
      })
      .join('\n');
  }

  async clearLogs(): Promise<void> {
    this.logs = [];
    await AsyncStorage.removeItem(LOGS_KEY);
    if (this.isInitialized) {
      await FileSystem.deleteAsync(LOGS_FILE, { idempotent: true });
    }
  }

  async exportLogs(): Promise<string> {
    return JSON.stringify(this.logs, null, 2);
  }

  async archiveLogs(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archiveFile = `${LOGS_ARCHIVE_DIR}/logs-${timestamp}.json`;
      const content = JSON.stringify(this.logs, null, 2);
      await FileSystem.writeAsStringAsync(archiveFile, content);
      await this.clearLogs();
      return archiveFile;
    } catch (error) {
      throw new Error(`Error archiving logs: ${error}`);
    }
  }

  async getLogsFilePath(): Promise<string> {
    return LOGS_FILE;
  }

  async getLogsFileContent(): Promise<string> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(LOGS_FILE);
      if (fileInfo.exists) {
        return await FileSystem.readAsStringAsync(LOGS_FILE);
      }
      return JSON.stringify([]);
    } catch (error) {
      throw new Error(`Error reading logs file: ${error}`);
    }
  }

  async downloadLogs(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Sur web: Créer un Blob et télécharger
        const content = JSON.stringify(this.logs, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Sur mobile: Archiver les logs
        const archivePath = await this.archiveLogs();
        console.log(`📁 Logs archivés: ${archivePath}`);
      }
    } catch (error) {
      throw new Error(`Error downloading logs: ${error}`);
    }
  }
}

export const logger = new Logger();

