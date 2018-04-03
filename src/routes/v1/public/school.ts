import libs from '../../../libs';
import models from '../../../models';
import * as _ from 'lodash';
import * as Debug from 'debug';

const Hinter = libs.hinter;
const Validator = libs.validator;
const debug = Debug('APP:public-course-route');

export = {
  /**
   * @api {get} /v1/public/school 获取教学点列表
   * @apiName list
   * @apiGroup PublicSchool
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
   *     name: '硚口区教学点',
   *     limit: 10,
   *     address: '硚口区古田二路',
   *     detail: '国际汇丰'
   *   }]
   * } 
   */
  'get /v1/public/school': async (req, res, next) => {
    debug('enter get /v1/public/school route');
    const query = req.paging();
    try {
      const schools = await models.School.findAndCountAll(query);
      res.paging(schools, query);
    } catch (err) {
      next(err);
    }
  }
}