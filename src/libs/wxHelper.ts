import * as crypto from 'crypto';
import * as rp from 'request-promise';

/**
 * 获取请求微信服务器API的token
 * @param {object} wxCfg 配置对象(appid,secret,access_token,updatedAt)
 * @returns token
 */
const getAccessToken = async (wxCfg) => {
  const now = new Date().getTime();
  const updatedAt = wxCfg.updatedAt.getTime();
  if (wxCfg.access_token) {
    if (now - updatedAt < 7000000) {
      return wxCfg.access_token;
    }
  }
  const tokenRaw = await rp({
    url: 'https://api.weixin.qq.com/cgi-bin/token',
    qs: {
      grant_type: 'client_credential',
      appid: wxCfg.appid,
      secret: wxCfg.secret
    },
    method: 'GET'
  });
  wxCfg.updatedAt = updatedAt;
  wxCfg.access_token = JSON.parse(tokenRaw).access_token
  return wxCfg.access_token;
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

export default {
  getAccessToken,
  generateToken,
  getWxOpenId,
  WXBizDataCrypt
}