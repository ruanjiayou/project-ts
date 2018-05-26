/**
 * 自定义错误类型
 */

class CustomError extends Error {
  public module: string;
  public type: string;
  public time: Date;
  constructor(module, type, detail: string = '') {
    super();
    this.module = module;
    this.type = type;
    this.time = new Date();
    this.message = detail;
  }
}

function thrower(module, type, detail: string = '') {
  throw new CustomError(module, type, detail);
}

export { CustomError, thrower }