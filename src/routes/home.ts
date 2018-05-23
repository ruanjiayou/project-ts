export = {
  'GET /*': async (req, res, next) => {
    res.writeHead(200, { 'Content-Type': 'text/plain;charset=UTF-8' });
    res.end('Hello World\n仅供测试,请删除此条路由!');
  }
}