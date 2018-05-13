export default (sequelize, DataTypes) => {
  const model = sequelize.define('AdminMenu', {
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
      freezeTableName: true,
      underscoreAll: true,
      tableName: 'admin_menu',
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
      { name: '添加管理员' }
    ];
    await model.bulkCreate(data);
  }
  return model;
  // 实例方法 prototype
};