import { upload } from '../configs';
import { IO } from './io';

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

//TODO:用file signature检查文件头而不只是拓展名
function storer(dir, file): string {
  const folder = path.join(upload.localPath, dir);
  const filename = '';
  let key = '', fullpath = '', ext = path.extname(file.originalname).substring(1).toLowerCase();
  IO.mkdirs(`${upload.localPath}/${dir}`);
  do {
    key = IO.GUID();
    fullpath = `${upload.localPath}/${dir}/${key}.${ext}`;
  } while (IO.isFileExists(fullpath));
  const oldpath = path.join(file.destination, file.filename);
  fs.renameSync(oldpath, fullpath);
  return `/${dir}/${key}.${ext}`;
}

export { uploader, storer }