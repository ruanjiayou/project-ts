import * as  fs from 'fs';
import * as  path from 'path';
import * as  Sequelize from 'sequelize';
import { mysql } from '../configs/mysql';
import { loader } from '../libs/loader';

const MODE = process.env.NODE_ENV;
// TODO:日志模块
//const logger = libs.log;
const mysqlCfg = mysql[MODE];
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

const handler = (info) => {
  if (__filename !== info.fullpath) {
    let fn = require(info.fullpath).default;
    let model = fn(DB, Sequelize);
    model.getAttributes = function () {
      return Object.keys(this.attributes);
    }
    models[model.name] = model;
  }
}

loader(handler, {
  dir: __dirname,
  recusive: true
});
// 添加约束
for (let k in models) {
  if (typeof models[k] === 'function') {
    models[k].associate(models);
  }
};

models.sequelize = DB;
models.Op = DB.Op;

export default models;