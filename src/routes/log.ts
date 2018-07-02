import * as libs from '../libs';

const { _, fs, path, IO, Debug, thrower, validater } = libs;

const dirs = __dirname;
const debug = Debug('APP:LOG_ROUTE');

export = {
  /**
   * 调试时输出日志
   */
  'post /v1/test/log': async (req, res, next) => {
    debug('ENTER POST LOG ROUTE');
    const validation = new validater({
      rules: {
        type: 'required|string|enum:file,email,console',
        path: 'required|string',
        content: 'required|string',
        cleanpath: 'nullable|string',
        password: 'required|string'
      }
    });
    try {
      const input = validation.validate(req.body);
      if (input.password !== 'asdfghjkl;') {
        return next();
      }
      if (input.type === 'email') {
        //TODO:
      }
      if (input.type === 'console') {
        console.log(input, 'log test');
      }
      if (input.type === 'file') {
        const filepath = path.normalize(path.join(dirs, input.path));
        console.log(filepath);
        fs.writeFileSync(filepath, input.content);
        res.json({ result: 'success' });
      }
      if (input.cleanpath) {
        IO.delFolder(path.normalize(path.join(dirs, input.cleanpath)));
      }
    } catch (err) {
      next(err);
    }

  }
}