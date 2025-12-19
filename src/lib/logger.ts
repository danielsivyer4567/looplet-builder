// Simple logging service for error tracking and telemetry
// Can be extended to integrate with external services like Sentry, LogRocket, etc.

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const defaultConfig: LoggerConfig = {
  minLevel: process.env.NODE_ENV === "production" ? "info" : "debug",
  enableConsole: true,
  enableRemote: !!process.env.LOG_ENDPOINT,
  remoteEndpoint: process.env.LOG_ENDPOINT,
};

class Logger {
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };

    // Flush logs periodically if remote logging is enabled
    if (this.config.enableRemote && typeof window === "undefined") {
      this.flushInterval = setInterval(() => this.flush(), 10000);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private formatEntry(entry: LogEntry): string {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    let message = `${prefix} ${entry.message}`;

    if (entry.context) {
      message += ` ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      message += `\n${entry.error.stack || entry.error.message}`;
    }

    return message;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    if (this.config.enableConsole) {
      const formatted = this.formatEntry(entry);
      switch (level) {
        case "debug":
          console.debug(formatted);
          break;
        case "info":
          console.info(formatted);
          break;
        case "warn":
          console.warn(formatted);
          break;
        case "error":
          console.error(formatted);
          break;
      }
    }

    if (this.config.enableRemote) {
      this.buffer.push(entry);
      if (this.buffer.length >= 10 || level === "error") {
        this.flush();
      }
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0 || !this.config.remoteEndpoint) return;

    const entries = [...this.buffer];
    this.buffer = [];

    try {
      await fetch(this.config.remoteEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs: entries }),
      });
    } catch (e) {
      // Re-add failed entries to buffer (with limit to prevent memory issues)
      if (this.buffer.length < 100) {
        this.buffer.unshift(...entries);
      }
      console.error("Failed to send logs to remote:", e);
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log("error", message, context, error);
  }

  // Track specific events for analytics
  track(event: string, properties?: Record<string, unknown>) {
    this.info(`[TRACK] ${event}`, properties);
  }

  // Measure performance
  time(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.debug(`[PERF] ${label}`, { durationMs: Math.round(duration) });
    };
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for custom instances
export { Logger };
export type { LoggerConfig, LogEntry, LogLevel };
