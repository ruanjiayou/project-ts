/**
 * 自定义错误类型
 */

class Hinter extends Error {
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

export default Hinter;