import * as _ from 'lodash';
import { loader } from '../libs/loader';

const configs: any = {};

loader(
  (info) => {
    if (__filename !== info.fullpath) {
      const modules = require(info.fullpath);
      _.assign(configs, modules);
    }
  }, {
    dir: __dirname
  }
);

export default configs;