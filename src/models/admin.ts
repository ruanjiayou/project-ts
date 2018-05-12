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
      defaultValue: '',
      unique: true,
      allowNull: false
    },
    unionid: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    }
  }, {
      freezeTableName: true,
      tableName: 'admin',
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
    // 中间表要点: belongsToMany() 要有as,through里也要as
  }
  // 表的初始化数据
  model.seed = async () => {
    const data = [
      { name: 'ruanjiayou', phone: '18972376482', token: '123456' }
    ];
    await model.bulkCreate(data);
  }
  return model;
}