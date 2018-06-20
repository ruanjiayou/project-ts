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
    token: {
      type: DataTypes.STRING,
      allowNull: true,
      comments: 'authority & signature'
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: true
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
    hmac.update(password);
    return hmac.digest('hex');
  }
  // 表间的关系
  model.associate = (models) => {

  }
  // 表的初始化数据
  model.seed = async () => {
    // 密码是123456的md5加密 E10ADC3949BA59ABBE56E057F20F883E salt是 1529233934395 password是 b24a721a0fdd13ff0576933352dc078bbc75514c
    const data = [
      { name: '阮家友', phone: '18972376482', password: 'b24a721a0fdd13ff0576933352dc078bbc75514c', salt: '1529233934395', openid: 'o00of5cIW4aO89ZLRI10c7sBRK6A' }
    ];
    await model.bulkCreate(data);
  }
  // instance method
  model.prototype.comparePSW = function (password) {
    return this.password === model.calculatePSW(password, this.salt);
  };
  model.prototype.toJSON = function () {
    const res = this.dataValues;
    return res;
  };
  return model;
}