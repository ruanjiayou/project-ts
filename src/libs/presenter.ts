import * as _ from 'lodash';
import * as Debug from 'debug';
import * as errorsJson from '../errors';

const SUCCESS = 'success', FAIL = 'fail';
const debug = Debug('app:route-log');
const presenter = (params: any) => {
  // 默认设置 分页传参字段/错误提示文件夹
  let d = _.assign({
    limit: 'limit',
    page: 'page',
    search: 'search',
    order: 'order',
    defaultLang: 'zh-cn'
  }, params);
  return (req, res, next) => {
    debug(`ENTER ${req.method} ${req.originalUrl}`);
    if (_.isNil(req.files)) {
      req.files = {};
    }
    /**
     * 查询前计算limit和offset, 将req.query分为 hql和query
     */
    req.paging = (cb) => {
      let hql: any = { where: {} };
      const query = req.query;

      let page = parseInt(query[d.page]);
      let limit = parseInt(query[d.limit]);
      let order = query[d.order];
      let search = query[d.search];

      delete query[d.page];
      delete query[d.limit];
      delete query[d.order];
      delete query[d.search];

      hql.limit = _.isEmpty(limit) ? 20 : limit;
      hql.offset = _.isEmpty(page) ? 0 : (page - 1) * limit;

      if (!_.isEmpty(order)) {
        hql.order = order;
      }
      if (!_.isEmpty(search)) {
        hql.search = search;
      }
      if (cb && typeof cb === 'function') {
        hql = cb(hql, query);
      }
      return hql;
    };
    /**
     * 根据分页条件和查询结果构建分页信息
     * @param {object} result findAndCountAll()返回的结果
     * @param {object} query 查询条件中的limit和page
     */
    res.paging = (result, query) => {
      let rows = result ? result.rows.map(function (item) { return item.get({ plain: true }); }) : [];
      let total = result ? result.count : 0;
      return res.json({
        status: SUCCESS,
        result: rows,
        paging: {
          page: query.page,
          pages: Math.ceil(total / query.limit),
          limit: query.limit,
          count: rows.length,
          total: total
        }
      });
    };
    /**
     * 返回json格式的查询结果
     * @param {object} result 
     */
    res.return = (result, params) => {
      if (result && result.get) {
        result = result.get({ plain: true });
      }
      return res.json(_.assign({ status: result === null ? FAIL : SUCCESS }, { result: result }, params));
    };
    res.success = () => {
      res.json({ status: SUCCESS });
    }
    res.fail = () => {
      res.json({ status: FAIL });
    };
    /**
     * 处理自定义返回错误
     */
    res.customError = (err) => {
      try {
        // 语言包验证-模块验证 ['zh-cn']['common']['notFound]
        const errorJson = errorsJson[res.locale || d.defaultLang][err.module][err.type];
        return res.status(errorJson.statusCode).json({
          status: FAIL,
          code: errorJson.code || 400,
          message: errorJson.message,
          detail: err.toString()
        });
      } catch (er) {
        res.status(500).json({ status: FAIL, code: 10230, message: '没找到定义的错误json文件', detail: er });
      }
    };
    /**
     * 处理验证错误
     */
    res.validateError = (err) => {
      err.module = 'common';
      err.type = 'validation';
      res.customError(err);
    };
    next();
  };
};

export = {
  presenter
};