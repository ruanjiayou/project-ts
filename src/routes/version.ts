import libs from '../libs';
import configs from '../configs';
import * as Debug from 'debug';

const debug = Debug('APP:VERSION_ROUTE');
const Hinter = libs.hinter;
const version = configs.version;

export = {
  'use /:version(v[0-9]+)/*': async (req, res, next) => {
    debug('ENTER USE version ROUTE');
    if (version[req.params.version] === true) {
      next();
    } else {
      next(new Hinter('common', 'versionNotFound'));
    }
  }
}