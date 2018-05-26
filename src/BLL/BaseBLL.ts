import * as _ from 'lodash';
import models from '../models';

interface Opts {
  t?: any;
  query?: any;
  scopes?: any;
  attributes?: any;
}
/**
 * 设计说明: 继承类尽可能不重写方法
 * 1.采取opts的参数方式: 事物t/关联查询scopes/属性attributes/分页limit,offset/查询order,where
 * 2.model和models成员变量
 * 3.
 * TODO:
 * 1.transaction 等参数为null 有什么影响? findxxx()里多了scopes
 * 2.多重事物
 * 3.只是基础功能, 复杂的要重写
 * 4.排序的字段是model中有的
 */
class BaseBLL {
  model: any;
  models = models;
  /**
   * 
   * @param opts 对象处理转换[t][query:where,limit,offset,order][scopes][attributes]
   */
  _init(opts: Opts) {
    const opt: any = {};
    opt.transaction = _.isNil(opts.t) ? null : opts.t;
    opt.scopes = _.isNil(opts.scopes) ? [] : opts.scopes;
    // 指定要返回的字段数组,或指定不返还的字段exclude数组
    if (_.isArray(opts.attributes)) {
      opt.attributes = opts.attributes;
      const exclude = [];
      opt.attributes.forEach((attr: string) => {
        if (/^[!]/.test(attr)) {
          exclude.push(attr.substr(1));
        }
      });
      if (exclude.length !== 0) {
        opt.attributes = { exclude };
      }
    }
    // id或paging()生成的query有limit where offset order
    opt.where = {};
    // order排序
    if (_.isObject(opts.query)) {
      _.assign(opt, opts.query);
      if (_.isString(opt.order)) {
        opt.order = [].push(opt.order);
      }
      if (_.isArray(opt.order)) {
        opt.order = opt.order.map((item) => {
          return item.split('-');
        })
      }
    } else if (/^\d+$/.test(opts.query)) {
      opt.where['id'] = opts.query;
    }
    return opt;
  }
  getAttributes() {
    return this.model.getAttributes();
  }
  // 只有t参数
  async create(data, t = {}) {
    const res = await this.model.create(data, t);
    return res;
  };
  /**
   * 删除数据
   */
  async destroy(opts: Opts) {
    const opt = this._init(opts);
    return await this.model.destroy(opt);
  };
  /**
   * 修改记录
   * @param data 数据
   * @param opts [t][query]
   */
  async update(data, opts: Opts = {}) {
    const opt = this._init(opts);
    const res = await this.get(opts);
    if (!_.isNil(res)) {
      await res.update(data, opt);
    }
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
   * @param opts [t][scopes][attributes][query]
   */
  async get(opts: Opts = {}) {
    const opt = this._init(opts);
    return await this.model.scope(opt.scopes).findOne(opt);
  };
}

export default BaseBLL;