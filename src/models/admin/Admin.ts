import { auth } from '../../configs/auth';

const crypto = require('crypto');

export default (sequelize, DataTypes) => {
  const model = sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comments: '管理员姓名'
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comments: '手机号'
    },
    openid: {
      type: DataTypes.STRING,
      defaultValue: '',
      unique: true,
      allowNull: false
    },
    unionid: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '123456789abcdefg',
      comments: '随机盐'
    }
  }, {
      freezeTableName: true,
      tableName: 'admin',
      charset: 'utf8',
      initialAutoIncrement: 1,
      timezone: '+08:00',
      paranoid: true,
      timestamps: true,
      indexes: [
        { fields: ['openid'], name: 'openid' }
      ]
    });
  // 类级方法
  // 表间的关系
  model.associate = (models) => {
    // 中间表要点: belongsToMany() 要有as,through里也要as
  }
  // 表的初始化数据
  model.seed = async () => {
    const data = [
      { name: 'ruanjiayou', phone: '18972376482', openid: 'abc' }
    ];
    await model.bulkCreate(data);
  }
  // 实例方法
  model.prototype.comparePSW = password => {
    const hmac = crypto.createHmac('sha1', this.salt);
    hmac.update(password);
    return this.password === hmac.digest('hex').toUpperCase();
  }
  return model;
}