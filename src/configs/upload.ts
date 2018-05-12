import * as fs from 'fs';
import * as path from 'path';
const dest = path.join(__dirname, '../../.tmp');
if (!fs.existsSync(dest) || !fs.lstatSync(dest).isDirectory()) {
  fs.mkdirSync(dest);
}
const upload = {
  dest: dest,
  limits: {
    fieldNameSize: 100,
    fileSize: 1024 * 1024 * 1024,
    fields: 100
  },
  localPath: 'D:/WebSite/blog.php',
  rootPath: '/ueditor/php/upload/image/'
}
export {
  upload
}