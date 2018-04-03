import models from "../../../models";
import libs from '../../../libs';
import * as _ from 'lodash';
import * as Debug from 'debug';

const Hinter = libs.hinter;
const Validator = libs.validator;
const debug = Debug('APP:admin-school-route');

module.exports = {
  /**
   * @api {post} /v1/admin/school 创建教学点
   * @apiName create
   * @apiGroup AdminSchool
   *
   * @apiParam {string} name 教学点名称
   * @apiParam {number} total 教学点最多学生数量
   * @apiParam {string} address 教学点地址
   * @apiParam {string} detail 详细地址
   *
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "status": "success",
   *   "result": {
   *      id: 1,
   *      total: 10,
   *      name: '教学点名称',
   *      address: '教学点地址',
   *      detail: '详细地址'
   *    }
   * }
   */
  "post /v1/admin/school": async function (req, res, next) {
    debug('ENTER POST /v1/admin/school ROUTE');
    const validator = new Validator({
      rules: {
        name: 'required|string',
        total: 'required|int',
        address: 'required|string',
        detail: 'required|string'
      }
    });
    const input = validator.filter(req.body);
    try {
      validator.check(input);
    } catch (err) {
      return next(err);
    }
    try {
      const school = await models.School.create(input);
      res.return(school);
    } catch (err) {
      next(err);
    }
  },
  /**
   * @api {put} /v1/admin/school/:schoolId([0-9]+) 修改教学点信息
   * @apiName update
   * @apiGroup AdminSchool
   *
   * @apiParam {number} [total] 教学点学生人数上限
   * @apiParam {string} [name] 教学点名称
   * @apiParam {string} [address] 教学点地址
   * @apiParam {string} [detail] 详细地址
   *
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "status": "success",
   *   "result": {
   *      id: 1,
   *      name: '教学点名称',
   *      address: '教学点地址',
   *      detail: '详细地址',
   *      total: 10
   *     }
   * }
   */
  "put /v1/admin/school/:schoolId([0-9]+)": async function (req, res, next) {
    debug('ENTER PUT /v1/admin/school/:schoolId([0-9]+) ROUTE');
    const validator = new Validator({
      rules: {
        total: 'nullable|int',
        name: 'nullable|string',
        address: 'nullable|string',
        detail: 'nullable|string'
      }
    });
    const input = validator.filter(req.body);
    try {
      validator.check(input);
      input.data = JSON.stringify(input.data);
    } catch (err) {
      return next(err);
    }
    try {
      const query = {
        where: {
          id: req.params.schoolId,
        }
      }
      const scopes = [];
      let school = await models.School.scope(scopes).findOne(query);
      if (school) {
        await school.update(input, query);
      } else {
        throw new Hinter('common', 'notFound');
      }
      school = await models.carousel.findById(req.params.schoollId);
      res.return(school);
    } catch (err) {
      next(err);
    }
  },
  /**
   * @api {get} /v1/admin/schools 获取教学点列表
   * @apiName list
   * @apiGroup AdminSchool
   * @apiVersion 2.0.1
   *
   * @apiParam {Number} [limit] 每页数量
   * @apiParam {Number} [page] 当前页码
   *
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "status": "success",
   *   "result": [{
   *     id: 1,
   *     name: '教学点名称',
   *     address: '教学点地址',
   *     detail: '详细地址'
   *   }],
   *   "paging": {
   *     "pages": 1,
   *     "limit": 10,
   *     "count": 4,
   *     "total": 9
   *   }
   * }
   */
  "get /v1/admin/school": async function (req, res, next) {
    debug('ENTER GET /v1/admin/school ROUTE');
    const query = req.paging();
    try {
      const scopes = [];
      const schools = await models.carousel.scope(scopes).findAndCountAll(query);
      res.paging(schools, query);
    } catch (err) {
      next(err);
    }
  },
  /**
   * @api {get} /v1/admin/school/:schoolId([0-9]+) 获取教学点详情
   * @apiName show
   * @apiGroup AdminSchool
   *
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "status": "success",
   *   "result": {
   *     id: 1,
   *     name: '教学点名称',
   *     total: 10
   *     address: '教学点地址',
   *     detail: '详细地址'
   *   }
   * }
   */
  "get /v1/admin/school/:schoolId([0-9]+)": async function (req, res, next) {
    debug('ENTER GET /v1/admin/school/:schoolId([0-9]+) ROUTE');
    try {
      const scopes = [];
      const school = await models.carousel.scope(scopes).findById(req.params.schoolId);
      if (_.isNil(school)) {
        throw new Hinter('common', 'notFound');
      }
      res.return(school);
    } catch (err) {
      next(err);
    };
  },
  /**
   * @api {delete} /v1/admin/school/:schoolId([0-9]+) 删除教学点
   * @apiName delete
   * @apiGroup AdminSchool
   * 
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "status": "success",
   * }
   */
  "delete /v1/admin/school/:schoolId([0-9]+)": async function (req, res, next) {
    debug('ENTER DELETE /v1/admin/school/:schoolId([0-9]+) ROUTE');
    try {
      const query = { where: { id: req.params.schoolId } };
      await models.School.destroy(query);
      res.return();
    } catch (err) {
      next(err);
    }
  }
};