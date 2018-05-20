import libs from '../libs';
import * as _ from 'lodash';
import * as mime from 'mime';
import BaseBLL from './BaseBLL';

const systemCfg = require('../configs/system');
const { auth, thrower, Validator, wxHelper, Cos } = libs;

class UserBLL extends BaseBLL {
  constructor() {
    super();
    this.model = this.models.User;
  }
  // 微信登录部分
  async auth(req) {
    const key = systemCfg.authKey;
    const authority = req.headers[key] || (req.body && req.body[key]) || (req.query && req.query[key]);
    if (_.isNil(authority)) {
      thrower('auth', 'tokenNotFound');
    }
    const user: any = await this.get({ authority: authority });
    if (_.isNil(user)) {
      thrower('auth', 'error');
    }
    return user;
  }
  /**
   * 微信code登录
   * @param data 数据
   * @returns {string} openid的sha256...
   */
  async authIn(data) {
    const validation = new Validator({
      rules: {
        code: 'required|string'
      }
    });
    const input = validation.validate(data);
    const wxInfo = await wxHelper.getWxOpenId(systemCfg.wxAppId, systemCfg.wxSecret, input.code);
    const user = await this.get({ openid: wxInfo.openid });
    if (_.isNil(user)) {
      thrower('auth', 'error');
    }
    const wxToken = wxHelper.generateToken(wxInfo.openid);
    await user.update({ authority: wxToken });
    return wxToken;
  }
  async authUp(data) {
    const validation = new Validator({
      rules: {
        code: 'required|string',
        phone: 'nullable|string',
        name: 'nullable|string'
      }
    });
    const input = validation.validate(data);
    const wxInfo = await wxHelper.getWxOpenId(systemCfg.wxAppId, systemCfg.wxSecret, input.code);
    let user = await this.get({ openid: wxInfo.openid });
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
    const key = systemCfg.signKey;
    const signatrue = req.headers[key] || (req.body && req.body[key]) || (req.query && req.query[key]);
    if (_.isNil(signatrue)) {
      thrower('auth', 'tokenNotFound');
    }
    const user = await this.get({ signatrue: signatrue })
    if (_.isNil(user)) {
      thrower('auth', 'error')
    }
    return user;
  }
  // 账号密码登录
  async signIn(data) {
    const validation = new Validator({
      rules: {
        phone: 'required|string',
        password: 'required|string'
      }
    });
    const input = validation.validate(data);
    const user = await this.get({ phone: input.phone });
    if (_.isNil(user)) {
      thrower('auth', 'error');
    }
    if (!user.comparePSW(input.password)) {
      thrower('auth', 'error');
    }
    const salt = new Date().getTime().toString();
    const password = user.calculatePSW(input.password, salt);
    await user.update({ password, salt });
    return password;
  }
  // 账号密码注册
  async signUp(data) {
    const validation = new Validator({
      rules: {
        name: 'required|string',
        phone: 'required|string',
        password: 'required|string'
      }
    });
    const input = validation.validate(data);
    let user = await this.get({ phone: input.phone });
    if (!_.isNil(user)) {
      thrower('auth', 'exists');
    }
    user = await this.model.create(input);
    return user;
  }
  async update(data, opts: any = {}) {
    const opt = {
      transaction: opts.t || null,
      where: opts.query || {}
    }
    const validation = new Validator({
      rules: {
        id: 'required|int',
        level: 'nullable|enum:normal,annual,permenent',
        name: 'nullable|string',
        phone: 'nullable|string'
      }
    });
    const input = validation.validate(data);
    const user = await this.get(input.id);
    await user.update(input, opt);
    return user;
  }
}

export default UserBLL;