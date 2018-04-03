const shttp = require('net-helper').shttp;

module.export = {
  signin: () => {
    let result = null;
    await shttp
      .post(`${apiPath}/auth/student/login`)
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
      .post(`${apiPath}/auth/student/sign-up`)
      .send({

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