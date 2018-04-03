export default (sequelize, DataTypes) => {
  const model = sequelize.define('Apply', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('student', 'assistant'),
      allowNull: false,
      comments: '申请类型(助教和学生)'
    },
    applicantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comments: '申请人id(分为studentId和assistantId,分布在两个表)'
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'fail'),
      defaultValue: 'pending',
      comments: '申请状态'
    },
    description: {
      type: DataTypes.STRING,
      defaultValue: '',
      comments: '申请失败原因'
    }
  }, {
      freezeTableName: true,
      tableName: 'apply',
      charset: 'utf8',
      initialAutoIncrement: 1,
      timezone: '+08:00',
      paranoid: false,
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
    const data = [];
    await model.bulkCreate();
  }
  return model;
}