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
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      comments: '头像'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comments: '手机号'
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      comments: '密码'
    },
    token: {
      type: DataTypes.STRING,
      defaultValue: '',
      comments: '鉴权令牌'
    },
    isSA: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comments: '是否是超级管理员'
    }
  }, {
      freezeTableName: false,
      underscoredAll: true,
      tableName: 'admin',
      charset: 'utf8',
      initialAutoIncrement: 1,
      timezone: '+08:00',
      paranoid: true,
      timestamps: true,
      indexes: [],
      scopes: {
        includeAdminAuth: function () {
          return {
            include: [
              {
                model: sequelize.models.Auth,
                attributes: ['id', 'name'],
                through: {
                  model: sequelize.models.AdminAuth
                }
              }
            ]
          }
        }
      }
    });
  // class method
  // 表间的关系
  model.associate = (models) => {
    model.belongsToMany(models.Auth, {
      foreignKey: 'adminId',
      otherKey: 'authId',
      through: {
        model: models.AdminAuth,
        as: 'adminAuth'
      }
    });
  }
  // 表的初始化数据
  model.seed = async () => {
    const data = [
      { name: 'ruanjiayou', phone: '18972376482', password: '123456', token: '123456', isSA: true }
    ];
    await model.bulkCreate(data);
  }
  // instance method
  /**
   * 密码对比:TODO:直接对比改为sha1加随机盐,前端传md5
   */
  model.prototype.auth = function (password) {
    const res = this.dataValues;
    return res.password === password;
  };
  model.prototype.createToken = () => {
    return new Date().getTime().toString();
  };
  return model;
}