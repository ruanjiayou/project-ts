import * as  fs from 'fs';
import * as  path from 'path';
import * as  Sequelize from 'sequelize';
import configs from '../configs';
import libs from '../libs';

const MODE = process.env.NODE_ENV;
// TODO:日志模块
//const logger = libs.log;
const mysqlCfg = configs.mysql[MODE];
const models: any = {
  Op: null,
  sequelize: null
};

const DB = new Sequelize(
  mysqlCfg.database,
  mysqlCfg.username,
  mysqlCfg.password,
  {
    dialect: mysqlCfg.dialect,
    host: mysqlCfg.host,
    port: mysqlCfg.port,
    define: {
      // 默认驼峰命名 false 下划线蛇形 true
      underscored: false
    },
    // logging 为 false 则不显示
    //logging: logger,
    timezone: mysqlCfg.timezone,
    dialectOptions: {
      requestTimeout: 15000
    }
  }
);

fs.readdirSync(__dirname).forEach((file) => {
  let fullPath = path.join(__dirname, file);
  let ext = path.extname(file).toLocaleLowerCase();
  let filename = file.substr(0, file.length - ext.length);

  if (fullPath !== __filename && ext === '.js') {
    let fn = require(fullPath).default;
    let model = fn(DB, Sequelize);
    models[model.name] = model;
  }
});

for (let k in models) {
  if (typeof models[k] === 'function') {
    models[k].associate(models);
  }
};

models.sequelize = DB;
models.Op = DB.Op;

export default models;