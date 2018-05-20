import UserBLL from '../../../BLL/UserBLL';
import * as Debug from 'debug';

const debug = Debug('APP:admin-auth');
const userBLL = new UserBLL();

module.exports = {
  /**
   * @api {POST} /v1/auth/user/sign-in 用户账号密码登录
   * @apiGroup UserAuth
   */
  'POST /v1/auth/user/sign-in': async (req, res, next) => { },
  'POST /v1/auth/user/sign-up': async (req, res, next) => { },
  'POST /v1/auth/user/oauth-in': async (req, res, next) => { },
  'POST /v1/auth/user/oauth-up': async (req, res, next) => { },
  'POST /v1/user/*': async (req, res, next) => { }
}