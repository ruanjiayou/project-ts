const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const messages = {
  'zh-ch': {
    'required': '{{field}} 字段不能为空!',
    'url': '{{field}} 字段的值 {{data}} 不是有效的url!',
    'email': '{{field}} 字段的值 {{data}} 不是有效的邮件格式!',
    'date': '{{field}} 字段的值 {{data}} 不是有效的 日期时间 格式!',
    'dateonly': '{{field}} 字段的值 {{data}} 不是有效的日期格式!',
    'timeonly': '{{field}} 字段的值 {{data}} 不是有效的时间格式!',
    'custom': '{{data}} 不是 {{field}} 字段中 自定义的验证方法 {{value}}!',
    'methods': {},
    'int': '{{field}} 字段的值 {{data}} 必须是整数!',
    'float': '{{field}} 字段的值 {{data}} 不是有效的浮点数!',
    'boolean': '{{field}} 字段的值 {{data}} 不是布尔类型!',
    'enum': '{{field}} 字段的值 {{data}} 不是{{rule}} 规则中 {{value}} 中的一种!',
    'min': '{{field}}的值最小为{{value}}!',
    'max': '{{field}}的值最大为{{value}}!',
    'minlength': '{{field}}的长度最小为{{value}}!',
    'maxlength': '{{field}}的长度最大为{{value}}!',
    'file': '{{data}} 不是预期{{value}}的文件格式!',
    'size': '{{field}}的文件大于{{value}}'
  }
};

function _str2arr(str, sperator = ',') {
  return str.split(sperator).map((item) => { return item.trim(); });
}

class Validater {
  rules: any;
  files: any;
  messages: any;
  methods: any;
  constructor(o, lang = 'zh-cn') {
    if (_.isEmpty(o)) {
      o = { rules: {}, files: {}, methods: {}, messages: {} };
    }
    this.rules = o.rules;
    this.files = o.files || {};
    this.messages = o.messages || messages[lang];
    this.methods = o.methods || {};
    this.parse();
  }
  error(o) {
    if (typeof o === 'object') {
      o = Validater.compile(this.messages[o.rule], o);
    }
    let err: any = new Error(o);
    err.validate = true;
    throw err;
  }
  static compile(str, data) {
    let reg = /\{\{\s*([a-z0-9]+)\s*\}\}/g, res = str, m;
    while ((m = reg.exec(str)) !== null) {
      let k = m[0], v = m[1], value = data[v] === undefined ? ' ?? ' : data[v];
      res = res.replace(k, value);
    }
    return res;
  }
  /**
   * 过滤并验证参数(综合filter()和check()两个函数)
   */
  validate(data) {
    let res = this.filter(data);
    this.check(res);
    return res;
  }
  validateFile(files, cb = null) {
    const res = this.filter(this.files, 'files');
    this.check(files);
    return res;
  }
  /**
   * 按rules的字段,过滤额外的字段
   */
  filter(data, type = 'rules') {
    let res = {};
    for (let k in this[type]) {
      let rule = this[type][k];
      if (!_.isUndefined(data[k])) {
        if (rule.boolean) {
          res[k] = data[k] && data[k] !== 'false' ? true : false;
        } else {
          res[k] = data[k];
        }
      }
    }
    return res;
  }
  /**
   * 字符串转规则对象
   * @param {string} str 字符串
   * @returns object 规则对象
   */
  _str2rule(str) {
    const arr = _str2arr(str, '|');
    // 默认值处理
    let rule: any = {
      range: { min: -Infinity, max: Infinity, includeBottom: true, includeTop: true },
      length: { minlength: 0, maxlength: 255 },
      methods: {}
    };
    if (arr.indexOf('text') !== -1) {
      rule.length.maxlength = Infinity;
    }
    for (let i = 0; i < arr.length; i++) {
      let str = arr[i];
      // 没做null判断
      let [kv, k, v] = /^([a-z0-9]+)[:]?(.*)$/.exec(str.trim());
      switch (k) {
        case 'file':
          rule.file = v.split(',').map(function (s) { return s.trim(); });
          break;
        case 'size':
          rule.size = parseInt(v);
          break;
        case 'methods':
          let that: any = this;
          v.split(',').map((item) => {
            let fn = item.trim();
            rule.methods[fn] = that.methods[fn];
          });
          break;
        case 'min':
          rule.range.min = parseFloat(v);
          break;
        case 'max':
          rule.range.max = parseFloat(v);
          break;
        case 'range':
          rule.range.includeBottom = v.startsWith('[');
          rule.range.includeTop = v.endsWith(']');
          v = v.slice(1, -1);
          if (v.indexOf(',') === -1) {
            if (rule.range.includeBottom) {
              rule.range.min = parseFloat(v);
            } else {
              rule.range.max = parseFloat(v);
            }
          } else {
            [rule.range.min, rule.range.max] = v.split(',').map((n) => { return parseFloat(n); });
          }
          break;
        case 'minlength':
          rule.length.minlength = parseInt(v);
          break;
        case 'maxlength':
          rule.length.maxlength = parseInt(v);
          break;
        case 'length':
          if (v.indexOf(',') === -1) {
            v = `0,${v}`;
          }
          [rule.length.minlength, rule.length.maxlength] = _str2arr(v);
          break;
        case 'enum':
          rule.enum = _str2arr(v);
          break;
        case 'if':
          rule.if = v;
          break;
        default:
          // required nullable string text int float boolean date dateonly timeonly url email 
          rule[k] = true;
          break;
      }
    }
    if (_.isNil(rule.string) && _.isNil(rule.text) && _.isNil(rule.file)) {
      delete rule.length;
    }
    if (_.isNil(rule.int) && _.isNil(rule.float)) {
      delete rule.range;
    }
    if (_.isEmpty(rule.methods)) {
      delete rule.methods;
    }
    return rule;
  }
  /**
   * required|int|min:100|max:200  --> required: true, int: true, range: [100, 200)
   */
  parse() {
    let ifArr = [];
    for (let k in this.rules) {
      let str = this.rules[k];
      this.rules[k] = this._str2rule(str);
    }
    for (let k in this.files) {
      let str = this.files[k];
      this.files[k] = this._str2rule(str);
    }
    return this;
  }
  /**
   * k 字段
   * v 值
   * kk 验证规则
   */
  check(data, type = 'rules') {
    for (let k in this['rules']) {
      let v = data[k], rule = this['rules'][k];
      const detailInfo = { field: k, data: v, rule: '', value: '' };
      // if规则和nullable的区别:nullable,data中没字段就不验证;if,为false时会主动删除data中的字段
      // if的顺序不能顺便
      if (rule.if && false === rule.methods[rule.if](v)) {
        delete data[k];
        continue;
      }
      if (_.isUndefined(v) && rule.nullable) {
        delete data[k];
        continue;
      }
      if (rule.required && _.isUndefined(v)) {
        detailInfo.rule = 'required';
        this.error(detailInfo);
      }
      if (rule.int) {
        if (!this.isInt(v)) {
          detailInfo.rule = 'int';
          this.error(detailInfo);
        }
        v = parseInt(v);
      }
      if (rule.float) {
        if (!this.isFloat(v)) {
          detailInfo.rule = 'float';
          this.error(detailInfo);
        }
        v = parseFloat(v);
      }
      if (rule.range) {
        if (v < rule.range.min) {
          detailInfo.rule = 'min';
          detailInfo.value = rule.range.min;
          this.error(detailInfo);
        }
        if (v > rule.range.max) {
          detailInfo.rule = 'max';
          detailInfo.value = rule.range.max;
          this.error(detailInfo);
        }
      }
      if (rule.length) {
        if (v.length < rule.length.minlength) {
          detailInfo.rule = 'minlength';
          detailInfo.value = rule.length.minlength;
          this.error(detailInfo);
        }
        if (v.length > rule.length.maxlength) {
          detailInfo.rule = 'maxlength';
          detailInfo.value = rule.length.maxlength;
          this.error(detailInfo);
        }
      }
      if (rule.email && !this.isEmail(v)) {
        detailInfo.rule = 'email';
        this.error(detailInfo);
      }
      if (rule.url && !this.isUrl(v)) {
        detailInfo.rule = 'url';
        this.error(detailInfo);
      }
      if (rule.file) {
        let len = v.length;
        // 验证数量: 要么nullable要么至少一张图
        if (len === 0 && _.isNil(rule.nullable)) {
          detailInfo.rule = 'required';
          this.error(detailInfo);
        }
        if (rule.length && len < rule.length.minlength) {
          detailInfo.rule = 'minlength';
        }
        if (rule.length && len > rule.length.maxlength) {
          detailInfo.rule = 'maxlength';
        }
        // 验证类型/大小
        for (let i = 0; i < v.length; i++) {
          const file = v[0];
          const states = fs.statSync(file.path);
          const ext = path.ext(file.originalname).toLowerCase();
          file.ext = ext;
          if (rule.file.indexOf(ext) === -1) {
            detailInfo.rule = 'file';
            detailInfo.data = file.ext;
            detailInfo.value = `[${rule.file.join(',')}]`;
            this.error(detailInfo);
          }
          // 默认2M
          if (file.size > rule.size || 2000000) {
            detailInfo.rule = 'size';
            detailInfo.data = file.size;
            detailInfo.value = rule.size || 2000000;
          }
        }
      }
      if (rule.enum && -1 === rule.enum.indexOf(v)) {
        detailInfo.rule = 'enum';
        detailInfo.value = rule.enum.join(',');
        this.error(detailInfo);
      }
      if (rule.boolean && typeof data[k] !== 'boolean') {
        detailInfo.rule = 'boolean';
        this.error(detailInfo);
      }
      if (rule.date) {
        if (!this.isDate(v)) {
          detailInfo.rule = 'date';
          this.error(detailInfo);
        }
        v = moment(v).toISOString()
      }
      if (rule.dateonly && !this.isDateOnly(v)) {
        detailInfo.rule = 'dateonly';
        this.error(detailInfo);
      }
      if (rule.timeonly && !this.isTimeOnly(v)) {
        detailInfo.rule = 'timeonly';
        this.error(detailInfo);
      }
      data[k] = v;
      for (let f in rule.methods) {
        let fn = rule.methods[f];
        if (!fn.call(this, v)) {
          let fns = [];
          for (let kk in rule.methods) {
            fns.push(kk.constructor.name);
          }
          detailInfo.rule = 'method';
          detailInfo.value = fns.constructor.name;
          this.error(detailInfo);
        }
      }
    }// for end
    return data;
  }

  isUrl(v) {
    return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(v);
  }
  isDate(v) {
    return moment(v).isValid();
  }
  isDateOnly(v) {
    return moment(v, 'YYYY-MM-DD', true).isValid();
  }
  isTimeOnly(v) {
    return moment(v, 'HH:mm:ss', true).isValid();
  }
  isInt(v) {
    return /^\d+$/.test(v);
  }
  isFloat(v) {
    return /^[-+]?(\d+[.])?\d+$/.test(v);
  }
  isEmail(v) {
    return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(v)
  }
  isID(sfzhm_new) {
    var sum = 0;
    var weight = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    var validate = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    for (let m = 0; m < sfzhm_new.length - 1; m++) {
      sum += sfzhm_new[m] * weight[m];
    }
    let mode = sum % 11;
    if (sfzhm_new[17] == validate[mode]) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Luhn校验算法校验银行卡号
   * Description:  银行卡号Luhm校验
   * Luhm校验规则：16位银行卡号（19位通用）:
   * 1.将未带校验位的 15（或18）位卡号从右依次编号 1 到 15（18），位于奇数位号上的数字乘以 2。
   * 2.将奇位乘积的个十位全部相加，再加上所有偶数位上的数字。
   * 3.将加法和加上校验位能被 10 整除。
   * 方法步骤很清晰，易理解，需要在页面引用Jquery.js
   * bankno为银行卡号
   */
  isCredit(bankno) {
    var lastNum = bankno.substr(bankno.length - 1, 1);//取出最后一位（与luhm进行比较）

    var first15Num = bankno.substr(0, bankno.length - 1);//前15或18位
    var newArr = new Array();
    for (var i = first15Num.length - 1; i > -1; i--) {//前15或18位倒序存进数组
      newArr.push(first15Num.substr(i, 1));
    }
    var arrJiShu = new Array();  //奇数位*2的积 <9
    var arrJiShu2 = new Array(); //奇数位*2的积 >9

    var arrOuShu = new Array();  //偶数位数组
    for (var j = 0; j < newArr.length; j++) {
      if ((j + 1) % 2 == 1) {//奇数位
        if (parseInt(newArr[j]) * 2 < 9)
          arrJiShu.push(parseInt(newArr[j]) * 2);
        else
          arrJiShu2.push(parseInt(newArr[j]) * 2);
      }
      else //偶数位
        arrOuShu.push(newArr[j]);
    }

    var jishu_child1 = new Array();//奇数位*2 >9 的分割之后的数组个位数
    var jishu_child2 = new Array();//奇数位*2 >9 的分割之后的数组十位数
    for (var h = 0; h < arrJiShu2.length; h++) {
      jishu_child1.push(parseInt(arrJiShu2[h]) % 10);
      jishu_child2.push(parseInt(arrJiShu2[h]) / 10);
    }

    var sumJiShu: any = 0; //奇数位*2 < 9 的数组之和
    var sumOuShu: any = 0; //偶数位数组之和
    var sumJiShuChild1: any = 0; //奇数位*2 >9 的分割之后的数组个位数之和
    var sumJiShuChild2: any = 0; //奇数位*2 >9 的分割之后的数组十位数之和
    var sumTotal: any = 0;
    for (var m = 0; m < arrJiShu.length; m++) {
      sumJiShu = sumJiShu + parseInt(arrJiShu[m]);
    }

    for (var n = 0; n < arrOuShu.length; n++) {
      sumOuShu = sumOuShu + parseInt(arrOuShu[n]);
    }

    for (var p = 0; p < jishu_child1.length; p++) {
      sumJiShuChild1 = sumJiShuChild1 + parseInt(jishu_child1[p]);
      sumJiShuChild2 = sumJiShuChild2 + parseInt(jishu_child2[p]);
    }
    //计算总和
    sumTotal = parseInt(sumJiShu) + parseInt(sumOuShu) + parseInt(sumJiShuChild1) + parseInt(sumJiShuChild2);

    //计算Luhm值
    var k = parseInt(sumTotal) % 10 == 0 ? 10 : parseInt(sumTotal) % 10;
    var luhm = 10 - k;
    var my = false;
    if (lastNum == luhm) {//Luhm验证通过
      my = true;
    }
    else {//银行卡号必须符合Luhm校验
      my = false;
    }
    return my;
  }
  isString(str) {
    return typeof str === 'string';
  }
  isChar(str) {
    for (let i = str.length; i >= 0; i--) {
      let ch = str.charCodeAt(i);
      if (ch < 32 || ch > 126) {
        return false;
      }
    }
    return true;
  }
  isFile(data) {
    return true;
  }
}

export { Validater }