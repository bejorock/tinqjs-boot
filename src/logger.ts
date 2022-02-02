export class Logger {
  private static logger_ = {
    info(message: any) {
      console.log(message);
    },

    debug(message: any) {
      console.log(message);
    },

    warn(message: any) {
      console.log(message);
    },

    error(message: any) {
      console.log(message);
    },
  };

  static get logger() {
    return this.logger_;
  }
  static setLogger(replacement: any) {
    this.logger_ = replacement;
  }
}

// export const logger =  Logger.logger;
