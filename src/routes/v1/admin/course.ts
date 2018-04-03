import libs from '../../../libs';
import models from '../../../models';
import * as _ from 'lodash';
import * as Debug from 'debug';

const Hinter = libs.hinter;
const Validator = libs.validator;
const debug = Debug('APP:admin-course-route');

export = {
  /**
   * @api {get} /v1/admin/course/statistics/:date([0-9]+-[0-9]+-[0-9]+) 课程列表
   * @apiName list
   * @apiGroup AdminCourse
   * 
   * @apiParam {date} date 日期,如: 2018-03-29
   * 
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   status: 'success',
   *   result: [{
   *     id: 1,
   *     date: '2018-03-29',
   *     startTime: '20:00',
   *     endTime: '22:00',
   *     schoolId: 1,
   *     students: 10,
   *     assistants: 10
   *   }]
   * } 
   */
  'get /v1/admin/course/:courseId([0-9]+)': async (req, res, next) => {
    debug('enter get /v1/admin/course/:courseId([0-9]+)');
    try {
      const course = await models.Course.findById(req.params.courseId);
      res.return(course);
    } catch (err) {
      next(err);
    }
  }
}