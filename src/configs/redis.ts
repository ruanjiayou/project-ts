const redis = {
  dev: {
    host: '127.0.0.1',
    port: 6379,
    client: null
  },
  test: {
    host: '127.0.0.1',
    port: 6379,
    client: "Xquark1234"
  },
  production: {
    host: '127.0.0.1',
    port: 6379,
    client: "Xquark1234"
  }
}
export = {
  redis
}