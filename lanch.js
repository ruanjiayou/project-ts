// 1.环境变量
process.env.port = process.env.port || '3000';
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
// 2.宕机处理
process.on('uncaughtException', (err) => {
  console.error(err, 'uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  console.error(reason, 'unhandledRejection');
});
// 3.启动服务器
const app = require('./dist/app');

app.listen(app.get('port'), () => {
  console.log(('  App is running at http://127.0.0.1:%d in >> %s << mode'), app.get('port'), app.get('env'));
});