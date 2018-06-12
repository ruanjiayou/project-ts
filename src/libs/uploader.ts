import { upload } from '../configs';

const fs = require('fs');
const path = require('path');
const multer = require('multer');
// 上传路径处理 ,上传文件重命名
const storage = multer.diskStorage({
  // 上传路径处理
  destination: upload.dest,
  // filename: function (req, file, cb) {  // file上传的文件信息, callback 重命名处理
  //     //return cb(null, `${io.GUID()}.${mime.extension(file.mimetype)}`);
  // }
});

const fileFilter = function (req, file, cb) {
  const exts = new Set(['ics', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'rtf', 'html', 'zip', 'mp3', 'wma', 'mpg', 'flv', 'avi', 'jpg', 'jpeg', 'png', 'gif']);
  // file.mimetype === 'image/gif'
  let ext = path.extname(file.originalname).substring(1).toLowerCase();
  // 是否是允许的类型
  cb(null, exts.has(ext));
};

let uploader = multer({
  // 上传文件路径,名字设置
  storage: storage,
  limits: upload.limits, //限制文件的大小
  fileFilter: fileFilter //文件的类型, 过滤
}).fields(upload.fields);

/**
 * 判断文件是否存在
 * @param {string} path - 文件路径
 * @return {boolean} - true 文件存在 false 文件不存在
 */
function isFileExists(path) {
  return fs.existsSync(path) && !fs.lstatSync(path).isDirectory();
}

/**
 * 创建文件夹
 * @param {string|array} dir 文件夹
 * @returns {boolean} 是否创建成功
 */
function mkdirs(dir) {
  if (dir instanceof Array) {
    dir = dir.join('/');
  }
  dir = dir.replace(/[/]+|[\\]+/g, '/');
  try {
    if (!fs.existsSync(dir)) {
      var pathtmp = '';
      dir = dir.split('/');
      dir.forEach(function (dirname) {
        pathtmp += pathtmp === '' ? dirname : '/' + dirname;
        if (false === fs.existsSync(pathtmp)) {
          fs.mkdirSync(pathtmp);
        }
      });
    }
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
}

/**
 * 生成16位长度的GUID
 */
function GUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }).toUpperCase();
};
//TODO:用file signature检查文件头而不只是拓展名
function storer(dir, file): string {
  const folder = path.join(upload.localPath, dir);
  const filename = '';
  let key = '', fullpath = '', ext = path.extname(file.originalname).substring(1).toLowerCase();
  mkdirs(`${upload.localPath}/${dir}`);
  do {
    key = GUID();
    fullpath = `${upload.localPath}/${dir}/${key}.${ext}`;
  } while (isFileExists(fullpath));
  const oldpath = path.join(file.destination, file.filename);
  fs.renameSync(oldpath, fullpath);
  return `/${dir}/${key}.${ext}`;
}

export { uploader, storer }