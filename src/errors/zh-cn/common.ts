export = {
  "exists": {
    "code": 10200,
    "statusCode": 200,
    "message": "exists!"
  },
  "notFound": {
    "code": 10210,
    "statusCode": 200,
    "message": "not found!"
  },
  "invalid": {
    "code": 10220,
    "statusCode": 400,
    "message": "validate error!"
  },
  "unknown": {
    "code": 10230,
    "statusCode": 500,
    "message": "internal server error!"
  },
  "unauthorized": {
    "code": 10240,
    "statusCode": 400,
    "message": "user unauthorized!"
  },
  "versionNotFound": {
    "code": 10250,
    "statusCode": 404,
    "message": "api version not used!"
  }
}