import libs from '../libs';
import configs from '../configs';
import * as Debug from 'debug';

const debug = Debug('APP:VERSION_ROUTE');
const throwHinter = libs.throwHinter;
const version = configs.version;

export = {
  'use /:version(v[0-9]+)/*': async (req, res, next) => {
    debug(`ENTER ${req.method} ${req.originalUrl} ROUTE`);
    if (version[req.params.version] === true) {
      next();
    } else {
      next(throwHinter('common', 'versionNotFound'));
    }
  }
}