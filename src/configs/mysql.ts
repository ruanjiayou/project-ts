const mysql = {
  dev: {
    "username": "root",
    "password": "7758",
    "host": "127.0.0.1",
    "port": 3306,
    "dialect": "mysql",
    "database": "project_template",
    "timezone": "+08:00",
    "pool": {
      "max": 200,
      "idle": 10000
    }
  },
  test: {
    "username": "root",
    "password": "",
    "host": "127.0.0.1",
    "port": 3306,
    "dialect": "mysql",
    "database": "qsyb",
    "timezone": "+08:00",
    "pool": {
      "max": 200,
      "idle": 10000
    }
  },
  production: {
    "username": "root",
    "password": "",
    "host": "127.0.0.1",
    "port": 3306,
    "dialect": "mysql",
    "database": "qsyb",
    "timezone": "+08:00",
    "pool": {
      "max": 200,
      "idle": 10000
    }
  }
}
export {
  mysql
}