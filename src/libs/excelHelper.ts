import { IO } from './io';

const fs = require('fs');
const XLSX = require('xlsx');

class excelHelper {
  /**
   * 读取excel
   * @param filepath 文件路径
   * @returns null或json
   */
  static file2json(filepath) {
    if (IO.isFileExists(filepath)) {
      const buff = fs.readFileSync(filepath);
      const wb = XLSX.read(buff, { type: 'buffer' });
      const res = {};
      wb.SheetNames.forEach(sheetName => {
        res[sheetName] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
      });
      return res;
    } else {
      return null;
    }
  }
}
export { excelHelper }