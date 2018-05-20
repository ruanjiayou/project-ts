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
  // 表间的关系
  model.associate = (models) => {

  }
  // 表的初始化数据
  model.seed = async () => {
    const data = [
      { name: '阮家友', phone: '18972376482', password: '123456', openid: 'o00of5cIW4aO89ZLRI10c7sBRK6A', token: 'e4323d96392c3de36dce89500fc6a8152985e7b8b3f546c9adc98d7245e2556b' }
    ];
    await model.bulkCreate(data);
  }
  // instance method
  //TODO: password是前段的md5加密,这里要加一层sha256加密,虽然彩虹表
  model.prototype.comparePSW = function (password) {
    const res = this.dataValues;
    const salt = res.salt;
    return res.password === password;
  };
  model.prototype.calculatePSW = function (password, salt) {
    return password;
  }
  return model;
}