export default (sequelize, DataTypes) => {
  const model = sequelize.define('School', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comments: '教学点名称'
    },
    limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      comments: '教学点最大学生数量'
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      comments: '教学点地址'
    },
    detail: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      comments: '详细地址'
    }
  }, {
      freezeTableName: true,
      tableName: 'school',
      charset: 'utf8',
      initialAutoIncrement: 1,
      timezone: '+08:00',
      paranoid: true,
      timestamps: true,
      indexes: [],
      classMethods: {
        associate: (models) => {

        },
        seed: () => {

        }
      }
    });
  // 表间的关系
  model.associate = (models) => {

  }
  // 表的初始化数据
  model.seed = async () => {
    const data = [
      { name: '硚口区教学点', limit: 10, address: '武汉硚口区古田二路', detail: '国际汇丰A3栋402' }
    ];
    await model.bulkCreate(data);
  }
  return model;
}