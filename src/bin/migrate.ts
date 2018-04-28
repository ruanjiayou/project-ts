/**
 * @author ruanjiayou
 * @description 刷新数据库
 * @time 2018-4-3 17:19:36
 */
const MODE = require('../node-env-mode').mode;
const argv = getArgv();
process.env.NODE_ENV = argv.mode || MODE;
const models = require('../models').default;

const alterDatabase = async () => {
  console.log('刷表前请确定已编译ts文件!');
  try {
    if (argv.force === true) {
      await models.sequelize.sync({ force: true });
      await models.Admin.seed();
    } else {
      await models.sequelize.sync();
    }
    console.log('数据库表已修改成功!');
    process.exit();
  } catch (err) {
    console.log(err, '创建出错!');
  }
}
/**
 * 获取命令行参数
 * -F/--force 删除表 -D/--dev 本地开发模式 -T/--test 测试环境开发模式 -P/--production 线上模式
 * @returns {object} { mode: 'dev/test/production', force: true/false }
 */
function getArgv() {
  const res: any = {};
  process.argv.splice(2).forEach(item => {
    if (item.charAt(0) === '-') {
      switch (item.charAt(1)) {
        case '-':
          switch (item) {
            case 'dev':
              res.mode = 'dev';
              break;
            case 'force':
              res.force = true;
              break;
            case 'test':
              res.mode = 'test';
              break;
            case 'production':
              res.mode = 'production';
              break;
            default: break;
          }
          res[item.substring(1)] = true;
          break;
        default:
          switch (item.substring(1)) {
            case 'D':
              res.mode = 'dev';
              break;
            case 'F':
              res.force = true;
              break;
            case 'T':
              res.mode = 'test';
              break;
            case 'P':
              res.mode = 'production';
              break;
            default: break;
          }
          break;
      }
    }
  });
  return res;
}
alterDatabase();