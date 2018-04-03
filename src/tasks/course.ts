process.env.NODE_ENV = 'dev';
import * as cron from 'cron';
import * as moment from 'moment';
import * as Debug from 'debug';
import models from '../models';

const Task = cron.CronJob;
const task = new Task('0 0 0 * * *', createCourse, null, true, 'Asia/Chongqing');
createCourse();
async function createCourse() {
  let today = moment();
  let lastDay = moment(today).add(14, 'd');
  let lastCourse = await models.Course.findOne({ limit: 1, order: [['id', 'DESC']] });
  if (lastCourse) {
    today = moment(lastCourse.get({ plain: true }).date, 'YYYY-MM-DD').add(1, 'd');
  }
  // 根据日期自动生成课程
  // 1.最晚两星期后LastTime 2.最先当天或course表最后一天 3.循环创建
  while (today.toDate().getTime() < lastDay.toDate().getTime()) {
    if (today.day() < 5) {
      await models.Course.create({ schoolId: 1, date: today.format('YYYY-MM-DD'), startTime: '18:30:00', endTime: '20:30:00' });
    } else {
      await models.Course.bulkCreate([
        { schoolId: 1, date: today.format('YYYY-MM-DD'), startTime: '08:00:00', endTime: '10:00:00' },
        { schoolId: 1, date: today.format('YYYY-MM-DD'), startTime: '10:05:00', endTime: '12:05:00' },
        { schoolId: 1, date: today.format('YYYY-MM-DD'), startTime: '12:10:00', endTime: '14:10:00' },
        { schoolId: 1, date: today.format('YYYY-MM-DD'), startTime: '14:15:00', endTime: '16:15:00' },
        { schoolId: 1, date: today.format('YYYY-MM-DD'), startTime: '16:20:00', endTime: '18:20:00' },
        { schoolId: 1, date: today.format('YYYY-MM-DD'), startTime: '18:30:00', endTime: '20:30:00' },
      ]);
    }
    console.log(today.format('YYYY-MM-DD'), '创建这天的课程');
    today.add(1, 'd');
  }
  console.log('本天任务完成')
}

export default task;