export default (sequelize, DataTypes) => {
  const model = sequelize.define('AdminSession', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    token: {
      type: DataTypes.STRING,
      defaultValue: '',
      comments: '鉴权令牌'
    },
    freshToken: {
      type: DataTypes.STRING,
      defaultValue: '',
      comments: '刷新token的token'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comments: '手机号'
    }
  }, {
      freezeTableName: true,
      underscoreAll: true,
      tableName: 'admin_session',
      charset: 'utf8',
      initialAutoIncrement: 1,
      timezone: '+08:00',
      paranoid: false,
      timestamps: true,
      updatedAt: false,
      indexes: []
    });
  // 表间的关系
  model.associate = (models) => {
    // 中间表要点: belongsToMany() 要有as,through里也要as
    model.belongsTo(models.Admin, {
      foreignKey: 'adminId'
    });
  }
  // 类级方法
  // 表的初始化数据
  model.seed = async () => {
    const data = [];
    await model.bulkCreate(data);
  }
  return model;
  // 实例方法 prototype
};