import * as _ from 'lodash';
import models from '../../../models';
import libs from '../../../libs';
import AdminBLL from '../../../BLL/AdminBLL';

const debuger = libs.debugger('APP:admin-auth');
const admimBLL = new AdminBLL();
const { thrower } = libs;

module.exports = {
  /**
   * @api /v1/admin/sign-in
   * @apiGroup AdminAuth
   * @apiDescription 管理员通过账号密码登录
   *
   * @apiParam {string} phone 手机号
   * @apiParam {string} password 密码
   *
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   status: 'success',
   *   result: {
   *     token: '91476feb03dc81b213c81133d51afb592d7cb631c8f6414a538f13f6c371d1ef',
   *     freshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuaWQiOiJvVmJMUzVBcjFZckRhTVNRUDJvaWhxTUdPT2JNIiwiaWF0IjoxNTIxMTE5MjI1LCJleHAiOjE1MjE3MjQwMjV9.d9bzmcpRGqdxj7z51oVGkNb7EvP5wvXATN4MRhStdMA'
   *   }
   * }
   */
  'POST /v1/auth/admin/sign-in': async (req, res, next) => {
    debuger(`enter ${req.method} ${req.originalUrl} route`);
    try {
      const token = await admimBLL.signIn(req.body);
      res.return(token);
    } catch (err) {
      next(err);
    }
  },
  /**
   * @api /v1/admin/sign-in
   * @apiGroup AdminAuth
   * @apiDescription 管理员通过账号密码登录
   *
   * @apiParam {string} name 用户名
   * @apiParam {string} phone 手机号
   * @apiParam {string} password 密码
   *
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   status: 'success',
   *   result: {
   *     id: 1,
   *     phone: '18888888888',
   *     name: 'max',
   *   }
   * }
   */
  'POST /v1/auth/admin/sign-up': async (req, res, next) => {
    debuger(`enter ${req.method} ${req.originalUrl} route`);
    try {
      const admin = await admimBLL.signUp(req.body);
      res.return(admin);
    } catch (err) {
      next(err);
    }
  },
  /**
   * @api /v1/admin/oauth
   * @apiGroup AdminAuth
   * @apiDescription 第三方登录
   *
   * @apiParam {string} code 微信code码
   *
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   status: 'success',
   *   result: {
   *     token: '91476feb03dc81b213c81133d51afb592d7cb631c8f6414a538f13f6c371d1ef'
   *   }
   * }
   */
  'POST /v1/auth/admin/oauth': async (req, res, next) => {
    debuger(`enter ${req.method} ${req.originalUrl} route`);
  },
  'USE /v1/admin/*': async (req, res, next) => {
    debuger(`enter USE ${req.originalUrl} route`);
    // 查找AdminSession表
    const admin = await admimBLL.auth(req);
    if (_.isNil(admin)) {
      thrower('auth', 'notFound');
    }
    res.locals.adminSession = admin;
    next();
  }
};