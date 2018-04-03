const shttp = require('net-helper').shttp;

module.export = {
  list: () => {
    let result = null;
    await shttp
      .get(`${apiPath}/admin/order`)
      .query({ date: '2018-04-01' })
      .end((err, res) => {
      });
    return result;
  }
}