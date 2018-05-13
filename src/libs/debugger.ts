import * as debug from 'debug';

const debuger = (type) => {
  return debug(type);
}

export { debuger }