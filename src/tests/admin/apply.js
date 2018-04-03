const shttp = require('net-helper').shttp;

module.export = {
  list: () => {
    let result = null;
    await shttp
      .get(`${apiPath}/admin/apply`)
      .query({ date: '2018-04-01' })
      .end((err, res) => {
      });
    return result;
  },
  show: () => {
    let result = null;
    await shttp
      .get(`${apiPath}/admin/apply/1`)
      .end((err, res) => {
        if (err) {
          throw err;
        } else {
          result = res;
        }
      });
    return result;
  },
  update: () => {
    let result = null;
    await shttp
      .put(`${apiPath}/admin/apply/1`)
      .send({ status: 'success' })
      .end((err, res) => {
        if (err) {
          throw err;
        } else {
          result = res;
        }
      });
    return result;
  }
}