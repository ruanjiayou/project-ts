import UserBLL from '../../../BLL/UserBLL';
import * as _ from 'lodash';
import * as Debug from 'debug';

const debug = Debug('APP:user-auth');
const userBLL = new UserBLL();

module.exports = {
  /**
   * @api {POST} /v1/auth/user/sign-in 用户账号密码登录
   * @apiGroup UserAuth
   */
  'POST /v1/auth/user/sign-in': async (req, res, next) => {
    debug(`enter ${req.method} ${req.originalUrl} route`);
    try {
      const signature = await userBLL.signIn(req.body);
      res.return({ signature });
    } catch (err) {
      next(err);
    }
  },
  'POST /v1/auth/user/sign-up': async (req, res, next) => {
    debug(`enter ${req.method} ${req.originalUrl} route`);
    const data = _.assign(req.body, req.files);
    try {
      const user = await userBLL.signUp(req);
      res.return(_.omit(user.get({ plain: true }), ['password', 'salt', 'createdAt', 'updatedAt']));
    } catch (err) {
      next(err);
    }
  },
  'POST /v1/auth/user/oauth-in': async (req, res, next) => { },
  'POST /v1/auth/user/oauth-up': async (req, res, next) => { }
}