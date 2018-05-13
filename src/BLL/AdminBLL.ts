import * as _ from 'lodash';
import { BaseBLL } from './BaseBLL';
import libs from '../libs';

const { auth, thrower, Validater, wxHelper } = libs;

class AdminBLL extends BaseBLL {
  constructor() {
    super();
    this.model = this.models.Admin;
  }
  async signIn(data) {
    const validater = new Validater({
      rules: {
        phone: 'required|string|length:6,18',
        password: 'required|string|length:32'
      }
    });
    const input = validater.validate(data);
    const admin = await this.get({ where: { phone: input.phone } });
    if (_.isNil(admin)) {
      thrower('auth', 'notFound');
    }
    if (!admin.auth(input.password)) {
      thrower('auth', 'accountError');
    }
    const token = auth.encode({ role: '', session: '' });
    return token;
  }
  async signUp(data) {
    const validater = new Validater({
      rules: {
        phone: 'required|string',
        name: 'required|string',
        password: 'required|string'
      }
    });
    const input = validater.validate(data);
    let admin = await this.model.findOne({ where: { phone: input.phone } });
    if (_.isNil(admin)) {
      admin = await this.create(input);
    } else {
      thrower('auth', 'existed');
    }
    return admin;
  }
  async auth(req) {
    const data = auth.decode(req);
    const adminSession = await this.models.AdminSession.scope(['includeAdmin']).findOne({ where: { session: data.session } });
    if (_.isNil(adminSession)) {
      thrower('auth', 'authFail');
    }
    return adminSession.admin;
  }
  async OAuth() {

  }
  async create(data, t = {}) {
    return await this.model.create(data, t);
  }
}

export default AdminBLL;