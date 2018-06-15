import { email as emailCfg } from '../configs';
import { logger } from './logger';
import * as _ from 'lodash';
import * as nodemailer from 'nodemailer';
import * as smtpTransport from 'nodemailer-smtp-transport';

const emailLogger = logger('email');
// 开启一个SMTP连接池
const transport = nodemailer.createTransport(smtpTransport(emailCfg));
const sendMail = async (users, subject, html) => {
  emailLogger.info('xxx');
  const opts = {
    from: emailCfg.auth.user,
    subject,
    html
  };
  const to = users.map((user) => { return user.email; }).join(', ');
  await transport.sendMail(_.extend(opts, {
    to
  }), (err, res) => {
    if (err) {
      console.log(err, 'send email error');
    } else {
      console.log('Message sent: %s', res.messageId);
      console.log('preview url: %s', nodemailer.getTestMessageUrl(res));
    }
  });
}

export {
  sendMail
}