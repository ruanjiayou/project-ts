import * as _ from 'lodash';
import * as moment from 'moment';
import * as Debug from 'debug';
import { wxHelper, validater } from '../../../libs';

const debug = Debug('APP:public-wxInfo');
const system = require('../../../configs/system');

module.exports = {
  /**
   * @api {GET} /v1/pubic/wx-phone 获取加密信息中的手机号
   * @apiGroup PublicWXPhone
   * 
   * @apiParam {string} code code码
   * @apiParam {string} encryptedData 加密数据
   * @apiParam {string} iv 加密向量
   * 
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   status: "success",
   *   result: {
   *     countryCode: '86',
   *     phoneNumber: '18972376482',
   *     purePhoneNumber: '18972376482'
   *   }
   * }
   */
  'GET /v1/public/wxPhone': async (req, res, next) => {
    debug(`enter ${req.method} ${req.originalUrl} route`);
    const validation = new validater({
      rules: {
        code: 'required|string',
        iv: 'required|string',
        encryptedData: 'required|string'
      }
    });
    try {
      const input = validation.validate(req.query);
      const info = await wxHelper.getWxOpenId(system.wxAppId, system.wxSecret, input.code);
      const wxInfo = wxHelper.getInfo(system.wxAppId, info.session_key, input.encryptedData, input.iv);
      if (!_.isNil(wxInfo)) {
        delete wxInfo.watermark;
      }
      res.return(wxInfo);
    } catch (err) {
      next(err);
    }
  }
}