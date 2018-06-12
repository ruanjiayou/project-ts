// import * as _ from 'lodash';
// import { loader } from '../libs/loader';

// const BLL: any = {};
// loader(
//   (info) => {
//     const modules = require(`${info.dir}/${info.filename}${info.ext}`).default;
//     _.assign(BLL, modules);
//   }, {
//     dir: __dirname
//   }
// );
// export { BLL };

import BaseBLL from './BaseBLL';
import UserBLL from './UserBLL';
export {
  BaseBLL,
  UserBLL
}

// global.$BLLs = {
//   BaseBLL,
//   UserBLL
// }