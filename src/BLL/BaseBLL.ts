import * as _ from 'lodash';
import models from '../models';
/**
 * t: transaction
 * query: limit/offset/where/order/search
 * where: 同query的where
 * scopes: include数组
 * attributes: include或exclude数组
 */
interface Opts {
  t?: any;
  transaction?: any;
  query?: any;
  where?: any;
  scopes?: any;
  attributes?: any;
  distinct?: string;
}
/**
 * 设计说明: 继承类尽可能不重写方法
 * 1.采取opts的参数方式: 事物t/关联查询scopes/属性attributes/分页limit,offset/查询order,where
 * 2.model和models成员变量
 * 3.
 * TODO:
 * 1.transaction 等参数为null 有什么影响? findxxx()里多了scopes
 * 2.多重事物与多次传递opts(主要是t->transaction)
 * 3.只是基础功能, 复杂的要重写
 * 4.排序的字段是model中有的
 */
class BaseBLL {
  model: any;
  models = models;
  attributes = new Set();
  /**
   * 处理转化参数
   * @param opts 对象处理转换[t][where][query:where,limit,offset,order][scopes][attributes]
   */
  _init(opts: Opts) {
    const opt: any = {};
    // 允许多次调用_init()
    opts = _.cloneDeep(opts);
    opt.transaction = _.isNil(opts.t) ? null : opts.t;
    if (opts.transaction) {
      opt.transaction = opts.transaction;
    }
    opt.scopes = _.isArray(opts.scopes) ? opts.scopes : [];
    opt.where = _.isNil(opts.where) ? {} : opts.where;
    if (_.isNil(opts.where)) {
      opt.where = {};
    } else if (_.isObject(opts.where)) {
      opt.where = opts.where;
    } else if (/^\d+$/.test(opts.where)) {
      opt.where = { id: opts.where };
    }
    // 指定要返回的字段数组,或指定不返还的字段exclude数组
    if (_.isArray(opts.attributes)) {
      opt.attributes = [];
      const exclude = [];
      opts.attributes.forEach((attr) => {
        if (/^[!]/.test(attr) && this.attributes.has(attr.substr(1))) {
          exclude.push(attr.substr(1));
        } else if (this.attributes.has(attr)) {
          opt.attributes.push(attr);
        }
      });
      if (exclude.length !== 0) {
        opt.attributes = { exclude };
      }
    }
    // 笛卡尔积重复的问题
    if (_.isString(opts.distinct) && this.attributes.has(opts.distinct)) {
      opt.include = [];
      opt.distinct = true;
      opt.col = opts.distinct;
    }
    // id或paging()生成的query有limit where offset order
    // order排序
    if (_.isObject(opts.query)) {
      // req.paging()生成的多余的
      delete opts.query.page;
      // 合并内层和外层的where
      if (_.isObject(opts.query.where)) {
        _.assign(opt.where, opts.query.where);
        delete opts.query.where;
      }
      // 指定列与排除列
      _.assign(opt, opts.query);
      if (_.isString(opts.query.order)) {
        opts.query.order = [].push(opts.query.order);
      }
      // 排序字段验证
      if (_.isArray(opts.query.order)) {
        opt.order = [];
        opts.query.order.forEach((item) => {
          if (_.isString(item)) {
            const order = item.split('-');
            if (this.attributes.has(order[0]) && ['DESC', 'ASC'].indexOf(order[1]) !== -1) {
              opt.order.push(order);
            }
          } else if (_.isArray(item)) {
            opt.order.push(item);
          }
        });
      }
    }
    return opt;
  }
  /**
   * 获取model的属性数组
   */
  getAttributes() {
    return this.model.getAttributes();
  }
  /**
   * 创建
   * @param data 数据
   * @param [t] 事物
   */
  async create(data, t = {}) {
    const res = await this.model.create(data, t);
    return res;
  };
  /**
   * 删除数据
   */
  async destroy(opts: Opts) {
    const opt = _.pick(this._init(opts), ['where', 'transaction']);
    return await this.model.destroy(opt);
  };
  /**
   * 修改记录
   * @param data 数据
   * @param opts [t][query][scopes][attributes]
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