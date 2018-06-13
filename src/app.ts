
import { thrower, CustomError, logger, uploader, presenter, i18n } from "./libs";

const express = require('express');
const app = express();
const router = require('./router').router;
const cors = require('cors');
const ejs = require('ejs');
const path = require('path');
const redis = require('redis');
// const session = require('express-session');
const bodyParser = require('body-parser');
const compression = require('compression');
//const errorLogger = logger('error');

/**
 * Express configuration.
 */
// 设置模板目录
app.set('views', path.join(__dirname, 'views'));
// 设置模板的后缀类型为ejs
//Server.set('view engine', 'ejs');
//设置模板的后缀类型
app.set('view engine', 'html');
//设置render时自动添加的后缀
app.engine('.html', ejs.__express);
//只能设置分割符 新版本没有了
//ejs.delimiter = '$';
app.set("port", process.env.port);
app.use(express.static(path.join(__dirname, "../static")));
app.use(express.json({ limit: '5mb' }));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// i18n
app.use(i18n.init);
// 文件处理中间件
app.use(uploader);
// 自动清理文件...日
//app.use(multerAutoReap);
/**
 * redis connect
 */
// const redisClient = redis.createClient();
// const RedisStore = require("connect-redis")(session);
// configs.redis.client = redisClient;
// app.use(session({
//   store: new RedisStore(configs.redis),
//   secret: "keyboard cat",
//   resave: false,
//   saveUninitialized: false
// }));
// app.use(function (req, res, next) {
//   if (!req.session) {
//     return next(new Error("Cannot connect redis."));
//   }
//   next();
// });

// 5.添加自定义响应方法(自动处理json:status与result)
app.use(presenter({
  page: 'page',
  limit: 'limit',
  order: 'order',
  defaultLang: 'zh-cn',
  customDir: '../errors'
}));

/**
 * 所有业务API路由接口
 */
router(app);

// 7.error异常处理
app.use(function (err, req, res, next) {
  if (err instanceof CustomError) {
    // 自定义错误
    res.customError(err);
  } else if (err.validate) {
    // 验证错误
    res.validateError(err);
  } else if (err) {
    // 内部服务器错误
    err.module = 'common';
    err.type = 'unknown';
    res.customError(err);
  }
});

// 8.404
app.use(function (req, res, next) {
  if (!res.headersSent) {
    const err: any = new Error();
    err.module = 'common';
    err.type = 'notFound';
    err.message = req.originalUrl;
    res.customError(err);
  }
});

module.exports = app;