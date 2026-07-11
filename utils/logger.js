const fs = require('fs');
const path = require('path');

class Logger {
  constructor(prefix = '[TEST]') {
    this.prefix = prefix;
    this.logDir = path.resolve(process.cwd(), 'logs');
    try {
      if (!fs.existsSync(this.logDir)) fs.mkdirSync(this.logDir, { recursive: true });
    } catch (e) {
      // ignore mkdir failures
    }
    this.logFile = path.join(this.logDir, 'latest.log');
  }

  timestamp() {
    return new Date().toISOString();
  }

  format(level, message) {
    return `${this.timestamp()} ${this.prefix} ${level.toUpperCase()}: ${message}`;
  }

  writeToFile(line) {
    try {
      fs.appendFileSync(this.logFile, line + '\n');
    } catch (e) {
      // ignore logging errors
    }
  }

  info(message) {
    const line = this.format('info', message);
    console.log(line);
    this.writeToFile(line);
  }

  warn(message) {
    const line = this.format('warn', message);
    console.warn(line);
    this.writeToFile(line);
  }

  error(message) {
    const line = this.format('error', message instanceof Error ? message.stack || message.message : message);
    console.error(line);
    this.writeToFile(line);
  }
}

module.exports = new Logger();
