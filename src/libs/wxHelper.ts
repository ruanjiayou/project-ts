const _ = require('lodash');
const moment = require('moment');
const crypto = require('crypto');
const rp = require('request-promise');
const parseString = require('xml2js').parseString;

class wxHelper {
  /**
   * 获取请求微信服务器API的token
   * @param {object} wxCfg 配置对象(appid,secret,access_token,updatedAt)
   * @returns token
   */
  static async getAccessToken(wxCfg) {
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
  static async getNotifyTpl(wxCfg, page: number = 1, offset: number = 20) {
    const access_token = wxHelper.getAccessToken(wxCfg);
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
  static async sendTplNotify(models, wxCfg, data) {
    // 0.access_token
    const access_token = await wxHelper.getAccessToken(wxCfg);
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
  static generateToken(seed) {
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
  static async getWxOpenId(appid, secret, code) {
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
      console.log(wxInfo, 'wxInfo');
      throw new Error('获取openid失败!');
    }
    return wxInfo;
  }
  /**
   * 从加密数据中获取手机号
   * @param appid 小程序appid
   * @param sessionKey 临时key(2小时)
   * @param encryptedData 加密数据
   * @param iv 加密向量
   * @returns countryCode/phoneNumber/purePhoneNumber
   */
  static getInfo(appid, sessionKey, encryptedData, iv) {
    // base64 decode
    const sessionKeyBuf = new Buffer(sessionKey, "base64");
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
      if (decoded.watermark.appid !== appid) {
        throw new Error("Illegal Buffer");
      }
      return decoded;
    } catch (err) {
      console.error(err);
      decoded = null;
    }
    return decoded;
  }
}

class wxPayHelper {
  /**
   * 
   * @param key 商户平台的密匙
   * @param opt appid/openid/mch_id/body/out_trade_no/spbill_create_ip
   */
  static async getPreOrder(key, opt: any) {
    // 1.默认参数
    const defauls = {
      appid: '',
      openid: '',
      // 商户号
      mch_id: '',
      // 设备号
      // device_info: '',
      sign_type: 'MD5',
      // *商品描述
      body: '支付测试',
      // 商品详情 商品详细描述，对于使用单品优惠的商户，改字段必须按照规范上传
      //detail: '',
      // 附加数据 深圳分店
      //attach: '',
      // 商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*且在同一个商户号下唯一
      out_trade_no: '',
      fee_type: 'CNY',
      total_fee: 1,
      // *终端IP
      spbill_create_ip: '',
      //time_start: '',
      //time_expire: '',
      //goods_tag: '',
      notify_url: 'http://wxpay.wxutil.com/pub_v2/pay/notify.v2.php',
      nonce_str: wxPayHelper.get32RandStr(),
      trade_type: 'JSAPI',
      //product_id: '',
      //limit_pay: '',
    };
    // 2.混合
    opt = _.assign(defauls, opt);
    // 3.生成sign md5加密
    opt.sign = wxPayHelper.getSign(key, opt);
    // 4.最终发送数据
    const xml_str = wxPayHelper.json2TXxml(opt);
    const preOrder = await rp({
      uri: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Content-Length': xml_str.length
      },
      body: xml_str
    });
    let res = {};
    parseString(preOrder, (err, result) => {
      if (err) {
        console.log(err, 'prepay error');
      } else {
        res = result.xml;
      }
    });
    return res;
  }
  /**
   * 生成MD5
   */
  static getMD5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
  }
  /**
   * 生成32位随机字符串
   */
  static get32RandStr() {
    return wxPayHelper.getMD5(`${new Date().getTime()}-${Math.floor(Math.random() * 10000)}`);
  }
  /**
   * 比较字符串大小,类C
   * @param str1 
   * @param str2 
   */
  static compare(str1, str2) {
    let len1 = str1.length, len2 = str2.length;
    for (let i = 0; i < len1 && i < len2; i++) {
      if (str1.charCodeAt(i) !== str2.charCodeAt(i)) {
        return str1.charCodeAt(i) - str2.charCodeAt(i);
      }
    }
    return len1 - len2;
  }
  /**
   * 生成sign
   * @param key 商户key
   * @param opt object
   */
  static getSign(key, opt) {
    const keyArr = [];
    // 去掉空的字段
    for (let k in opt) {
      if (!_.isNil(opt[k])) {
        keyArr.push([k, opt[k]])
      }
    }
    // 按ASCII排序
    keyArr.sort(function (a, b) {
      return wxPayHelper.compare(a[0], b[0]);
    });
    // 生成stringA
    const stringA = (keyArr.map((t) => { return t.join('=') })).join('&');
    // 生成stringSignTemp
    const stringSignTemp = `${stringA}&key=${key}`;
    // 生成sign
    const sign = wxPayHelper.getMD5(stringSignTemp).toUpperCase();
    return sign;
  }
  /**
   * 生成 微信支付的xml(ASCII排序..)
   * @param opt object
   */
  static json2TXxml(opt) {
    const keyArr = [];
    // 去掉空的字段
    for (let k in opt) {
      if (!_.isNil(opt[k])) {
        keyArr.push([k, opt[k]])
      }
    }
    // 按ASCII排序
    keyArr.sort(function (a, b) {
      return wxPayHelper.compare(a[0], b[0]);
    });
    let xml = '<xml>';
    keyArr.forEach((item) => {
      xml += `\n  <${item[0]}>${item[1]}</${item[0]}>`
    });
    xml += '\n</xml>';
    return xml;
  }
  /**
   * 给前端小程序用的,发起支付请求
   * @param appid 
   * @param key 
   * @param prepay_id 
   */
  static getPayOpt(appid, key, prepay_id) {
    const opt: any = {
      appId: appid,
      timeStamp: Math.ceil(new Date().getTime() / 1000),
      nonceStr: wxPayHelper.get32RandStr(),
      package: `prepay_id=${prepay_id}`,
      signType: 'MD5'
    }
    opt.paySign = wxPayHelper.getSign(key, opt);
    delete opt.appId;
    return opt;
  }
}

export { wxHelper, wxPayHelper };