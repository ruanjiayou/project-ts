/**
 * @author ruanjiayou
 * @description 刷新数据库
 * @time 2018-4-3 17:19:36
 */
const MODE = require('../node-env-mode').mode;
process.env.NODE_ENV = MODE;

const models = require('../models').default;

const alterDatabase = async (isReset) => {
  console.log('刷表前请确定已编译ts文件!');
  try {
    if (isReset) {
      await models.sequelize.sync({ force: true });
      await models.School.seed();
    } else {
      await models.sequelize.sync();
    }
    console.log('数据库表已修改成功!');
    process.exit();
  } catch (err) {
    console.log(err, '创建出错!');
  }
}

alterDatabase(true);