const shttp = require('net-helper').shttp;

module.export = {
  create: () => {
    let result = null;
    await shttp
      .post(`${apiPath}/assistant/order`)
      .send({
        date: '201804-01',
        schoolId: 1,
        courseId: 1
      })
      .end(function (err, res) {
        if (err) {
          throw err;
        } else {
          result = res;
        }
      });
    return result;
  },
  list: () => {
    let result = null;
    await shttp
      .get(`${apiPath}/assistant/order`)
      .query({ date: '2018-04-01' })
      .end((err, res) => {
      });
    return result;
  }
}