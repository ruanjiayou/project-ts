import * as multer from 'multer';
import * as Debug from 'debug';
import * as path from 'path';
import configs from '../configs';
const uploadCfg = configs.upload;

// 上传路径处理 ,上传文件重命名
let storage = multer.diskStorage({
  // 上传路径处理
  destination: uploadCfg.dest,
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
  limits: configs.upload.limits, //限制文件的大小
  fileFilter: fileFilter //文件的类型, 过滤
}).fields([{
  name: 'file',
  maxCount: 10
}]);

export { uploader }