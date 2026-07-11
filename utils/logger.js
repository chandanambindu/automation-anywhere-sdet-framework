class Logger {
  constructor(prefix = '[TEST]') {
    this.prefix = prefix;
  }

  format(message) {
    return `${this.prefix} ${message}`;
  }

  info(message) {
    console.log(this.format(message));
  }

  warn(message) {
    console.warn(this.format(message));
  }

  error(message) {
    console.error(this.format(message));
  }
}

module.exports = new Logger();
