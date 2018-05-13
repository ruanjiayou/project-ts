export default (sequelize, DataTypes) => {
  const model = sequelize.define('AdminRole', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comments: '角色名称'
    }
  }, {
      freezeTableName: true,
      underscoreAll: true,
      tableName: 'admin_role',
      charset: 'utf8',
      initialAutoIncrement: 1,
      timezone: '+08:00',
      paranoid: false,
      timestamps: false,
      indexes: []
    });
  // 表间的关系
  model.associate = (models) => {
    // 中间表要点: belongsToMany() 要有as,through里也要as
  }
  // 类级方法
  // 表的初始化数据
  model.seed = async () => {
    const data = [
      { name: '超级管理员' },
      { name: '普通管理员' }
    ];
    await model.bulkCreate(data);
  }
  return model;
  // 实例方法 prototype
};