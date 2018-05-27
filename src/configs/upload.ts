import * as fs from 'fs';
import * as path from 'path';
const dest = path.join(__dirname, '../../');
if (!fs.existsSync(dest) || !fs.lstatSync(dest).isDirectory()) {
  fs.mkdirSync(dest);
}
const upload = {
  dest: path.normalize(`${dest}/.tmp`),
  limits: {
    fieldNameSize: 100,
    fileSize: 1024 * 1024 * 1024,
    fields: 100
  },
  fields: [
    { name: 'file', limit: 1 },
    { name: 'logo', limit: 1 },
    { name: 'image', limit: 1 },
    { name: 'images', limit: 10 },
    { name: 'avatar', limit: 1 },
  ],
  //localPath: 'D:/WebSite/blog.php',
  localPath: path.normalize(`${dest}/static`),
  rootPath: '/ueditor/php/upload/image/'
}
export {
  upload
}