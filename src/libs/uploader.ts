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
/**
 * 保存文件到指定位置(随机文件名),返回信息对象
 * @param dir 保存目录,支持多级
 * @param file 文件对象
 */
function storer(dir, file) {
  const info: any = {
    root: upload.localPath,
    dir,
    name: '',
    ext: ''
  };
  let fullpath = '';
  info.ext = path.extname(file.originalname).substring(1).toLowerCase();
  IO.mkdirs(`${info.root}/${info.dir}`);
  do {
    info.key = IO.GUID();
    fullpath = `${info.root}/${info.dir}/${info.key}.${info.ext}`;
  } while (IO.isFileExists(fullpath));
  const oldpath = path.join(file.destination, file.filename);
  fs.renameSync(oldpath, fullpath);
  return info;
  //return `/${dir}/${key}.${ext}`;
}

export { uploader, storer }