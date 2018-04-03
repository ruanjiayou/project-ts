export default (sequelize, DataTypes) => {
  const model = sequelize.define('Share', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    shareOpenid: {
      type: DataTypes.STRING,
      allowNull: false,
      comments: '分享人openid'
    },
    acceptOpenid: {
      type: DataTypes.STRING,
      allowNull: false,
      comments: '接受人openid'
    }
  }, {
      freezeTableName: true,
      tableName: 'share',
      charset: 'utf8',
      initialAutoIncrement: 1,
      timezone: '+08:00',
      paranoid: false,
      timestamps: true,
      updatedAt: false,
      indexes: [
        { fields: ['shareOpenid'], name: 'shareOpenid' },
        { fields: ['acceptOpenid'], name: 'acceptOpenid' }
      ],
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
    const data = [];
    await model.bulkCreate();
  }
  return model;
}