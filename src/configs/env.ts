const env = {
  dev: {
    NODE_ENV: 'dev',
    debug: 'APP:*',
    port: 3000
  },
  test: {
    NODE_ENV: 'test',
    debug: 'APP:*',
    port: 3000
  },
  production: {
    NODE_ENV: 'production',
    debug: 'APP:*',
    port: 3000
  }
}
export {
  env
}