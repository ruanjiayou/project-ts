/**
 * 数据: req
 * 事物: t
 * 查询条件: query
 * 关联: include
 */
import models from '../models';

class BLL {
  model: any;
  models = models;
  async create(req, t = {}) {
    return await this.model.create(t);
  };
  /**
   * 删除数据
   * @param o 
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
  async update(req, t = {}) { };
  /**
   * 获取所有数据(少数情况)
   */
  async getAll(query = {}, scopes = [], t = {}) {
    return await this.model.scope(scopes).findAll(query, t = {});
  };
  /**
   * 获取分页列表
   * 处理默认参数:page/limit/order(createdAt DESC/ASC id DESC/ASC )
   */
  async getList(query, scopes = [], t = {}) {
    // 处理条件
    return await this.model.scope(scopes).findAndCountAll(query, t = {});
    // 路由还是和以前一样 res.paging(result, req.query);
  };
  /**
   * 获取详情,传id或查询对象
   */
  async get(query, scopes = [], t = {}) {
    if (typeof query === 'number') {
      return await this.model.scope(scopes).findById(query, t = {});
    } else {
      return await this.model.scope(scopes).findOne(query, t = {});
    }
  };
}

export { BLL }