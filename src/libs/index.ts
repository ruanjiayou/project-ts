import * as _ from 'lodash';
import { loader } from '../libs/loader';

const libs: any = {};

loader(
  (info) => {
    if (__filename !== info.fullpath) {
      _.assign(libs, require(info.fullpath));
    }
  }, {
    dir: __dirname
  }
);
export default libs;