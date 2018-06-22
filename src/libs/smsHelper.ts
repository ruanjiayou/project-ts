import { aliSms } from '../configs/aliSms';

const SMSClient = require('@alicloud/sms-sdk');
const smsClient = new SMSClient({ accessKeyId: aliSms.accessKeyId, secretAccessKey: aliSms.secretAccessKey });
class smsHelper {
  static async sendSMS(phone, tpl, params) {
    if (phone == null) {
      return null;
    }
    try {
      const res = await smsClient.sendSMS({
        PhoneNumbers: phone,
        SignName: tpl.SignName,
        TemplateCode: tpl.TemplateCode,
        TemplateParam: JSON.stringify(params)
      });
      return res;
    } catch (err) {
      console.log(err, 'smsError');
      return null;
    }
  }
}

export { smsHelper }