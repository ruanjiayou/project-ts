const shttp = require('net-helper').shttp;

module.export = {
  signin: () => {
    let result = null;
    await shttp
      .post(`${apiPath}/auth/assistant/login`)
      .send({ code: '123456' })
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
      .post(`${apiPath}/auth/assistant/sign-up`)
      .send({
        name: 'assistant',
        IDCard: '421224',
        phone: '189',
        code: '123456'
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