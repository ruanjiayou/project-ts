import libs from '../libs';
import configs from '../configs';
import * as Debug from 'debug';

const debug = Debug('APP:VERSION_ROUTE');
const thrower = libs.thrower;
const version = configs.version;

export = {
  'use /:version(v[0-9]+)/*': async (req, res, next) => {
    debug(`enter USE ${req.originalUrl} route`);
    if (version[req.params.version] === true) {
      next();
    } else {
      next(thrower('common', 'versionNotFound'));
    }
  }
}