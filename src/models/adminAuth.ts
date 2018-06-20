export default (sequelize, DataTypes) => {
  const model = sequelize.define('AdminAuth', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    authId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
      freezeTableName: false,
      underscoredAll: true,
      tableName: 'admin_auth',
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
    // model.belongsTo(models.Admin, {
    //   targetKey: 'id',
    //   foreignKey: 'adminId'
    // });
    // model.belongsTo(models.Auth, {
    //   targetKey: 'id',
    //   foreignKey: 'authId'
    // });
  }
  // 表的初始化数据
  model.seed = async () => {
    const data = [
      { adminId: 1, authId: 1 },
      { adminId: 1, authId: 2 },
      { adminId: 1, authId: 3 },
      { adminId: 1, authId: 4 }
    ];
    await model.bulkCreate(data);
  }
  // instance method

  return model;
}