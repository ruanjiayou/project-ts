import libs from '../../../libs';
import models from '../../../models';
import * as _ from 'lodash';
import * as Debug from 'debug';

const Hinter = libs.hinter;
const Validator = libs.validator;
const authHelper = libs.auth;
const debug = Debug('APP:student-auth-route');

export = {
  /**
   * @api {post} /v1/auth/student/sign-in 登录
   * @apiName sign-in
   * @apiGroup StudentAuth
   * 
   * @apiParam {string} code 姓名
   * @apiParam {string} phone 手机号
   * @apiParam {string} password 密码
   * 
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   status: 'success',
   *   result: {
   *     type: 'jwt'
   *     token: ''
   *   }
   * } 
   */
  'post /v1/auth/student/sign-in': async (req, res, next) => {
    debug('enter post /v1/auth/student/sign-in route');
    // code或账户密码 -> 返回token
    const validator = new Validator({
      rules: {
        token: 'required|string'
      }
    });
    const input = validator.filter(req.body);
    try {
      validator.check(input);
    } catch (err) {
      return next(err);
    }
    try {
      const query = { where: { phone: input.token } };
      const student = await models.Student.findOne(query);
      //TODO:照理说要对比密码的
      if (_.isNil(student)) {
        throw new Hinter('common', 'notFound');
      } else {
        const token = authHelper.encode({ refreshToken: '89757', phone: student.phone });
        res.return(token);
      }
    } catch (err) {
      next(err);
    }
  },
  /**
   * @api {post} /v1/auth/student/sign-up 注册
   * @apiName sign-up
   * @apiGroup StudentAuth
   * 
   * @apiParam {string} name 姓名
   * @apiParam {string} phone 手机号
   * @apiParam {string} school 学校名称
   * @apiParam {number} age 年龄
   * @apiParam {string} openid
   * 
   * @apiSuccessExample Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   status: 'success',
   *   result: {
   *     id: 1,
   *     name: '姓名',
   *     phone: '189',
   *     school: 'xx',
   *     age: 18,
   *     defaultFree: 5,
   *     free: 0,
   *     cost: 0
   *   }
   * } 
   */
  'post /v1/auth/student/sign-up': async (req, res, next) => {
    debug('enter post /v1/auth/student/sign-up');
    const validator = new Validator({
      rules: {
        name: 'required|string',
        phone: 'required|string|range[7,11]',
        school: 'required|string',
        age: 'required|int|min:10',
        openid: 'nullable|string'
      }
    });
    const input = validator.filter(req.body);
    const t = await models.sequelize.transaction();
    try {
      validator.check(input);
      const student = await models.Student.create(input, { transaction: t });
      await models.Apply.create({ type: 'student', applicantId: student.id }, { transaction: t });
      await t.commit();
      res.return(student);
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  'use /v1/student/*': async (req, res, next) => {
    debug('ENTER USE /v1/student/* ROUTE');
    let token = null;
    try {
      token = authHelper.decode(req);

      if (_.isEmpty(token)) {
        return next(new Hinter('common', 'unauthorized'));
      }
      let student = await models.Student.findOne({ where: { phone: token.phone } });
      if (student) {
        if (student.isApproved) {
          res.locals.studentAuth = student;
        } else {
          throw new Hinter('auth', 'unapproved');
        }
      } else {
        throw new Hinter('common', 'notFound');
      }
      next();
    } catch (err) {
      next(err);
    }
  }
}