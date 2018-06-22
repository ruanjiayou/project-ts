// import * as _ from 'lodash';
// import { loader } from '../libs/loader';

// const libs: any = {};

// loader(
//   (info) => {
//     if (__filename !== info.fullpath) {
//       _.assign(libs, require(info.fullpath));
//     }
//   }, {
//     dir: __dirname
//   }
// );
// export default libs;

import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import * as moment from 'moment';
import * as Debug from 'debug';
import { auth } from './auth';
import { i18n } from './i18n';
import { loader } from './loader';
import { logger } from './logger';
import { sendMail } from './postman';
import { presenter } from './presenter';
import { shttp } from './shttp';
import { thrower, CustomError } from './thrower';
import { txCos } from './txCos';
import { uploader, storer } from './uploader';
import { validater } from './validater';
import { wxHelper, wxPayHelper } from './wxHelper';
import { IO } from './io';
import { excelHelper } from './excelHelper';
import { smsHelper } from './smsHelper';

export {
  _,
  fs,
  path,
  moment,
  Debug,
  auth,
  i18n,
  loader,
  logger,
  sendMail,
  presenter,
  shttp,
  thrower,
  CustomError,
  txCos,
  uploader,
  storer,
  validater,
  wxHelper,
  wxPayHelper,
  IO,
  excelHelper,
  smsHelper
}