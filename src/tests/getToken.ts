import auth from '../libs/auth';
// 生成一个token,assistant登录,测试时无法根据code获取openid
const authToken = auth.encode({ refreshToken: '89757', token: '123456 ' });
console.log(authToken);