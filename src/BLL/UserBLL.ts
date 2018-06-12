import * as libs from '../libs';
import * as _ from 'lodash';
import * as mime from 'mime';
import BaseBLL from './BaseBLL';
import { auth as authCfg } from '../configs/auth';
import { upload as uploadCfg } from '../configs/upload';

const tokenCfg: any = authCfg;
const { auth, thrower, validater, wxHelper, txCos, storer, uploader } = libs;

class UserBLL extends BaseBLL {
  constructor() {
    super();
    this.model = this.models.User;
    this.attributes = this.getAttributes();
  }
  /**
   * token验证: 小程序环境鉴权
   * @param req 请求对象
   */
  async auth(req) {
    const data = auth.decode(req);
    const where = { token: data.token };
    const user: any = await this.get({ where });
    if (_.isNil(user)) {
      thrower('auth', 'authFail');
    }
    return user;
  }
  /**
   * 微信code登录
   * @param body 请求body
   * @returns {string} openid的sha256...
   */
  async authIn(body) {
    const validation = new validater({
      rules: {
        code: 'required|string'
      }
    });
    const input = validation.validate(body);
    const wxInfo = await wxHelper.getWxOpenId(tokenCfg.wxAppId, tokenCfg.wxSecret, input.code);
    const where = { openid: wxInfo.openid };
    const user = await this.get({ where });
    if (_.isNil(user)) {
      thrower('auth', 'error');
    }
    const wxToken = wxHelper.generateToken(wxInfo.openid);
    await user.update({ token: wxToken });
    return wxToken;
  }
  /**
   * 微信注册
   * @param body 请求body
   */
  async authUp(body) {
    const validation = new validater({
      rules: {
        code: 'required|string',
        phone: 'nullable|string',
        name: 'nullable|string'
      }
    });
    const input = validation.validate(body);
    const wxInfo = await wxHelper.getWxOpenId(tokenCfg.wxAppId, tokenCfg.wxSecret, input.code);
    const where = { openid: wxInfo.openid };
    let user = await this.get({ where });
    if (_.isNil(user)) {
      const wxToken = wxHelper.generateToken(wxInfo.openid);
      input.token = wxToken;
      user = await this.model.create(input);
    } else {
      thrower('auth', 'exists');
    }
    return user;
  }
  /**
   * token验证: 账号密码环境鉴权
   * @param req 请求对象
   */
  async sign(req) {
    const data = auth.decode(req);
    const where = { token: data.token };
    const user = await this.get({ where });
    if (_.isNil(user)) {
      thrower('auth', 'authFail');
    }
    return user;
  }
  /**
   * 账号密码登录
   * @param body 请求body
   */
  async signIn(body) {
    const validation = new validater({
      rules: {
        phone: 'required|string',
        password: 'required|string'
      }
    });
    const input = validation.validate(body);
    const where = { phone: input.phone };
    const user = await this.get({ where });
    if (_.isNil(user)) {
      thrower('auth', 'accountError');
    }
    if (!user.comparePSW(input.password)) {
      thrower('auth', 'accountError');
    }
    const token = new Date().getTime();
    const authorization = auth.encode({
      role: 'user',
      id: user.id,
      token
    });
    await user.update({ token });
    return authorization;
  }
  // 账号密码注册
  /**
   * 账号密码注册
   * @param req 请求对象
   * @param opts 可选选项对象
   */
  async signUp(req, opts: any = {}) {
    const opt = this._init(opts);
    const validation = new validater({
      rules: {
        name: 'required|string',
        phone: 'required|string',
        password: 'required|string'
      },
      files: {
        avatar: 'nullable|file:png,jpg,jpeg,gif'
      }
    });
    const input = validation.validate(req.body);
    input.salt = new Date().getTime().toString();
    input.password = this.model.calculatePSW(input.password, input.salt);
    const where = { phone: input.phone };
    let user = await this.get({ where });
    if (!_.isNil(user)) {
      thrower('auth', 'existed');
    }
    await validation.validateFile(req.files, async (files) => {
      let avatar = files.avatar;
      if (avatar && avatar.length !== 0) {
        avatar = avatar[0];
        input.avatar = storer('image/avatar', avatar);
      }
    });
    user = await this.model.create(input, { transaction: opt.transaction });
    return user;
  }
  /**
   * 修改用户
   * @param req 请求对象
   * @param opts 可选选项对象
   */
  async update(req, opts: any = {}) {
    const opt = this._init(opts);
    const validation = new validater({
      rules: {
        id: 'required|int',
        name: 'nullable|string',
        phone: 'nullable|string'
      },
      files: {
        avatar: 'nullable|file:png,jpg,jpeg,gif'
      }
    });
    const input = validation.validate(req.body);
    await validation.validateFile(req.files, async (files) => {
      let avatar = files.avatar;
      if (avatar && avatar.length !== 0) {
        avatar = avatar[0];
        input.avatar = storer('image/avatar', avatar);
      }
    });
    const query = input.id;
    const user = await this.get({ query });
    await user.update(input, opt);
    return user;
  }
}

export default UserBLL;