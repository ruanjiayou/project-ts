/**
 * 自定义错误类型
 */

class CustomError extends Error {
  public module: string;
  public type: string;
  public time: Date;
  constructor(module, type, detail?: any) {
    super();
    this.module = module;
    this.type = type;
    this.time = new Date()
    if (detail) {
      this.message = detail;
    }
  }
}

function thrower(module, type, detail?: any) {
  throw new CustomError(module, type, detail);
}

export { thrower }