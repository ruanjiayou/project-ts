import * as schedule from 'node-schedule';

const Task = schedule.scheduleJob;

const task = Task('5 * * * * *', () => {
  console.log('test');
});

export default task;