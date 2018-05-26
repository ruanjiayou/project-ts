const crypto = require('crypto');

export default (sequelize, DataTypes) => {
  const model = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      comments: '名字'
    },
    openid: {
      type: DataTypes.STRING,
      allowNull: true
    },
    authority: {
      type: DataTypes.STRING,
      allowNull: true,
      comments: '就是openid的sha256?'
    },
    signature: {
      type: DataTypes.STRING,
      allowNull: true,
      comments: 'jwt'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      comments: '手机号'
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '123456',
      comments: '密码'
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '123456789abcdefg',
      comments: '随机盐'
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      comments: '头像'
    }
  }, {
      freezeTableName: false,
      underscoredAll: true,
      tableName: 'user',
      charset: 'utf8',
      initialAutoIncrement: 1,
      timezone: '+08:00',
      paranoid: false,
      timestamps: true,
      indexes: []
    });
  // class method
  model.calculatePSW = function (password, salt) {
    const hmac = crypto.createHmac('sha1', salt);
    hmac.update(password.toUpperCase());
    return hmac.digest('hex').toUpperCase();
  }
  // 表间的关系
  model.associate = (models) => {

  }
  // 表的初始化数据
  model.seed = async () => {
    // 密码是123456的md5加密
    const data = [
      { name: '阮家友', phone: '18972376482', password: 'E10ADC3949BA59ABBE56E057F20F883E', openid: 'o00of5cIW4aO89ZLRI10c7sBRK6A', token: 'e4323d96392c3de36dce89500fc6a8152985e7b8b3f546c9adc98d7245e2556b' }
    ];
    await model.bulkCreate(data);
  }
  // instance method
  model.prototype.comparePSW = function (password) {
    const hmac = crypto.createHmac('sha1', this.salt);
    hmac.update(password);
    return this.password === hmac.digest('hex').toUpperCase();
  };
  return model;
}