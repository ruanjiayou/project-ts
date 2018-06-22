// import * as _ from 'lodash';
// import { loader } from '../libs/loader';

// const configs: any = {};

// loader(
//   (info) => {
//     if (__filename !== info.fullpath) {
//       const modules = require(info.fullpath);
//       _.assign(configs, modules);
//     }
//   }, {
//     dir: __dirname
//   }
// );

// export default configs;

import { auth } from './auth';
import { email } from './email';
import { env } from './env';
import { log } from './log';
import { mysql } from './mysql';
import { redis } from './redis';
import { system } from './system';
import { txCos } from './txCos';
import { upload } from './upload';
import { version } from './version';
import { aliSms } from './aliSms';

export {
  auth,
  email,
  env,
  log,
  mysql,
  redis,
  system,
  txCos,
  upload,
  version,
  aliSms
}