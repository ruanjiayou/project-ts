import UserBLL from '../../../BLL/UserBLL';
import * as _ from 'lodash';
import * as Debug from 'debug';

const debug = Debug('APP:user-self');
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
  'PUT /v1/user/self': async (req, res, next) => {
    debug(`enter ${req.method} ${req.originalUrl} route`);
    try {
      const data = _.assign(req.body, req.files);
      const input = _.pick(req.body, ['name', 'avatar']);
      const user = await userBLL.update(input);
      return user;
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
   *     name: '汽车美容',
   *     phone: '18888888888'
   *   }
   * }
   */
  'GET /v1/user/self': async (req, res, next) => {
    debug(`enter ${req.method} ${req.originalUrl} route`);
    try {
      const user = res.locals.userAuth.get({ plain: true });
      res.return(_.omit(user, ['password', 'salt', 'authority', 'signature', 'openid']));
    } catch (err) {
      next(err);
    }
  },
}