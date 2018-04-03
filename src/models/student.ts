export default (sequelize, DataTypes) => {
  const model = sequelize.define('Student', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comments: '学生姓名'
    },
    age: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      comments: '年龄'
    },
    school: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
      comments: '学生的学校名称'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comments: '学生或家长的手机号'
    },
    defaultFree: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 5,
      comments: '默认免费次数'
    },
    shareFree: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comments: '通过分享获得的免费听课次数'
    },
    cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comments: '已使用的免费次数,不能大于free次数'
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
    },
    isVIP: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comments: '用于付费用户判断'
    }
  }, {
      freezeTableName: true,
      tableName: 'student',
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

        },
        defaultFree: 5
      },
      hooks: {
        beforeCreate: (student, options) => {
          //student.defaultFree = model.defaultFree;
        }
      }
    });
  // 表间的关系
  model.associate = (models) => {

  }
  // 表的初始化数据
  model.seed = async () => {
    const data = [];
    await model.bulkCreate(data);
  }
  return model;
}