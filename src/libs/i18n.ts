import * as i18n from 'i18n';
const path = require('path');
// i18n
const i18nLocales = ['zh-cn'];

i18n.configure({
  queryParameter: 'lang',
  defaultLocale: i18nLocales[0],
  locales: i18nLocales,
  directory: path.join(`${__dirname}`, '../errors'),
  extension: '.js',
  updateFiles: false,
  objectNotation: true,
  autoReload: true
});

export { i18n }