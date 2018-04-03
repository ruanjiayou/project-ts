import libs from '../../../libs';
import models from '../../../models';
import * as _ from 'lodash';
import * as Debug from 'debug';

const Hinter = libs.hinter;
const Validator = libs.validator;
const debug = Debug('APP:admin-share-route');

export = {
  /**
   * @api {get} /v1/admin/share 分享记录列表
   * @apiName list
   * @apiGroup AdminShare
   * 
   * @apiParam {number} [limit] 每页数量
   * @apiParam {number} [page] 当前页数
   * 
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   status: 'success',
   *   result: [{
   *     id: 1,
   *     share_openid: 1,
   *     accept_openid: 1
   *   }]
   * } 
   */
  'get /v1/admin/share': async (req, res, next) => {
    debug('enter get /v1/admin/share');
    const query = req.paging();
    try {
      const shares = await models.Share.findAndCountAll(query);
      res.paging(shares, query);
    } catch (err) {
      next(err);
    }
  }
}