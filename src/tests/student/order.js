const shttp = require('net-helper').shttp;

module.export = {
  create: () => {
    let result = null;
    await shttp
      .post(`${apiPath}/student/order`)
      .send({
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
      .get(`${apiPath}/student/order`)
      .query({ date: '2018-04-01' })
      .end((err, res) => {
      });
    return result;
  }
}