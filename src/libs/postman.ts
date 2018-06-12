import { email as emailCfg } from '../configs';
import { logger } from './logger';
import * as _ from 'lodash';
import * as nodemailer from 'nodemailer';
import * as smtpTransport from 'nodemailer-smtp-transport';

const emailLogger = logger('email');
// 开启一个SMTP连接池
const transport = nodemailer.createTransport(smtpTransport(emailCfg));
const sendMail = async (users, subject, html) => {
  emailLogger.info('');
  const opts = {
    from: ``,
    subject,
    html
  };
  const emails = [];
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    emails.push(async () => {
      // 发送邮件
      await transport.sendMail(_.extend(opts, {
        to: `${user.name} <${user.email}>`
      }), (err, res) => {
        if (err) {
          console.log(err, 'send email error');
        }
      });
    });
    Promise.all(emails);
  }
}

export {
  sendMail
}