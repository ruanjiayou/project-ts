import models from "../../../models";
import libs from '../../../libs';
import configs from '../../../configs';
import * as _ from 'lodash';
import * as Debug from 'debug';

const sysCfg = configs.system;
const Hinter = libs.hinter;
const Validator = libs.validator;
//const authHelper = libs.auth;
const wxHelper = libs.wxHelper;
const debug = Debug('APP:admin-apply-route');
module.exports = {
  /**
   * @api {get} /v1/admin/apply 申请列表
   * @apiName list
   * @apiGroup AdminApply
   *
   * @apiParam {String='student', 'assistant'} type 申请类型
   * @apiParam {number} [limit] 每页数量
   * @apiParam {number} [page] 当前页码
   *
   * @apiSuccessExample Success-Response:
   *   HTTP/1.1 200 OK
   *   {
   *     "status": "success",
   *     "result": [{
   *         type: 'student|assistant',
   *         status: 'pending|success|fail',
   *         applicantId: 1
   *      }]
   *   }
   */
  'get /v1/admin/apply': async (req, res, next) => {
    debug('enter get /v1/auth/admin/login route');
    const query = req.paging();
    const validator = new Validator({
      rules: {
        type: 'required|in:student,assistant'
      }
    })
    const input = validator.filter(req.query);
    try {
      validator.check(input);
      query.where.type = input.type;
    } catch (err) {
      return next(err);
    }
    try {
      const applys = await models.Apply.findAndCountAll(query);
      res.paging(applys, query);
    } catch (err) {
      next(err);
    }
  },
  /**
   * @api {get} /v1/admin/apply/:applyId([0-9]+) 申请详情
   * @apiName show
   * @apiGroup AdminApply
   *
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "status": "success",
   *   "result": {
   *       id: 1,
   *       type: 'student|assistant',
   *       status: 'pending|success|fail',
   *       applicantId: 1
   *    }
   * }
   */
  'get /v1/admin/apply/:applyId([0-9]+)': async (req, res, next) => {
    debug('ENTER POST /v1/auth/admin/login ROUTE');
    try {
      const apply = await models.Apply.findById(req.params.applyId);
      res.return(apply);
    } catch (err) {
      next(err);
    }
  },
  /**
   * @api {put} /v1/admin/apply/:applyId([0-9]+) 审核申请
   * @apiName update
   * @apiGroup AdminApply
   * 
   * @apiParam {string='success','fail'} status 审核结果
   *
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "status": "success",
   *   "result": {
   *       status: 'success',
   *       type: 'student|assistant',
   *       applicantId: 1,
   *       description: ''
   *    }
   * }
   */
  'put /v1/admin/apply/:applyId([0-9])': async (req, res, next) => {
    debug('ENTER PUT /v1/auth/admin/apply/:applyId([0-9]) ROUTE');
    const validator = new Validator({
      rules: {
        status: 'required|in:success,fail'
      }
    });
    const t = await models.sequelize.transaction();
    const input = validator.filter(req.body);
    try {
      validator.check(input);

      const apply = await models.Apply.findById(req.params.applyId);
      if (_.isNil(apply)) {
        throw new Hinter('apply', 'notFound');
      }
      if (input.status === 'fail') {
        apply.status = input.status;
        await apply.save();
      } else {
        apply.status = 'success';
        await apply.save({ transaction: t });
        const user = apply.type === 'student' ? models.Student : models.Assistant;
        await user.update({ isApproved: true }, { where: { id: apply.applicantId } }, { transaction: t });
      }
      await t.commit();
      res.return(apply);
    } catch (err) {
      await t.rollback();
      next(err);
    }
  }
}