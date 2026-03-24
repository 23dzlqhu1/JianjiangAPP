/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * 日志配置
 */
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageLogs: number;
}

/**
 * 日志条目
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  data?: any;
}

/**
 * 日志工具类
 */
export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private logs: LogEntry[] = [];

  private constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: __DEV__ ? LogLevel.DEBUG : LogLevel.INFO,
      enableConsole: true,
      enableStorage: false,
      maxStorageLogs: 1000,
      ...config,
    };
  }

  static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  /**
   * 记录调试日志
   */
  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * 记录信息日志
   */
  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * 记录警告日志
   */
  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * 记录错误日志
   */
  error(message: string, data?: any) {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * 内部日志记录方法
   */
  private log(level: LogLevel, message: string, data?: any) {
    if (level < this.config.minLevel) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      data,
    };

    // 添加到内存
    this.logs.push(entry);

    // 限制内存中的日志数量
    if (this.logs.length > this.config.maxStorageLogs) {
      this.logs.shift();
    }

    // 输出到控制台
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }
  }

  /**
   * 输出到控制台
   */
  private outputToConsole(entry: LogEntry) {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${LogLevel[entry.level]}]`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.data || '');
        break;
    }
  }

  /**
   * 获取所有日志
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * 获取特定级别的日志
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * 清空日志
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * 导出日志为字符串
   */
  exportLogs(): string {
    return this.logs
      .map(
        log =>
          `[${new Date(log.timestamp).toISOString()}] [${
            LogLevel[log.level]
          }] ${log.message} ${log.data ? JSON.stringify(log.data) : ''}`,
      )
      .join('\n');
  }

  /**
   * 设置配置
   */
  setConfig(config: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...config };
  }
}

/**
 * 快捷日志方法
 */
export const logger = Logger.getInstance();

/**
 * 性能日志装饰器
 */
export function logPerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const start = performance.now();
    logger.debug(`[${propertyKey}] 开始执行`);

    try {
      const result = await originalMethod.apply(this, args);
      const duration = performance.now() - start;
      logger.debug(`[${propertyKey}] 执行完成，耗时: ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`[${propertyKey}] 执行失败，耗时: ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  };

  return descriptor;
}

/**
 * 错误日志装饰器
 */
export function logError(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      logger.error(`[${propertyKey}] 发生错误`, error);
      throw error;
    }
  };

  return descriptor;
}
