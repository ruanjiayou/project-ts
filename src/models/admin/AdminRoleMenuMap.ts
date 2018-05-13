export default (sequelize, DataTypes) => {
  const model = sequelize.define('AdminRoleMenuMap', {}, {
    freezeTableName: true,
    underscoreAll: true,
    tableName: 'admin_role_menu_map',
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
    model.belongsTo(models.AdminRole, {
      foreignKey: 'adminRoleId'
    });
    model.belongsTo(models.AdminMenu, {
      foreignKey: 'adminMenuId'
    });
  }
  // 类级方法
  // 表的初始化数据
  model.seed = async () => {
    const data = [
      { adminRoleId: 1, adminMenuId: 1 }
    ];
    await model.bulkCreate(data);
  }
  return model;
  // 实例方法 prototype
};