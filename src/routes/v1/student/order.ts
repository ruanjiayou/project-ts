import libs from '../../../libs';
import models from '../../../models';
import * as _ from 'lodash';
import * as Debug from 'debug';

const Hinter = libs.hinter;
const Validator = libs.validator;
const debug = Debug('APP:student-order-route');

export = {
  /**
   * @api {post} /v1/student/order 预约课程
   * @apiName create
   * @apiGroup StudentOrder
   * 
   * @apiParam {number} courseId 课程id
   * 
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   status: 'success'
   * } 
   */
  'post /v1/student/order': async (req, res, next) => {
    debug('enter post /v1/student/order');
    const validator = new Validator({
      rules: {
        courseId: 'required|int'
      }
    });
    const input = validator.filter(req.body);
    const student = res.locals.studentAuth;
    const t = await models.sequelize.transaction();
    try {
      validator.check(input);
      const course = await models.Course.findById(input.courseId);
      if (_.isNil(course)) {
        throw new Hinter('common', 'notFound');
      }
      const school = await models.School.findById(course.schoolId);
      //TODO:免费次数检查,会员检查
      if (student.isVIP) {
        course.students++;
        input.isFree = false;
        await course.save({ transaction: t });
      } else if (course.students < school.limit) {
        if (student.defaultFree + student.shareFree > student.cost) {
          course.students++;
          student.cost++;
          input.isFree = true;
          await student.save({ transaction: t });
          await course.save({ transaction: t });
        } else {
          throw new Hinter('order', 'studentNeedFreeOrVIP')
        }
      } else {
        throw new Hinter('order', 'studentLimit');
      }
      input.type = 'student';
      input.courseId = course.id;
      // userId字段user代表student或assistant
      input.userId = res.locals.studentAuth.id;
      const order = await models.Order.create(input, { transaction: t });
      await t.commit();
      res.success();
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  /**
   * @api {get} /v1/student/order 我的预约成功课程列表
   * @apiName list
   * @apiGroup StudentOrder
   * 
   * @apiParam {number} [schoolId] 教学点id
   * @apiParam {date} [date] 日期
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
  'get /v1/student/order': async (req, res, next) => {
    debug('enter get /v1/student/order route');
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
      query.where.userId = res.locals.studentAuth.id;
      query.where.type = 'student';
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