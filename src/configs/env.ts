const env = {
  dev: {
    NODE_ENV: 'dev',
    debug: 'APP:*',
    port: 3004
  },
  test: {
    NODE_ENV: 'test',
    debug: 'APP:*',
    port: 3004
  },
  production: {
    NODE_ENV: 'production',
    debug: 'APP:*',
    port: 3004
  }
}
export {
  env
}