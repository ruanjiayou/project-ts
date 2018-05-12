import * as log4js from 'log4js';
import * as fs from 'fs';
import * as path from 'path';
import configs from '../configs';

const logCfg = configs.logger;
// 配置日志
log4js.configure(logCfg);
const logger = (type) => {
  return log4js.getLogger(type);
}

export {
  logger
}