export = {
  "exists": {
    "code": 10200,
    "statusCode": 409,
    "message": "已存在"
  },
  "notFound": {
    "code": 10210,
    "statusCode": 404,
    "message": "所需资源没找到"
  },
  "notFoundJsonFile": {
    "code": 10211,
    "statusCode": 404,
    "message": "没找到定义的错误json文件"
  },
  "validation": {
    "code": 10220,
    "statusCode": 400,
    "message": "validate error"
  },
  "unknown": {
    "code": 10230,
    "statusCode": 500,
    "message": "内部服务器未知错误"
  },
  "versionNotFound": {
    "code": 10250,
    "statusCode": 409,
    "message": "该API版本已不被支持"
  }
}