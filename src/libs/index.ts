import * as  fs from 'fs';
import * as  path from 'path';
let libs: any = {};

fs.readdirSync(__dirname).forEach((file) => {
  let fullPath = path.join(__dirname, file);
  let ext = path.extname(file).toLocaleLowerCase();
  let filename = file.substr(0, file.length - ext.length);

  if (fullPath !== __filename && ext === '.js') {
    libs[filename] = require(fullPath).default;
  }
});

export default libs;