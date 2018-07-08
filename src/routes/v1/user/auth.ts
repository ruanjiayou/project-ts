import { UserBLL } from '../../../BLL';

const _ = require('lodash');
const debug = require('debug')('APP:user-auth');
const userBLL = new UserBLL();

module.exports = {
  /**
   * @api {POST} /v1/auth/user/sign-in 用户账号密码登录
   * @apiGroup UserAuth
   * 
   * @apiParam {string} phone 手机号
   * @apiParam {string} password 密码(md5加密32位大写)
   * 
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   status: 'success',
   *   result: {
   *     id: 3,
   *     name: '汽车美容',
   *     phone: '18888888888',
   *     avatar: '/image/avatar/A11E2B9E-4F4C-4CA4-8AA4-195555BFE5F3.png'
   *   }
   * }
   */
  'POST /v1/auth/user/sign-in': async (req, res, next) => {
    debug(`enter ${req.method} ${req.originalUrl} route`);
    try {
      const token = await userBLL.signIn(req.body);
      res.return({ token });
    } catch (err) {
      next(err);
    }
  },
  /**
   * @api {POST} /v1/auth/user/sign-up 密码注册
   * @apiGroup UserAuth
   * 
   * @apiParam {string} name 名字
   * @apiParam {string} phone 手机号
   * @apiParam {string} password 密码(md5加密32位大写)
   * @apiParam {file='png','jpg','jpeg','gif'} [avatar] 头像
   * 
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   status: 'success',
   *   result: {
   *     id: 3,
   *     name: '汽车美容',
   *     phone: '18888888888',
   *     avatar: '/image/avatar/A11E2B9E-4F4C-4CA4-8AA4-195555BFE5F3.png'
   *   }
   * }
   */
  'POST /v1/auth/user/sign-up': async (req, res, next) => {
    debug(`enter ${req.method} ${req.originalUrl} route`);
    const data = _.assign(req.body, req.files);
    try {
      const user = await userBLL.signUp(data);
      res.return(_.omit(user.get({ plain: true }), ['password', 'salt', 'createdAt', 'updatedAt']));
    } catch (err) {
      next(err);
    }
  },
  'POST /v1/auth/user/auth-in': async (req, res, next) => {
    debug(`enter ${req.method} ${req.originalUrl} route`);
    try {
      const token = await userBLL.authIn(req.body);
      res.return({ token });
    } catch (err) {
      next(err);
    }
  },
  'POST /v1/auth/user/auth-up': async (req, res, next) => {
    debug(`enter ${req.method} ${req.originalUrl} route`);
    try {
      const resp = await userBLL.authUp(req.body);
      res.return(resp);
    } catch (err) {
      next(err);
    }
  }
}