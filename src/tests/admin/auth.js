const shttp = require('net-helper').shttp;

module.export = {
  signin: () => {
    let result = null;
    await shttp
      .post(`${apiPath}/auth/admin/login`)
      .send({ code: '' })
      .end(function (err, res) {
        if (err) {
          throw err;
        } else {
          result = res;
        }
      });
    return result;
  },
  signup: () => {
    let result = null;
    await shttp
      .post(`${apiPath}/auth/admin/sign-up`)
      .send({
        name: '',
        phone: '',
        IDCard: ''
      })
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