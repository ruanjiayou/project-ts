export default (sequelize, DataTypes) => {
  const model = sequelize.define('Auth', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comments: '权限名称'
    }
  }, {
      freezeTableName: false,
      underscoredAll: true,
      tableName: 'auth',
      charset: 'utf8',
      initialAutoIncrement: 1,
      timezone: '+08:00',
      paranoid: false,
      timestamps: false,
      indexes: []
    });
  // class method
  // 表间的关系
  model.associate = (models) => {
    model.belongsToMany(models.Admin, {
      foreignKey: 'authId',
      otherKey: 'adminId',
      through: {
        model: models.AdminAuth,
        as: 'adminAuth'
      },
      as: 'auth'
    });
  }
  // 表的初始化数据
  model.seed = async () => {
    const data = [
      { name: '新车管理' },
      { name: '预约管理' },
      { name: '会员管理' },
      { name: '加盟管理' }
    ];
    await model.bulkCreate(data);
  }
  // instance method

  return model;
}