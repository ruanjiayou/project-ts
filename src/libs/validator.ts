//TODO: i18n
/**
 * √ nullable
 * √ required 不能为空
 * √ int 整数
 * √ float 0 -1 -1.5 2 3.5 +4 +4.3
 * √ string
 * √ boolean
 * √ enum
 * √ range
 * √ min
 * √ max
 * √ length [0,7] (6,12) [7,9)
 * √ email
 * √ url
 * √ date
 * √ id
 * 
 * file exe|image
 * custom
 * 
 * requiredif:field|int?
 */
import * as _ from 'lodash';
import * as moment from 'moment';

const messages = {
  'zh-ch': {
    'required': '{field}字段不能为空!',
    'url': '{field}不是有效的url!',
    'email': '{field}不是有效的邮件格式!',
    'date': '{value}不是有效的日期时间格式!',
    'dateonly': '{value}不是有效的日期格式!',
    'timeonly': '{value}不是有效的时间格式!',
    'custom': '{value}不符合自定义的规则!',
    'int': '{field}必须是整数!',
    'float': '{value}不是有效的小数格式!',
    'boolean': '{field}必须是布尔类型!',
    'enum': '{field}的值必须是{value}中的一种!',
    'range': '{field}的值TODO:',
    'min': '{field}的值最小为{value}!',
    'max': '{field}的值最大为{value}!',
    'length': '{field}的长度必须TODO:',
    'minlength': '{field}的长度最小为{value}!',
    'maxlength': '{field}的长度最大为{value}!',
    'file': '非法的文件格式!'
  }
};
class Validator {
  public rules: any;
  public messages: any;
  public methods: any;
  constructor(o, lang) {
    if (_.isEmpty(lang)) {
      lang = 'zh-cn';
    }
    if (_.isEmpty(o)) {
      o = { rules: {}, methods: {}, messages: {} };
    }
    this.rules = o.rules;
    this.messages = o.messages || messages[lang];
    this.methods = o.methods;
    this.parse();
  }
  error(data) {
    let err: any = new Error();
    err.validate = data;
    throw err;
  }
  /**
   * 过滤并验证参数(综合filter()和check()两个函数)
   */
  validate(data) {
    let res = this.filter(data);
    this.check(res);
    return res;
  }
  /**
   * 按rules的字段,过滤额外的字段
   */
  filter(data) {
    let res = {};
    for (let k in this.rules) {
      let rule = this.rules[k];
      if (!_.isUndefined(data[k])) {
        if (rule.boolean) {
          if (['true', '1', 'false', '0'].indexOf(data[k]) !== -1) {
            res[k] = data[k] === 'true' || data[k] === '1' ? true : false;
          } else {
            res[k] = false;
          }
        } else {
          res[k] = data[k];
        }
      }
    }
    return res;
  }
  /**
   * 字符串转规则对象
   * @param {sting[]} arr
   */
  _arr2rule(arr) {
    let rule: any = {
      range: { min: -Infinity, max: Infinity, includeBottom: true, includeTop: true },
      length: { min: 0, max: 255 },
      custom: {}
    };
    for (let i = 0; i < arr.length; i++) {
      let kv = /^([a-z]+)[:]?(.*)$/.exec(arr[i].trim().toLowerCase()), k, v;
      if (kv === null) {
        this.error(`${arr[i]} 不是有效的规则!`);
      }
      k = kv[1];
      v = kv[2];
      switch (k) {
        case 'nullable':
          rule.nullable = true;
          break;
        case 'required':
          rule.required = true;
          break;
        case 'int':
          rule.int = true;
          break;
        case 'float':
          rule.float = true;
          break;
        case 'boolean':
          rule.boolean = true;
          break;
        case 'date':
          rule.date = true;
          break;
        case 'dateonly':
          rule.dateOnly = true;
          break;
        case 'timeonly':
          rule.timeOnly = true;
          break;
        case 'url':
          rule.url = true;
          break;
        case 'email':
          rule.email = true;
          break;
        case 'file':

          break;
        case 'method':
          let that = this;
          v.split(',').map((item) => {
            let fn = item.trim();
            if (that.methods[fn]) {
              rule.methods[fn] = that.methods[fn];
            } else {
              this.error(`${fn} method notFound`);
            }
          });
          break;
        case 'min':
          if (!this.isFloat(v)) {
            this.error(`${v} 不是有效的数值`);
          }
          rule.range.min = v;
          break;
        case 'max':
          if (!this.isFloat(v)) {
            this.error(`${v} 不是有效的数值`);
          }
          rule.range.max = v;
          break;
        case 'range':
          let t = /^(\(|\[)\s*(.+?)\s*,\s*(.+?)\s*(\)|\])$/.exec(v);
          if (!(t && this.isFloat(t[2]) && this.isFloat(t[3]))) {
            this.error(`${v} 不是有效的range格式!`)
          }
          rule.range.includeBottom = t[1] === '(' ? false : true;
          rule.range.includeTop = t[4] === ')' ? false : true;
          rule.range.min = parseFloat(t[2]);
          rule.range.max = parseFloat(t[3]);
          break;
        case 'minlength':
          if (!this.isInt(v)) {
            this.error(`${v} 不是有效的正整数!`);
          }
          rule.length.min = parseInt(v);
          break;
        case 'maxlength':
          if (!this.isInt(v)) {
            this.error(`${v} 不是有效的正整数!`);
          }
          rule.length.max = parseInt(v);
          break;
        case 'length':
          if (this.isInt(v)) {
            rule.length.min = rule.length.max = parseInt(v);
          } else {
            let t = /^(\(|\[)(\d+),(\d+)(\)|\])$/.exec(kv[2]);
            if (t) {
              rule['length']['min'] = parseInt(t[2]);
              rule['length']['max'] = parseInt(t[3]);
            } else {
              this.error('range 不是有效的格式!')
            }
          }
          break;
        case 'enum':
          rule.in = v.split(',').map(function (s) {
            if (s.trim() === '') {
              this.error(`${v} 枚举中多了逗号!`)
            }
            return s.trim();
          });
          break;
        case 'if':
          rule.if.field = k;
          rule.if.rule = v;
          break;
        default: break;
      }
    }
    // 1.nullable和required不能同时存在
    if (rule.required == true && rule.nullable == true) {
      this.error('nullable required');
    }
    if (rule.string === undefined) {
      delete rule.length;
    } else if (rule.length.min > rule.length.max) {
      this.error(`长度范围的下限大于上限!`);
    }
    if (rule.int === undefined && rule.float === undefined) {
      delete rule.range;
    } else if (rule.range.min > rule.range.max) {
      this.error(`数值范围的下限大于上限!`);
    }
    if (this.isEmptyObject(rule.methods)) {
      delete rule.methods;
    }
    if (this.isEmptyObject(rule.if)) {
      delete rule.if;
    }
    return rule;
  }
  /**
   * required|int|min:100|max:200  --> required: true, int: true, max: 10, max: 200
   */
  parse() {
    for (let k in this.rules) {
      // 可以这里处理required_if
      this.rules[k] = this._arr2rule(this.rules[k].split('|'));
    }
    return this;
  }
  /**
   * k 字段
   * v 值
   * kk 验证规则
   */
  check(data) {
    for (let k in this.rules) {
      let v = data[k];
      let rule = this.rules[k];
      if (_.isUndefined(v) && rule.nullable || rule.if && _.isUndefined(data[rule.if])) {
        delete data[k];
        continue;
      }
      if (rule.required) {
        if (_.isEmpty(v)) {
          this.error({
            filed: k,
            rule: 'required'
          });
        }
      }
      if (rule.int) {
        if (!this.isInt(v)) {
          this.error({
            filed: k,
            rule: 'int',
            value: v
          });
        }
        data[k] = parseInt(v);
      }
      if (rule.float) {
        if (!this.isFloat(v)) {
          this.error({
            filed: k,
            rule: 'float',
            value: v
          });
        }
        data[k] = parseFloat(v);
      }
      if (rule.length) {
        if (v.length < rule.min && v.length > rule.max) {
          this.error({
            filed: k,
            rule: 'length',
            value: v,
            expect: rule.length
          });
        }
      }
      if (rule.email) {
        if (!this.isEmail(v)) {
          this.error({
            filed: k,
            rule: 'email',
            value: v
          });
        }
      }
      if (rule.url) {
        if (!this.isUrl(v)) {
          this.error({
            filed: k,
            rule: 'url',
            value: v
          });
        }
      }
      if (rule.file) {

      }
      if (rule.enum) {
        if (-1 == rule.enum.indexOf(v)) {
          this.error({
            filed: k,
            rule: 'enum',
            value: v,
            expect: rule.enum
          });
        }
      }
      if (rule.boolean) {
        if (typeof data[k] !== 'boolean') {
          this.error({
            filed: k,
            rule: 'boolean',
            value: v
          });
        }
      }
      if (rule.date) {
        if (!this.isDate(v)) {
          this.error({
            filed: k,
            rule: 'date',
            value: v
          });
        } else {
          data[k] = moment(v).toISOString();
        }
      }
      if (rule.dateOnly) {
        if (!this.isDateOnly(v)) {
          this.error({
            filed: k,
            rule: 'dateonly',
            value: v
          });
        }
      }
      if (rule.timeOnly) {
        if (!this.isTimeOnly(v)) {
          this.error({
            filed: k,
            rule: 'timeonly',
            value: v
          })
        }
      }
      if (!_.isEmpty(rule.if.field)) {
        //TODO:
      }
      for (let k in rule.methods) {
        let fn = rule.methods[k];
        if (!fn.call(this, v)) {
          this.error({
            filed: k, rule: 'method', value: v
          });
          break;
        }
      }
    }// for end
    return data;
  }
  // 是否是空对象
  isEmptyObject(o) {
    for (var k in o) {
      return false;
    }
    return true;
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
    return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(v);
  }
  isID(sfzhm_new) {
    var sum = 0;
    var weight = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    var validate = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    for (let m = 0; m < sfzhm_new.length - 1; m++) {
      sum += sfzhm_new[m] * weight[m];
    }
    let mode = sum % 11;
    if (sfzhm_new[17] === validate[mode]) {
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
    for (var i = first15Num.length - 1; i > -1; i--) { //前15或18位倒序存进数组
      newArr.push(first15Num.substr(i, 1));
    }
    var arrJiShu = new Array();  //奇数位*2的积 <9
    var arrJiShu2 = new Array(); //奇数位*2的积 >9

    var arrOuShu = new Array();  //偶数位数组
    for (var j = 0; j < newArr.length; j++) {
      if ((j + 1) % 2 === 1) {//奇数位
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
  isString() {

  }
  isChar() {

  }
  isFile() {

  }
}

export default Validator;