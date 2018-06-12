import * as log4js from 'log4js';
import * as fs from 'fs';
import * as path from 'path';
import { log as logCfg } from '../configs';

// 配置日志
log4js.configure(logCfg);
const logger = (type) => {
  return log4js.getLogger(type);
}

export {
  logger
}