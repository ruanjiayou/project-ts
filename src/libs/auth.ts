/**
 * 登录验证(session/jwt_token等)
 */
/*
const cookieParser = require('cookie-parser');
const session = require('express-session');
const config = require('../config/database');
const MySQLStore = require('express-mysql-session')(session);

module.exports = function (app) {
    app.use(cookieParser(config.session.secret));
    app.use(session({
        key: config.session.key,//session_cookie_name 设置 cookie 中保存 session id 的字段名称
        secret: config.session.secret,//session_cookie_secret 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
        resave: true,// 强制更新 session
        saveUninitialized: true,// 设置为 false，强制创建一个 session，即使用户未登录
        cookie: {
            maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
        },
        store: new MySQLStore({
            host: config.host,
            port: config.port,
            user: config.username,
            password: config.password,
            database: config.database
        }),
    }));
};
*/

/**
 * redis connect
const redisClient = redis.createClient();
const RedisStore = require("connect-redis")(session);
configs.redis[MODE].client = redisClient;
app.use(session({
  store: new RedisStore(configs.redis[MODE]),
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(function (req, res, next) {
  if (!req.session) {
    return next(new Error("Cannot connect redis."));
  }
  next();
});
 */

// 2017-12-14 20:41:37 jwt验证
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { thrower } from './thrower';
import configs from '../configs';

const authConfig = configs.auth;
/**
 * 安全问题:
 * 1.XSS 攻击 src中盗取cookie: 设置cookie 为httponly 或 使用库过滤
 * 2.重放攻击 token被窃取: userId  jti一次性或2秒就过期
 * 3.中间人攻击 MITM: 如WiFi被黑 通信被监控 用https咯
 */
/**
 * 采用sha1 + salt
 */
function encrypt(str, salt) {
  const hmac = crypto.createHmac('sha1', salt);
  hmac.update(str);
  return hmac.digest('hex');
}
/**
 * jwt数据加密
 * @param {object} data 载荷 token/role/id
 */
function encode(data) {
  const token = jwt.sign(data, authConfig.secret, { expiresIn: authConfig.exp });
  return (token);
}
/**
 * @return object
 */
function decode(req) {
  let key = authConfig.key;
  let token = req.headers[key] || (req.body && req.body[key]) || (req.query && req.query[key]);
  if (token) {
    try {
      token = jwt.verify(token, authConfig.secret);
    } catch (err) {
      thrower('auth', 'tokenExpired');
    }
  } else {
    thrower('auth', 'tokenNotFound');
  }
  return token;
};
const auth = {
  encrypt,
  encode,
  decode
}
export { auth }