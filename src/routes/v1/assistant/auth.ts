import libs from '../../../libs';
import models from '../../../models';
import configs from '../../../configs';
import * as Debug from 'debug';
import * as _ from 'lodash';

const Hinter = libs.hinter;
const authHelper = libs.auth;
const Validator = libs.validator;
const wxHelper = libs.wxHelper;
const sysCfg = configs.system;
const debug = Debug('APP:assistant-auth-route');

export = {
  /**
   * @api {post} /v1/auth/assistant/sign-in 登录
   * @apiName sign-in
   * @apiGroup AssistantAuth
   * 
   * @apiParam {string} code 登录微信code码
   * 
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   status: 'success',
   *   result: {
   *     type: 'jwt',
   *     token: ''
   *   }
   * } 
   */
  'post /v1/auth/assistant/sign-in': async (req, res, next) => {
    debug('enter post /v1/auth/assistant/sign-in route');
    const validator = new Validator({
      rules: {
        code: 'required|string'
      }
    });
    const input = validator.filter(req.body);
    try {
      validator.check(input);

      const wxInfo = await wxHelper.getWxOpenId(sysCfg.wxAppId, sysCfg.wxSecret, input.code);
      if (!wxInfo.openid) {
        throw new Error('获取openid失败!');
      }
      const token = wxHelper.generateToken(wxInfo.openid);
      const authToken = authHelper.encode({ refreshToken: '89757', token: token });
      await models.Assistant.update({ token: token }, { where: { openid: wxInfo.openid } });
      res.return(token);
    } catch (err) {
      next(err);
    }
  },
  /**
   * @api {post} /v1/auth/assistant/sign-up 注册
   * @apiName sign-up
   * @apiGroup AssistantAuth
   * 
   * @apiParam {string} code 微信登录code
   * @apiParam {string} name 姓名
   * @apiParam {string} phone 手机号
   * @apiParam {string} IDCard 身份证
   * 
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   status: 'success',
   *   result: {
   *     id: 1,
   *     name: '姓名',
   *     phone: '189',
   *     IDCard: '421224',
   *   }
   * } 
   */
  'post /v1/auth/assistant/sign-up': async (req, res, next) => {
    debug('enter post /v1/auth/assistant/sign-up');
    //TODO:code
    const validator = new Validator({
      rules: {
        name: 'required|string',
        phone: 'required|string|range[7,11]',
        IDCard: 'required|string'
      }
    });
    const t = await models.sequelize.transaction();
    const input = validator.filter(req.body);
    try {
      validator.check(input);
      const assistant = await models.Assistant.create(input, { transaction: t });
      await models.Apply.create({ type: 'assistant', applicantId: assistant.id });
      await t.commit();
      res.return(assistant);
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  'use /v1/assistant/*': async (req, res, next) => {
    debug('ENTER USE /v1/assistant/* ROUTE');
    let authToken = null;
    try {
      authToken = authHelper.decode(req);

      if (_.isEmpty(authToken)) {
        return next(new Hinter('common', 'unauthorized'));
      }
      let assistant = await models.Assistant.findOne({ where: { token: authToken.token } });
      if (assistant) {
        if (assistant.isApproved) {
          res.locals.assistantAuth = assistant;
        } else {
          throw new Hinter('auth', 'unapproved');
        }

      } else {
        throw new Hinter('common', 'unauthorized');
      }
      next();
    } catch (err) {
      next(err);
    }
  }
}