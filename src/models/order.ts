export default (sequelize, DataTypes) => {
  const model = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comments: '课程id'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comments: '学生id或助教id'
    },
    type: {
      type: DataTypes.ENUM('student', 'assistant'),
      allowNull: false,
      defaultValue: 'student',
      comments: '预约人的类型'
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'fail'),
      defaultValue: 'pending',
      comments: '预约状态,针对学生有效'
    },
    isFree: {
      type: DataTypes.BOOLEAN,
      comments: '是否是免费的预约,针对学生有效'
    }
  }, {
      freezeTableName: true,
      tableName: 'order',
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
      },
      scopes: {
        includeCourse: function (opts) {
          console.log(opts, 'includeCourse');
          return {
            include: [
              {
                model: sequelize.models.Course, as: 'course',
                attributes: ['id', 'schoolId', 'students', 'date', 'startTime', 'endTime'],
                where: opts
              }
            ]
          }
        }
      }
    });
  // 表间的关系
  model.associate = (models) => {
    model.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' });
    // userId代表studentId或assistantId,要在逻辑层面控制
  }
  // 表的初始化数据
  model.seed = async () => {
    const data = [];
    await model.bulkCreate(data);
  }
  return model;
}