import models from "../../../models";
import libs from '../../../libs';
import configs from '../../../configs';
import * as _ from 'lodash';
import * as Debug from 'debug';

const sysCfg = configs.system;
const Hinter = libs.hinter;
const Validator = libs.validator;
const authHelper = libs.auth;
const wxHelper = libs.wxHelper;
const debug = Debug('APP:admin-auth-route');
module.exports = {
  /**
   * @api {post} /v1/auth/admin/login 登录管理后台
   * @apiName create
   * @apiGroup AdminAuth
   *
   * @apiParam {String} code 微信用户code码
   *
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "status": "success",
   *   "result": {
   *     "token": "91476feb03dc81b213c81133d51afb592d7cb631c8f6414a538f13f6c371d1ef"
   *    }
   * }
   */
  'post /v1/auth/admin/sign-in': async (req, res, next) => {
    debug('enter post /v1/auth/admin/login route');
    const validator = new Validator({
      rules: {
        code: 'required|string'
      }
    });
    const input = validator.filter(req.body);
    try {
      validator.check(input);
    } catch (err) {
      return next(err);
    }
    try {
      const wxInfo = await wxHelper.getWxOpenId(sysCfg.wxAppId, sysCfg.wxSecret, input.code);
      if (!wxInfo.openid) {
        throw new Error('获取openid失败!');
      }
      const token = wxHelper.generateToken(wxInfo.openid);
      await models.Admin.update({ token: token }, { where: { openid: wxInfo.openid } });
      res.return({ token: token });
    } catch (err) {
      next(err);
    }
  },
  'use /v1/admin/*': async (req, res, next) => {
    debug('ENTER USE /v1/admin/* ROUTE');
    let authToken = null;
    try {
      authToken = authHelper.decode(req);
    } catch (err) {
      return next(err);
    }
    if (_.isEmpty(authToken)) {
      return next(new Hinter('common', 'unauthorized'));
    }
    let admin = await models.Admin.findOne({ where: { token: authToken.token } });
    if (admin) {
      res.locals.adminAuth = admin;
    } else {
      throw new Hinter('common', 'unauthorized');
    }
    next();
  },
}