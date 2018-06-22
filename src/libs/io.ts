const fs = require('fs');
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const path = require('path');

class IO {
  /**
   * 判断路径是否合法
   * @param {string} path - 路径
   * @return {boolean} - true 路径合法 false - 路径不合法
   */
  static isValidPath(path) {
    return /[<>"/?\\*|':]/.test(path);
  }
  /**
  * 去掉路径中不合法的字符
  * @param {string} path - 路径
  * @return {string} - 返回合法的字符
  */
  static toValidPath(path) {
    return path.replace(/[<>"/?\\*|':]/g, ' ');
  }

  /**
  * 生成16位长度的GUID
  */
  static GUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }).toUpperCase();
  };

  /**
  * 判断是否是图片拓展名
  * @param {string} ext - 拓展名
  * @return {boolean} - true 是 false 否
  */
  static isImageExt(ext) {
    return ext === 'png' || ext === 'gif' || ext === 'jpg' || ext === 'bmp' || ext === 'jpeg' || false;
  }
  static isExtension(filepath, exts) {
    let ext = IO.extension(filepath);
    exts = typeof exts === 'object' ? exts : [exts];
    return exts.indexOf(ext) !== -1;
  }
  /**
  * 获取文件MIME类型
  * @param {string} header - 文件字符串
  * @returns {string=""} 
  */
  static getMIME(header) {
    var res = '';
    if (/^\u0042\u004d/.test(header)) {
      res = 'bmp';
    } else if (/^\u00ff\u00d8\u00ff/.test(header)) {
      res = 'jpg';
    } else if (/^\u0047\u0049\u0046/.test(header)) {
      res = 'gif';
    } else if (/^\u0049\u0049\u002A/.test(header)) {
      res = 'tif';
    } else if (/^\u0089\u0050\u004E/.test(header)) {
      res = 'png';
    }
    return res;
  }
  /**
  * 获取后缀名(无.)
  * @param {string} filepath 
  */
  static extension(filepath) {
    let ext = path.extname(filepath);
    return ext.substr(1).toLowerCase();
  }
  /**
  * 按url下载到本地的dir目录 要对返回值做empty object判断!!!
  * 自动识别文件头,生成key和ext
  * @param {string} url 图片网址
  * @param {string} dir 本地目录
  * @param {function} [cb] 回调函数
  * @returns {object} result 返回的json
  * @returns {string} result.dir 本地路径
  * @returns {string} result.key 文件名
  * @returns {string} result.ext 拓展名
  * @returns {string} result.len 文件大小
  * @returns {function} result.md5 文件md5
  */
  static async downImage(url, dir, cb) {
    let key, ext, path, res;
    // pathname中的中文编码
    url = encodeURI(url.trim());
    if (!IO.isDirExists(dir)) {
      let res = IO.mkdirs(dir);
      if (res === false) {
        return false;
      }
    }
    res = await new Promise(function (resolve, reject) {
      let imgData = '',
        shttp = /^https/.test(url) ? https : http;
      let md5sum = crypto.createHash('md5');
      shttp.get(url, function (res) {
        let timer = setTimeout(function () {
          res.abort();
          resolve(new Error('time over 5s'));
        }, 5000);
        //一定要设置response的编码为binary否则会下载下来的图片打不开
        res.setEncoding('binary');
        res.headers['Referer'] = url;
        res.on('data', function (chunk) {
          md5sum.update(chunk);
          imgData += chunk;
        });
        res.on('end', function () {
          clearTimeout(timer);
          timer = null;
          ext = /^image\/(.*)/.test(res.headers['content-type']) ? RegExp.$1 : IO.getMIME(imgData.substr(0, 3));
          if (IO.isImageExt(ext)) {
            do {
              key = IO.GUID();
              path = `${dir}/${key}.${ext}`;
            } while (IO.isFileExists(path));
            fs.writeFile(path, imgData, 'binary', function (err) {
              if (err) {
                resolve(new Error('write error!'));
              } else {
                resolve({
                  "dir": dir,
                  "key": key,
                  "ext": ext,
                  "len": imgData.length,
                  "md5": md5sum.digest('hex').toUpperCase()
                });
              }
            });
          } else {
            resolve(new Error('isn\'t a image'));
          }
        });
      });
    });
    // 有回调就调用
    if (cb) {
      if (res instanceof Error) {
        await cb(res, null);
      } else {
        await cb(null, res);
      }
    }
    return res;
  }

  /**
  * 判断文件是否存在
  * @param {string} path - 文件路径
  * @return {boolean} - true 文件存在 false 文件不存在
  */
  static isFileExists(path) {
    return fs.existsSync(path) && !fs.lstatSync(path).isDirectory();
  }
  /**
  * 判断目录是否存在
  * @param {string} dir - 目录路径
  * @return {boolean} - true 目录存在 false 目录不存在
  */
  static isDirExists(dir) {
    return fs.existsSync(dir) && fs.lstatSync(dir).isDirectory();
  }
  /**
  * 遍历目录文件方法
  * @param {string} dir 目录
  * @param {AsyncFunction} cb 回调函数
  * @param {AsyncFunction} [filter] 过滤函数
  */
  static async eachAsync(dir, cb, filter) {
    let files = fs.readdirSync(dir);
    for (let i = 0; i < files.length; i++) {
      let file = path.join(dir, files[i]);
      if (IO.isDirExists(file)) {
        await IO.eachAsync(file, cb, filter);
      } else if (void 0 === filter || true === await filter(file)) {
        await cb(file);
      }
    }
  }
  /**
  * 同步读取文件文本
  * @param {string} path - 文件绝对路径
  * @return {string} - 字符串
  */
  static readTxt(path) {
    var res = '';
    if (IO.isFileExists(path)) {
      try {
        res = fs.readFileSync(path, 'utf-8');
      }
      catch (e) {
        console.log('read error!');
      }
    }
    return res;
  }
  /**
  * 写入文件
  * @param {string} path - 文件路径
  * @param {*} txt - 字符串
  * @return {boolean} - true 写入完成 false 写入失败
  */
  static writeTxt(path, txt) {
    try {
      fs.writeFileSync(path, txt);
      return true;
    }
    catch (e) {
      return false;
    }
  }
  /**
  * 追加写入文本
  * @param {string} path - 文件路径
  * @param {*} txt - 字符串
  * @return {boolean} - true 写入完成 false 写入失败
  */
  static addTxt(path, txt) {
    try {
      fs.writeFileSync(path, txt, { flag: 'a+' });
      return true;
    }
    catch (e) {
      return false;
    }
  }
  static moveFile(oldPath, newPath) {
    let dir = path.dirname(newPath);
    try {
      if (!IO.isDirExists(dir)) {
        IO.mkdirs(dir);
      }
      fs.renameSync(oldPath, newPath);
      return true;
    } catch (err) {
      console.log(err.message);
      return false;
    }
  }
  /**
  * 删除文件
  * @param {string} path 
  */
  static delFile(path) {
    try {
      if (IO.isFileExists(path)) {
        fs.unlinkSync(path);
      }
      return true;
    } catch (err) {
      return false;
    }
  }
  /**
  * 删除文件夹及所有子文件文件
  * @param {string} path 
  */
  static delFolder(path) {
    if (!IO.isDirExists(path)) {
      return true;
    }
    let files = fs.readdirSync(path);//读取该文件夹
    try {
      files.forEach(function (file) {
        var stats = fs.statSync(path + '/' + file);
        if (stats.isDirectory()) {
          IO.delFolder(path + '/' + file);
        } else {
          fs.unlinkSync(path + '/' + file);
        }
      });
      fs.rmdirSync(path);
      return true;
    } catch (err) {
      console.log(err.message);
      return false;
    }
  }
  static clearEmptyFolder(dir) {
    let files = fs.readdirSync(dir);
    if (files.length === 0) {
      IO.delFolder(dir);
    }
    for (let i = 0; i < files.length; i++) {
      let file = path.join(dir, files[i]);
      if (IO.isDirExists(file)) {
        IO.clearEmptyFolder(file);
      }
    }
  }
  /**
  * 创建文件夹
  * @param {string|array} dir 文件夹
  * @returns {boolean} 是否创建成功
  */
  static mkdirs(dir) {
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
  * 字数统计:
  */
  static count(str) {
    let res = {
      bytes: 0,
      chinese: 0,
      english: 0,
      num: 0,
      punctuation: 0
    };
    for (let i = 0; i < str.length; i++) {
      let c = str.charAt(i);
      if (/[\u4e00-\u9fa5]/.test(c)) {
        // 中文
        res.chinese++;
      } else if (/[^\x00-\xff]/.test(c)) {
        // 标点?
        res.punctuation++;
      } else {
        // 英文
        res.english++;
      }
      if (/[0-9]/.test(c)) {
        // 数字
        res.num++;
        res.english--;
      }
    }
    res.bytes = (res.chinese + res.punctuation) * 2 + res.english + res.num;
    return res;
  }
}



export { IO }