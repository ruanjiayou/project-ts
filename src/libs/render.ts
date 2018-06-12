const HBS = require('express-handlebars');
const path = require('path');
const moment = require('moment');
const operators = {
  '||': (v1, v2) => { if (v1) return v1; else return v2; },
  '==': (v1, v2) => { return v1 == v2; },
  '===': (v1, v2) => { return v1 === v2; },
  '!=': (v1, v2) => { return v1 != v2; },
  '!==': (v1, v2) => { return v1 !== v2; },
  '<': (v1, v2) => { return v1 < v2; },
  '>': (v1, v2) => { return v1 > v2; },
  '<=': (v1, v2) => { return v1 <= v2; },
  '>=': (v1, v2) => { return v1 >= v2; },
  'typeof': (v1, v2) => { return typeof v1 == v2; }
};
let hbs = null;
/**
 * 自定义时间处理
 * @param t 
 * @param opt 
 * @param options 
 */
const timeHelper = function (t, opt, options) {
  if (opt === 'default') {
    opt = 'YYYY-MM-DD HH:mm:ss';
  }
  //return '2018-06-07';
  return moment(t).format(opt);
}
/**
 * 简短表达式的值
 * A || B
 * condition ? A : B
 * A operator B ? C : D
 * @param v1 
 * @param op 
 * @param v2 
 */
const expression = function () {
  const options = Array.prototype.pop.call(arguments);
  const args = arguments;
  let res = '';
  const condi = args[1];
  switch (args.length) {
    case 3: // A || B
      if (condi === '||') {
        res = args[0] ? args[0] : args[2];
      }
      break;
    case 5: // condition ? A : B
      if (condi === '?' && args[3] === ':') {
        res = args[0] ? args[2] : args[4];
      }
      break;
    case 7: // A operator B ? C : D
      if (args[3] === '?' && args[5] === ':' && operators[condi] !== undefined) {
        res = operators[condi](args[0], args[2]) ? args[4] : args[6];
      }
      break;
    default: ;
  }
  return res;
}
/**
 * 自定义if/else
 * condition
 * A operator B
 * @param v1 
 * @param op 
 * @param v2 
 * @param options 
 */
const condition = function (v1, op = '==', v2 = '', options) {
  if (operators[op] === undefined) {
    return options.fn(this);
  }
  return operators[op](v1, v2) ? options.fn(this) : options.inverse(this);
}

const render = function (app) {
  const viewsPath = app.get('views');
  if (hbs === null) {
    hbs = HBS.create({
      extname: '.hbs',
      layoutsDir: viewsPath,
      partialsDir: viewsPath,
      helpers: {
        timeHelper,
        expression,
        condition
      }
    });
    app.engine('hbs', hbs.engine);
    app.set('view engine', 'hbs');
  }
}

export { render }