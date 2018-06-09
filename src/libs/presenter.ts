import * as _ from 'lodash';
import * as Debug from 'debug';
import * as errorsJson from '../errors';
import { thrower } from './thrower';

const SUCCESS = 'success', FAIL = 'fail';
const debug = Debug('app:route-log');

/**
 * 根据分页条件和查询结果构建分页信息
 * @param {object} result findAndCountAll()或findAll()返回的结果
 * @param {object} query 查询条件中的limit和page, req.paging中得到
 * @returns status/result/paging
 */
const prePaging = (result, query) => {
  let rows = result ? result.rows.map(function (item) { return item.toJSON ? item.toJSON() : item; }) : [];
  let total = result ? result.count : 0;
  return {
    status: SUCCESS,
    result: rows,
    paging: {
      page: query.page,
      pages: Math.ceil(total / query.limit),
      limit: query.limit,
      count: rows.length,
      total: total
    }
  };
};

/**
 * 返回json格式的查询结果
 * @param {object} result 记录对象
 * @param {object} [params] 可选参数
 * @returns status/result
 */
const preReturn = (result, params) => {
  if (!_.isNil(result)) {
    if (_.isArray(result)) {
      result = result.map(item => {
        return item.toJSON ? item.toJSON() : item;
      })
    } else {
      result = result.toJSON ? result.toJSON() : result;
    }
  }
  return _.assign({ status: result === null ? FAIL : SUCCESS }, { result }, params)
};

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
     * @returns page/limit/offset/where/search/order
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

      hql.page = page || 1;
      hql.limit = limit || 20;
      hql.offset = (hql.page - 1) * hql.limit;

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
    res.paging = (result, query) => {
      res.json(prePaging(result, query));
    };
    res.return = (result, params) => {
      return res.json(preReturn(result, params));
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
        const errInfo: any = {
          status: FAIL,
          code: errorJson.code || 400,
          message: errorJson.message
        };
        if (err.message !== '') {
          errInfo.detail = err.toString();
        }
        return res.status(errorJson.statusCode).json(errInfo);
      } catch (er) {
        res.status(500).json({ status: FAIL, code: 10230, message: '没找到定义的错误json文件', detail: `${err.module} ${err.type}` });
      }
    };
    /**
     * 处理验证错误
     */
    res.validateError = (err) => {
      err.module = 'common';
      err.type = 'validation';
      err.time = new Date();
      res.customError(err);
    };
    next();
  };
};

export = {
  presenter
};