import AsyncStorage from '@react-native-async-storage/async-storage';
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

class Logger {
  private logs: LogEntry[] = [];
  private isInitialized = false;
  private isWeb = Platform.OS === 'web';

  async initialize(): Promise<void> {
    try {
      let stored: string | null = null;

      if (this.isWeb) {
        // Web: utiliser localStorage
        stored = localStorage.getItem(LOGS_KEY);
      } else {
        // Mobile: utiliser AsyncStorage
        stored = await AsyncStorage.getItem(LOGS_KEY);
      }

      if (stored) {
        this.logs = JSON.parse(stored);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Logger initialization error:', error);
    }
  }

  private async saveLogs(): Promise<void> {
    try {
      // Garder seulement les MAX_LOGS derniers logs
      const logsToSave = this.logs.slice(-MAX_LOGS);
      const logsJson = JSON.stringify(logsToSave);

      if (this.isWeb) {
        // Web: utiliser localStorage
        localStorage.setItem(LOGS_KEY, logsJson);
      } else {
        // Mobile: utiliser AsyncStorage
        await AsyncStorage.setItem(LOGS_KEY, logsJson);
      }
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
    if (this.isWeb) {
      localStorage.removeItem(LOGS_KEY);
    } else {
      await AsyncStorage.removeItem(LOGS_KEY);
    }
  }

  async exportLogs(): Promise<string> {
    return JSON.stringify(this.logs, null, 2);
  }

  async getLogsFilePath(): Promise<string> {
    if (this.isWeb) {
      return 'localStorage (browser)';
    }
    return `AsyncStorage:${LOGS_KEY}`;
  }

  async getLogsFileContent(): Promise<string> {
    return this.exportLogs();
  }

  async downloadLogs(): Promise<void> {
    try {
      if (this.isWeb) {
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
        await this.info('Logger', 'Logs téléchargés avec succès');
      } else {
        // Sur mobile: Les logs sont déjà stockés
        await this.info('Logger', `Logs stockés (${this.logs.length} entrées)`);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      await this.error('Logger', 'Error downloading logs', err);
    }
  }
}

export const logger = new Logger();

