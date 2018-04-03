/**
 * @author ruanjiayou
 * @description 刷新数据库
 * @time 2018-4-3 17:19:36
 */
const models = require('../dist/models').default;
console.log('刷表前请确定已编译ts文件!');

async function create() {
    await models.sequelize.sync({ force: true });
    // 因为有顺序要求
    await models.School.seed();
}
create().then(function () {
    console.log('数据库表已全部创建成功!');
    process.exit();
}).catch(function (err) {
    console.log(err.message);
});