/**
 * return()/ 返回值json处理,主要是status,code,result
 * paging()/ list()方法的分页
 * abort()/ 处理自定义错误
 * 
 */
import * as _ from 'lodash';
import * as errorsJson from '../errors';

const SUCCESS = 'success', FAIL = 'fail';
const presenter = (params: any) => {
  // 默认设置 分页传参字段/错误提示文件夹
  let d = {
    limit: 'limit',
    page: 'page',
    order: 'order',
    defaultLang: 'zh-cn'
  };
  for (let k in params) {
    d[k] = params[k];
  }
  return (req, res, next) => {
    /**
     * 查询前计算limit和offset
     */
    req.paging = () => {
      let page = parseInt(req.query[d.page]);
      let limit = parseInt(req.query[d.limit]);
      delete req.query[d.page];
      delete req.query[d.limit];
      if (!page) {
        page = 1;
      }
      if (!limit) {
        limit = 20;
      }
      req.query.page = page;
      req.query.limit = limit;
      return {
        where: {},
        offset: (page - 1) * limit,
        limit: limit
      };
    };
    /**
     * 根据分页条件和查询结果构建分页信息
     * @param {object} result findAndCountAll()返回的结果
     * @param {*} info 查询条件中的limit和page
     */
    res.paging = (result, query) => {
      let rows = result ? result.rows.map(function (item) { return item.get({ plain: true }); }) : [];
      let total = result ? result.count : 0;
      let r = {
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
      r.paging.pages = Math.ceil(r.paging.total / r.paging.limit);
      return res.json(r);
    };
    /**
     * 返回json格式的查询结果
     * @param {object} result 
     */
    res.return = (result, params) => {
      if (result && result.get) {
        result = result.get({ plain: true });
      }
      return res.json(_.assign(
        {
          status: result === null ? FAIL : SUCCESS
        }, {
          result: result
        }, params));
    };
    res.success = () => {
      res.json({ status: SUCCESS });
    }
    /**
     * 处理自定义返回错误
     */
    res.customError = (err) => {
      try {
        // 语言包验证-模块验证 ['zh-cn']['common']['notFound]
        const langJson = errorsJson[res.locale || d.defaultLang];
        let errorModule = null;
        let errorJson = null;
        if (langJson) {
          errorModule = langJson[err.module];
          if (errorModule) {
            errorJson = errorModule[err.type];
          }
        }
        if (errorJson) {
          return res.status(errorJson.statusCode).json({
            status: FAIL,
            code: errorJson.code || 400,
            message: errorJson.message,
            detail: err.toString()
          });
        } else {
          throw err;
        }
      } catch (er) {
        res.status(404).json({ status: FAIL, code: 200, message: '没找到定义的错误json文件', detail: er });
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

export { presenter }