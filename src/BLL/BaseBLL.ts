import * as _ from 'lodash';
import models from '../models';

interface Opts {
  t?: any;
  query?: any;
  scopes?: any;
  attributes?: any;
}

class BaseBLL {
  model: any;
  models = models;
  /**
   * 
   * @param opts 对象处理转换[t][query][scopes][attributes]
   */
  _init(opts: Opts) {
    const opt: any = {};
    opt.transaction = _.isNil(opts.t) ? null : opts.t;
    opt.scopes = _.isNil(opts.scopes) ? [] : opts.scopes;
    if (!_.isNil(opts.attributes)) {
      opt.attributes = opts.attributes;
    }
    // paging()生成的query有limit where offset order
    if (!_.isNil(opts.query)) {
      _.assign(opt, opts.query);
      if (_.isNil(opt.where)) {
        opt.where = {};
      }
    }
    return opt;
  }
  // 只有t参数
  async create(data, t = {}) {
    const res = await this.model.create(data, t);
    return res;
  };
  /**
   * 删除数据
   * @param o id或查询条件
   * @param t 事物
   */
  async destroy(o, t = {}) {
    if (typeof o === 'number') {
      return await this.model.destroy({ where: { id: o } }, t);
    } else if (typeof o.destroy === 'function') {
      return await o.destroy(t);
    } else {
      return await this.model.destroy(o, t);
    }
  };
  /**
   * 修改记录
   * @param data 数据
   * @param opts [t][query]
   */
  async update(data, opts: Opts = {}) {
    const opt = this._init(opts);
    const res = await this.model.updata(data, opt);
    return res;
  };
  /**
   * 获取所有数据(少数情况)
   * @description query包含 limit/offset/where/order
   * @param opts [t][query][scopes][attributes]
   */
  async getAll(opts: Opts = {}) {
    const opt = this._init(opts);
    return await this.model.scope(opt.scopes).findAll(opt);
  };
  /**
   * 获取分页列表
   * @description query包含 limit/offset/where/order
   * @param opts [t][query][scopes][attributes]
   */
  async getList(opts: Opts = {}) {
    const opt = this._init(opts);
    return await this.model.scope(opt.scopes).findAndCountAll(opt);
  };
  /**
   * 获取记录详情
   * @param query where条件或id
   * @param opts [t][scopes][attributes]
   */
  async get(query, opts: Opts = {}) {
    const opt = this._init(opts);
    if (typeof query === 'number' || /^\d+$/.test(query)) {
      return await this.model.scope(opt.scopes).findById(query, opt);
    } else {
      return await this.model.scope(opt.scopes).findOne({ where: query }, opts);
    }
  };
}

export default BaseBLL;