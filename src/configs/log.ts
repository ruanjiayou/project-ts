const logger = {
  appenders: {
    console: {
      type: 'console'
    },
    error: {
      type: 'file',
      filename: './.log/error.log',
      level: 'DEBUG',
    },
    access: {
      type: 'DateFile',
      filename: './.log/access',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true
    }
  },
  categories: {
    default: {
      appenders: ['error', 'access'],
      level: 'info'
    }
  }
}
export = {
  logger
}