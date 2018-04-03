const shttp = require('net-helper').shttp;

module.export = {
  list: () => {
    let result = null;
    await shttp
      .get(`${apiPath}/admin/school`)
      .end((err, res) => {
      });
    return result;
  },
  show: () => {
    let result = null;
    await shttp
      .get(`${apiPath}/admin/school/1`)
      .end((err, res) => {
      });
    return result;
  },
  create: () => {
    let result = null;
    await shttp
      .post(`${apiPath}/admin/school`)
      .send({
        name: '',
        address: '',
        detail: ''
      })
      .end((err, res) => {
      });
    return result;
  },
  update: () => {
    let result = null;
    await shttp
      .put(`${apiPath}/admin/school/1`)
      .send({})
      .end((err, res) => {
      });
    return result;
  }
}