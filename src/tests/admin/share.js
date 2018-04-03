const shttp = require('net-helper').shttp;

module.export = {
  list: () => {
    let result = null;
    await shttp
      .get(`${apiPath}/admin/share`)
      .end((err, res) => {
      });
    return result;
  }
}