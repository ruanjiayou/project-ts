
import configs from '../configs/';
import * as crypto from 'crypto';
import models from '../models';
import * as rp from 'request-promise';

class WxTools {
  constructor() { }

  public async getAccessToken(): Promise<string> {
    const OVERDUE_LIMIT: number = 7000; // 官方约定有效期为7200s
    let currentConfig: any = await models.config.findById(1);
    currentConfig = currentConfig ? currentConfig.result : null;
    if (currentConfig && currentConfig.wxAccessToken) {
      const now: number = new Date().getTime();
      const updateAt: number = new Date(currentConfig.updateAt).getTime();
      const overdue: boolean = (now - updateAt) / 1000 > OVERDUE_LIMIT;
      if (!overdue) {
        return currentConfig.wxAccessToken;
      }
    }
    const accessTokenOpt = {
      url: "https://api.weixin.qq.com/cgi-bin/token",
      qs: {
        grant_type: "client_credential",
        appid: process.env.wxAppid,
        secret: process.env.wxSecret,
      },
      method: "GET",
    };
    const tokenRaw = await rp(accessTokenOpt);
    const token = JSON.parse(tokenRaw).access_token;
    return token;
  }
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

function generateToken(seed) {
  const hash = crypto.createHash('sha256');
  hash.update(seed);
  return hash.digest('hex');
}

async function getWxOpenId(contextId, code) {
  try {
    const context = await models.Context.findById(contextId);
    if (context && context.status) {
      let wxInfo = await rp({
        uri: `https://api.weixin.qq.com/sns/jscode2session?`,
        qs: {
          appid: context.result.wxAppId,
          secret: context.result.wxSecret,
          js_code: code,
          grant_type: 'authorization_code'
        },
        method: 'GET',
        json: true
      });
      return wxInfo;
    } else {
      return new Error('context not found!');
    }
  } catch (err) {
    return err;
  }
}

export default {
  WxTools,
  WXBizDataCrypt,
  getWxOpenId,
  generateToken
}