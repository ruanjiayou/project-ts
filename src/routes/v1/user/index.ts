import { UserBLL } from '../../../BLL';

const _ = require('lodash');
const debug = require('debug')('APP:user-self');
const userBLL = new UserBLL();

module.exports = {
  'USE /v1/user/*': async (req, res, next) => {
    debug(`enter  ${req.method} ${req.originalUrl} use`);
    try {
      const user = await userBLL.sign(req);
      res.locals.userAuth = user;
      next();
    } catch (err) {
      next(err);
    }
  },
  /**
   * @api {PUT} /v1/user/self 修改个人资料
   * @apiGroup UserSelf
   * 
   * @apiParam {string} [name] 姓名
   * @apiParam {file='jpg','png','jpeg','gif'} [avatar] 头像
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
  'PUT /v1/user/self': async (req, res, next) => {
    debug(`enter ${req.method} ${req.originalUrl} route`);
    try {
      req.body.id = res.locals.userAuth.id;
      const user = await userBLL.update(req);
      res.return(_.omit(user, ['password', 'salt', 'token', 'refresh_token', 'openid', 'createdAt', 'updatedAt']));
    } catch (err) {
      next(err);
    }
  },
  /**
   * @api {PUT} /v1/user/password 修改密码
   * @apiGroup UserSelf
   * 
   * @apiParam {string} password 密码
   * 
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   status: 'success'
   * }
   */
  'PUT /v1/user/password': async (req, res, next) => {
    debug(`enter ${req.method} ${req.originalUrl} route`);
    try {
      req.body.id = res.locals.userAuth.id;
      const status = await userBLL.changePassword(req.body);
      if (status) {
        res.success();
      } else {
        res.fail();
      }
    } catch (err) {
      next(err);
    }
  },
  /**
   * @api {GET} /v1/user/self 获取个人资料
   * @apiGroup UserSelf
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
  'GET /v1/user/self': async (req, res, next) => {
    debug(`enter ${req.method} ${req.originalUrl} route`);
    try {
      const user = res.locals.userAuth.get({ plain: true });
      res.return(_.omit(user, ['password', 'salt', 'token', 'refresh_token', 'openid', 'createdAt', 'updatedAt']));
    } catch (err) {
      next(err);
    }
  },
}