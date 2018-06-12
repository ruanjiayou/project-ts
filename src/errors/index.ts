import * as  fs from 'fs';
const path = require('path');
const dir = path.join(__dirname, 'routes');
const extension = '.js';

/**
 * 扫描父文件夹下的所有语言版本的错误提示json
 * @param dirname 
 */
function scanDir(dirname) {
  const errors = [];
  fs.readdirSync(dirname).forEach((file) => {
    let fullname = path.join(dirname, file);
    let ext = path.extname(file);
    if (fs.existsSync(fullname) && fs.lstatSync(fullname).isDirectory()) {
      // 加载语言文件夹下的所有文件
      errors[file] = scanFile(fullname);
    }
  });
  return errors;
}

/**
 * 加载语言文件夹下的所有文件
 * @param dirname 语言文件夹
 * @returns errLang JSON对象
 */
function scanFile(dirname) {
  const errLang = {};
  fs.readdirSync(dirname).forEach((file) => {
    let fullname = path.join(dirname, file);
    let ext = path.extname(file);
    let filename = file.substr(0, file.length - ext.length);
    if (fs.existsSync(fullname) && !fs.lstatSync(fullname).isDirectory() && fullname !== module.filename && ext.toLowerCase() === extension) {
      errLang[filename] = require(fullname);
    }
  });
  return errLang;
}

module.exports = scanDir(__dirname);