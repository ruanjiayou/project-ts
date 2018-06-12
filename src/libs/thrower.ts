/**
 * 自定义错误类型
 */
class CustomError extends Error {
  public module: string;
  public type: string;
  public time: Date;
  /**
   * 扩展基本错误类型
   * @param module 错误模块,common
   * @param type 错误类型, notFound
   * @param detail 详情
   */
  constructor(module, type, detail: string = '') {
    super();
    this.module = module;
    this.type = type;
    this.time = new Date();
    this.message = detail;
  }
}
/**
 * 抛出自定义类型错误
 * @param module 错误模块,common
 * @param type 错误类型, notFound
 * @param detail 详情
 */
function thrower(module, type, detail: string = '') {
  const err = new CustomError(module, type, detail)
  throw err;
}

export { CustomError, thrower }