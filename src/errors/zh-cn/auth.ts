export = {
  "tokenNotFound": {
    "code": 10100,
    "statusCode": 406,
    "message": "身份令牌token丢失"
  },
  "tokenExpired": {
    "code": 10110,
    "statusCode": 403,
    "message": "身份令牌token过期"
  },
  "approving": {
    "code": 10120,
    "statusCode": 403,
    "message": "申请中"
  },
  "unapproved": {
    "code": 10130,
    "statusCode": 401,
    "message": "申请失败"
  },
  "authFail": {
    "code": 10140,
    "statusCode": 401,
    "message": "验证失败"
  },
  "notFound": {
    "code": 10150,
    "statusCode": 404,
    "message": "账号不存在"
  },
  "existed": {
    "code": 10160,
    "statusCode": 404,
    "message": "账号已存在"
  },
  "accountError": {
    "code": 10170,
    "statusCode": 404,
    "message": "账号或密码错误"
  }
}