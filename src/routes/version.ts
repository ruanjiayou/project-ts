import { thrower } from '../libs';
import { version } from '../configs';

const debug = require('debug')('APP:VERSION_ROUTE');

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