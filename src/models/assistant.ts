export default (sequelize, DataTypes) => {
  const model = sequelize.define('Assistant', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    IDCard: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comments: '身份证号'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comments: '助教姓名',
      character: 'uft8mb4'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comments: '手机号'
    },
    token: {
      type: DataTypes.STRING,
      defaultValue: '',
      comments: '鉴权令牌'
    },
    openid: {
      type: DataTypes.STRING,
      defaultValue: null,
      unique: true,
      allowNull: true
    },
    unionid: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comments: '是否通过审核'
    }
  }, {
      freezeTableName: true,
      tableName: 'assistant',
      charset: 'utf8',
      initialAutoIncrement: 1,
      timezone: '+08:00',
      paranoid: true,
      timestamps: true,
      indexes: [
        { fields: ['openid'], name: 'openid' }
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