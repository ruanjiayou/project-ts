import { loader } from './libs';

const path = require('path');
const dir = path.join(__dirname, 'routes');
const routes = [];
const handler = (info) => {
  // 路由小模块
  const route = require(info.fullpath);
  Object.keys(route).forEach(key => {
    // 转化为可以排序的对象
    const [method, path] = key.split(' ');
    const o = {
      type: method.toLowerCase(),
      path: path,
      handle: route[key]
    };
    routes.push(o);
  });
};

loader(handler, {
  dir: dir,
  recusive: true
});

/**
 * 比较字符串的大小
 * @param str1 
 * @param str2 
 */
function compare(str1, str2) {
  let len1 = str1.length,
    len2 = str2.length;
  for (let i = 0; i < len1 && i < len2; i++) {
    if (str1[i] === ':' || str1[i] === '*') {
      return -1;
    }
    if (str2[i] === ':' || str2[i] === '*') {
      return 1;
    }
    if (str1.charCodeAt(i) !== str2.charCodeAt(i)) {
      return str1.charCodeAt(i) - str2.charCodeAt(i);
    }
  }
  return len1 - len2;
}

/**
 * 调整路由顺序
 * @param arr 路由函数数组
 */
function adjustor(arr) {
  arr.sort(function (a, b) {
    if (a.type === 'use' || b.type === 'use') {
      if (a.type === b.type) {
        return compare(a.path, b.path);
      } else {
        return a.type === 'use' ? -1 : 1;
      }
    }
    return compare(a.path, b.path);
  });
  return arr;
}

/**
 * 处理并挂载所有路由
 * @param app 服务器实例
 */
function router(app) {
  // 排序
  adjustor(routes);
  // 挂载到app上
  routes.forEach(function (route) {
    app[route.type](route.path, route.handle);
  });
}

export { router };