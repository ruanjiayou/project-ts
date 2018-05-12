import * as express from "express";
import * as compression from "compression";
import * as bodyParser from "body-parser";
import * as cors from "cors";
// import * as session from "express-session";
import * as redis from "redis";
import router from "./router";
import configs from "./configs";
import libs from "./libs";
import * as task from "./tasks/test";

const app = express();
const { hinter, logger, uploader, presenter } = libs;
const errorLogger = logger('error');
/**
 * Express configuration.
 */
app.set("port", process.env.port || 3000);
app.use(express.static("static"));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
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
 * API examples routes.
 */
router(app);

// 7.error异常处理
app.use(function (err, req, res, next) {
  if (err instanceof hinter) {
    // 自定义错误
    res.customError(err);
  } else if (err.validate) {
    // 验证错误
    res.validateError(err);
  }
  else if (err) {
    res.status(500).send({ status: 'false', message: `${err.message}` });
  } else {
    next();
  }
});
app.use((req, res, next) => {
  res.status(404);
  res.json({
    errorInfo: 'NOT FOUND'
  });
});
// 8.宕机
process.on('uncaughtException', (err) => {
  errorLogger.error(`uncaughtException ${err.toString()}`);
  console.error(err, 'uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  errorLogger.error(`unhandledRejection ${reason.toString()}`);
  console.error(reason, 'unhandledRejection');
});

app.listen(app.get('port'), () => {
  console.log(('  App is running at http://localhost:%d in >> %s << mode'), app.get('port'), app.get('env'));
});
