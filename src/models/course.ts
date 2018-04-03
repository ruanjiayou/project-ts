export default (sequelize, DataTypes) => {
  const model = sequelize.define('Course', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    schoolId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comments: '教学点id'
    },
    students: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comments: '参与课程学生人数'
    },
    assistants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comments: '参与课程老师人数'
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comments: '课程日期'
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      comments: '课程开始时间'
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: null,
      comments: '课程结束时间'
    }
  }, {
      freezeTableName: true,
      tableName: 'course',
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
    model.belongsTo(models.School, {
      foreignKey: 'schoolId'
    });
  }
  // 表的初始化数据
  model.seed = async () => {
    const data = [];
    await model.bulkCreate(data);
  }
  return model;
}