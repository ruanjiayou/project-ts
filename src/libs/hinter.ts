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

function throwHinter(module, type, detail?: any) {
  throw new Hinter(module, type, detail);
}

export default throwHinter;