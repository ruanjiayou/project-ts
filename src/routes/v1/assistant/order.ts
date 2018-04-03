import libs from '../../../libs';
import models from '../../../models';
import * as _ from 'lodash';
import * as Debug from 'debug';

const Hinter = libs.hinter;
const Validator = libs.validator;
const debug = Debug('APP:assistant-order-route');

export = {
  /**
   * @api {post} /v1/assistant/order 预约课程
   * @apiName create
   * @apiGroup AssistantOrder
   * 
   * @apiParam {number} courseId 课程id
   * 
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   status: 'success'
   * } 
   */
  'post /v1/assistant/order': async (req, res, next) => {
    debug('enter post /v1/assistant/order');
    const validator = new Validator({
      rules: {
        courseId: 'required|int'
      }
    });
    const input = validator.filter(req.body);
    const t = await models.sequelize.transaction();
    try {
      const course = await models.Course.findById(input.courseId);
      if (_.isNil(course)) {
        throw new Hinter('common', 'notFound');
      }
      const school = await models.School.findById(course.schoolId);
      // 助教数小于limit,助教数与学生数:公共部分配对 按时间顺序,过期自动fail
      if (course.assistants < school.limit) {
        if (course.assistants < course.students) {
          input.status = 'success';
          await models.Order.update({ status: 'success' }, { where: { courseId: input.courseId, type: 'student', status: 'pending' } }, { transaction: t });
        } else {
          input.status = 'pending';
        }
        course.assistants++;
        await course.save({ transaction: t });
      } else {
        throw new Hinter('order', 'assistantLimit');
      }
      _.assign(input, {
        type: 'assistant',
        userId: res.locals.assistantAuth.id,
        isFree: false
      });
      const order = await models.Order.create(input, { transaction: t });
      await t.commit();
      res.success();
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  /**
   * @api {get} /v1/assistant/order 我的预约成功课程列表
   * @apiName list
   * @apiGroup AssistantOrder
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
   *     courseId: 1,
   *     userId: 1,
   *     course: {
   *       date: '2018-04-11',
   *       startTime: '18:30:00',
   *       endTime: '22:30:00',
   *       students: 0,
   *       assistants: 0
   *     }
   *   }]
   * } 
   */
  'get /v1/assistant/order': async (req, res, next) => {
    debug('enter get /v1/assistant/order route');
    const query = req.paging();
    const validator = new Validator({
      rules: {
        schoolId: 'nullable|int',
        date: 'nullable|date'
      }
    });
    const input = validator.filter(req.query);
    const scopesFilter = [];
    try {
      validator.check(input);
      query.where.userId = res.locals.assistantAuth.id;
      query.where.type = 'assistant';
      if (!_.isEmpty(input.schoolId) || !_.isEmpty(input.date)) {
        scopesFilter.push({ method: ['includeCourse', input] });
      }

      const orders = await models.Order.scope(scopesFilter).findAndCountAll(query);
      res.paging(orders, query);
    } catch (err) {
      next(err);
    }
  }
}