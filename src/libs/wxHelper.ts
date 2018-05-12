import * as crypto from 'crypto';
import * as rp from 'request-promise';
import * as _ from 'lodash';
import * as moment from 'moment';

/**
 * 获取请求微信服务器API的token
 * @param {object} wxCfg 配置对象(appid,secret,access_token,updatedAt)
 * @returns token
 */
const getAccessToken = async (wxCfg) => {
  const now = new Date().getTime();
  const updatedAt = wxCfg.updatedAt;
  if (wxCfg.access_token) {
    if (now - updatedAt < 7000000) {
      return wxCfg.access_token;
    }
  }
  const tokenRaw = await rp({
    url: 'https://api.weixin.qq.com/cgi-bin/token',
    qs: {
      grant_type: 'client_credential',
      appid: wxCfg.wxAppId,
      secret: wxCfg.wxSecret
    },
    method: 'GET'
  });
  wxCfg.updatedAt = updatedAt;
  wxCfg.access_token = JSON.parse(tokenRaw).access_token
  return wxCfg.access_token;
}
/**
 * 获取账号下模板消息列表
 * @param {object} wxCfg 微信配置信息
 * @param {number} page 页码
 * 
 */
const getNotifyTpl = async (wxCfg, page: number = 1, offset: number = 20) => {
  const access_token = getAccessToken(wxCfg);
  const notifies = await rp({
    url: 'https://api.weixin.qq.com/cgi-bin/wxopen/template/list',
    qs: {
      access_token: access_token,
      offset: page,
      count: offset
    },
    method: 'POST'
  });
  return notifies;
}
/**
 * 发送模板消息
 * @param {string} touser 用户openid
 * @param {string} tplId 模板id
 * @param {string} formId formId
 * @param {object} data 数据
 */
const sendTplNotify = async (models, wxCfg, data) => {
  // 0.access_token
  const access_token = await getAccessToken(wxCfg);
  const tplData: any = {
    touser: data.openid,
    template_id: data.tplId
  };
  let type = data.type;
  // 1.formId
  const notify = await models.Notify.findOne({ where: { type: type, openid: data.openid, createdAt: { gt: moment().subtract(7, 'd').toDate() } } });
  if (_.isNil(notify)) {
    return;
  } else {
    tplData.form_id = notify.formId;
  }
  // 2.keywords
  const keywords: any = {};
  data.data.forEach((item, index) => {
    keywords[`keyword${index + 1}`] = { value: item, color: '#005397' };
  });
  tplData.data = keywords;
  // 3.发送请求
  const res = await rp({
    url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send',
    qs: {
      access_token: access_token
    },
    body: tplData,
    json: true,
    method: 'POST'
  });
  // 4.删除formId
  await notify.destroy();
  if (res.errmsg !== 'ok') {
    console.log(res, 'template notify send fail!');
  }
  return res;
}
/**
 * 微信信息生成token,用于登录
 */
const generateToken = (seed) => {
  const hash = crypto.createHash('sha256');
  try {
    hash.update(seed);
  } catch (err) {
    console.log(err, '生成token错误');
  }
  return hash.digest('hex');
}
/**
 * 获取用户openid
 * @param {string} appid 小程序应用id
 * @param {string} secret 小程序密匙
 * @param {string} code 用户code码
 */
const getWxOpenId = async (appid, secret, code) => {
  let wxInfo = await rp({
    uri: `https://api.weixin.qq.com/sns/jscode2session?`,
    qs: {
      appid: appid,
      secret: secret,
      js_code: code,
      grant_type: 'authorization_code'
    },
    method: 'GET',
    json: true
  });
  if (typeof wxInfo.openid !== 'string') {
    throw new Error('获取openid失败!');
  }
  return wxInfo;
}

class WXBizDataCrypt {
  private appId: string;
  private sessionKey: string;
  constructor(appId: string, sessionKey: string) {
    this.appId = appId;
    this.sessionKey = sessionKey;
  }
  public decryptData(encryptedData: any, iv: any) {
    // base64 decode
    const sessionKeyBuf = new Buffer(this.sessionKey, "base64");
    const encryptedDataBuf = new Buffer(encryptedData, "base64");
    const ivBuf = new Buffer(iv, "base64");
    let decoded: any;
    try {
      // 解密
      const decipher = crypto.createDecipheriv("aes-128-cbc", sessionKeyBuf, ivBuf);
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(true);
      decoded = decipher.update(encryptedDataBuf, "binary", "utf8");
      decoded += decipher.final("utf8");
      decoded = JSON.parse(decoded);
      if (decoded.watermark.appid !== this.appId) {
        throw new Error("Illegal Buffer");
      }
      return decoded;
    } catch (err) {
      console.error(err);
      decoded = null;
    }
  }
}
const wxHelper = {
  getAccessToken,
  generateToken,
  getWxOpenId,
  WXBizDataCrypt,
  getNotifyTpl,
  sendTplNotify
}
export default {
  wxHelper
}