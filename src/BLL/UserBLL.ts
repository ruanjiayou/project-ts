import libs from '../libs';
import * as _ from 'lodash';
import * as mime from 'mime';
import BaseBLL from './BaseBLL';
import { auth as authCfg } from '../configs/auth';
import { upload as uploadCfg } from '../configs/upload';

const tokenCfg: any = authCfg;
const { auth, thrower, Validater, wxHelper, Cos, storer, uploader } = libs;

class UserBLL extends BaseBLL {
  constructor() {
    super();
    this.model = this.models.User;
  }
  // 微信登录部分
  async auth(req) {
    const key = tokenCfg.authKey;
    const authority = req.headers[key] || (req.body && req.body[key]) || (req.query && req.query[key]);
    if (_.isNil(authority)) {
      thrower('auth', 'tokenNotFound');
    }
    const query = { authority: authority };
    const user: any = await this.get({ query });
    if (_.isNil(user)) {
      thrower('auth', 'authFail');
    }
    return user;
  }
  /**
   * 微信code登录
   * @param data 数据
   * @returns {string} openid的sha256...
   */
  async authIn(data) {
    const validation = new Validater({
      rules: {
        code: 'required|string'
      }
    });
    const input = validation.validate(data);
    const wxInfo = await wxHelper.getWxOpenId(tokenCfg.wxAppId, tokenCfg.wxSecret, input.code);
    const query = { openid: wxInfo.openid };
    const user = await this.get({ query });
    if (_.isNil(user)) {
      thrower('auth', 'error');
    }
    const wxToken = wxHelper.generateToken(wxInfo.openid);
    await user.update({ authority: wxToken });
    return wxToken;
  }
  async authUp(data) {
    const validation = new Validater({
      rules: {
        code: 'required|string',
        phone: 'nullable|string',
        name: 'nullable|string'
      }
    });
    const input = validation.validate(data);
    const wxInfo = await wxHelper.getWxOpenId(tokenCfg.wxAppId, tokenCfg.wxSecret, input.code);
    const query = { openid: wxInfo.openid };
    let user = await this.get({ query });
    if (_.isNil(user)) {
      const wxToken = wxHelper.generateToken(wxInfo.openid);
      input.authority = wxToken;
      user = await this.model.create(input);
    } else {
      thrower('auth', 'exists');
    }
    return user;
  }
  // 密码登录部分
  // 验证
  async sign(req) {
    const key = tokenCfg.signKey;
    const signature = req.headers[key] || (req.body && req.body[key]) || (req.query && req.query[key]);
    if (_.isNil(signature)) {
      thrower('auth', 'tokenNotFound');
    }
    const query = { where: { signature: signature } };
    const user = await this.get({ query })
    if (_.isNil(user)) {
      thrower('auth', 'authFail')
    }
    return user;
  }
  // 账号密码登录
  async signIn(data) {
    const validation = new Validater({
      rules: {
        phone: 'required|string',
        password: 'required|string'
      }
    });
    const input = validation.validate(data);
    const query = { phone: input.phone };
    const user = await this.get({ query });
    if (_.isNil(user)) {
      thrower('auth', 'accountError');
    }
    if (!user.comparePSW(input.password)) {
      thrower('auth', 'accountError');
    }
    return user.signature;
  }
  // 账号密码注册
  async signUp(req, opts: any = {}) {
    const opt = this._init(opts);
    const validation = new Validater({
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
    const query = { where: { phone: input.phone } }
    let user = await this.get({ query });
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
  async update(req, opts: any = {}) {
    const opt = {
      transaction: opts.t || null,
      where: opts.query || {}
    }
    const validation = new Validater({
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