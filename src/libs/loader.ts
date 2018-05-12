import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';

interface Opts {
  dir: string;
  recusive?: boolean;
  filter?: string[];
}
/**
 * 
 * @param cb 回调函数
 * @param opts 参数对象
 */
function loader(cb, opts: Opts) {
  const defaults = {
    recusive: false,
    filter: ['.js', '.json']
  };
  for (let k in defaults) {
    if (_.isUndefined(opts[k])) {
      opts[k] = defaults[k];
    }
  }
  scanner(opts.dir, cb, opts.filter, opts.recusive);
}
/**
 * 扫描目录
 * @param dir 目录
 * @param cb 回调函数
 * @param filter 过滤器
 * @param recusive 是否扫描子文件夹
 */
function scanner(dir, cb, filter, recusive) {
  fs.readdirSync(dir).forEach(file => {
    const fullpath = path.join(dir, file);
    const ext = path.extname(file).toLocaleLowerCase();
    const filename = file.substr(0, file.length - ext.length);
    if (recusive && fs.existsSync(fullpath) && fs.lstatSync(fullpath).isDirectory()) {
      // 遍历目录
      scanner(fullpath, cb, filter, recusive);
    } else if (filter.indexOf(ext) !== -1) {
      // js文件
      cb({
        fullpath, dir, filename, ext
      });
    }
  })
}

export { loader }