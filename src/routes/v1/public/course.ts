import libs from '../../../libs';
import models from '../../../models';
import * as _ from 'lodash';
import * as Debug from 'debug';

const Hinter = libs.hinter;
const Validator = libs.validator;
const debug = Debug('APP:public-course-route');

export = {
  /**
   * @api {get} /v1/public/course 获取某天课程列表(包括学生数量和老师数量)
   * @apiName list
   * @apiGroup PublicCourse
   * 
   * @apiParam {number} schoolId 教学点id
   * @apiParam {date} date 日期,如: 2018-03-29
   * @apiParam {number} [limit] 每页数量
   * @apiParam {number} [page] 当前页数
   * 
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   status: 'success',
   *   result: [{
   *     id: 1,
   *     schoolId: 1,
   *     students: 1,
   *     assistants: 1,
   *     date: '2018-03-29',
   *     startTime: '18:30:00',
   *     endTime: '22:30:00'
   *   }]
   * } 
   */
  'get /v1/public/course': async (req, res, next) => {
    debug('enter get /v1/public/course route');
    const query = req.paging();
    const validator = new Validator({
      rules: {
        schoolId: 'nullable|int',
        date: 'nullable|date'
      }
    });
    const input = validator.filter(req.query);
    try {
      validator.check(input);
      _.assign(query.where, input);
      const courses = await models.Course.findAndCountAll(query);
      res.paging(courses, query);
    } catch (err) {
      next(err);
    }
  }
}