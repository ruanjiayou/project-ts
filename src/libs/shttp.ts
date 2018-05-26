const request = require('request-promise');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const qs = require('qs');

class rp {
  private uri: string;
  private method: string;
  private qs: any;
  private files: any;
  private body: any;
  private headers: any;
  constructor(url, method = 'GET') {
    this.uri = url;
    this.qs = {};
    this.files = {};
    this.method = method;
    this.body = {};
    this.headers = {
      "Accept": "text/html,image/*,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
      "Connection": "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:57.0) Gecko/20100101 Firefox/57.0"
    };
  }
  /**
   * 设置header
   * 表单 application/x-www-form-urlencoded x-www-form-urlencoded 文件 multipart/form-data json格式: json: true
   * @param {string|object} v1 
   * @param {string} [v2]
   */
  header(v1, v2?: any) {
    if (typeof v1 === 'string' && typeof v2 === 'string') {
      this.headers[v1] = v2;
    }
    if (typeof v1 === 'object') {
      for (let k in v1) {
        this.headers[k] = v1[k];
      }
    }
    return this;
  }
  attach(name, filepath) {
    let files = {};
    this.header('Content-Type', 'multipart/form-data');
    if (typeof name === 'string') {
      files[name] = filepath;
    } else {
      files = name;
    }
    for (let k in files) {
      this.files[k] = files[k];
    }
    return this;
  }
  /**
   * 设置get请求的search 不能直接传k1=v1&k2=v2
   */
  query(v1, v2?: any) {
    if (typeof v1 === 'string' && typeof v2 === 'string') {
      this.qs[v1] = v2;
    } else {
      this.qs = v1;
    }
    return this;
  }
  /**
   * 设置请求的body
   * @param {string|object} v1 
   * @param {string} [v2]
   */
  send(v1, v2?: any) {
    if (typeof v1 === 'string' && typeof v2 === 'string') {
      this.body[v1] = v2;
    }
    if (typeof v1 === 'object') {
      for (let k in v1) {
        this.body[k] = v1[k];
      }
    }
    return this;
  }
  async end(cb?: any) {
    let res: any = {}, err = null, querystring = qs.stringify(this.qs);
    let opts: any = {
      uri: `${this.uri}?${querystring}`,
      method: this.method,
      headers: this.headers,
      simple: false,
      resolveWithFullResponse: true
    };
    try {
      // 表单及文件处理
      let type = opts.headers['Content-Type'];
      if (type === 'multipart/form-data') {
        opts.formData = this.body;
        for (let k in this.files) {
          let filename = path.basename(this.files[k]);
          opts.formData[k] = {
            value: fs.createReadStream(this.files[k]),
            options: {
              filename: filename,
              contentType: mime.getType(path.extname(filename))
            }
          };
        }
      } else if (opts.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
        opts.form = this.body;
      } else {
        opts.body = this.body;
        opts.json = true;
      }
      res = await request(opts);
    } catch (e) {
      // simple=false 就没问题了!!!
      // 算了,只要不是200就是error
      err = e;
      //400竟然跳到这里
      // if(typeof e.statusCode === 'number') {
      //     res.statusCode = e.statusCode;
      //     res = e.response;
      // } else {
      //     err = e;
      // }
    }
    if (typeof res.body === 'string' && res.headers) {
      // 有些lowB不大写
      let type = res.headers['Content-Type'] || res.headers['content-type'];
      if (type.indexOf('application/json') !== -1) {
        res.body = JSON.parse(res.body);
      }
    }
    if (typeof cb === 'function') {
      cb.call(res, err ? err : null, res.body, res.headers);
    }
    return err ? err : res;
  }
}

const shttp = {
  get: (url) => {
    return new rp(url, 'GET');
  },
  post: (url) => {
    return new rp(url, 'POST');
  },
  put: (url) => {
    return new rp(url, 'PUT');
  },
  delete: (url) => {
    return new rp(url, 'DELETE');
  },
  patch: (url) => {
    return new rp(url, 'PATCH');
  }
};

export { shttp };