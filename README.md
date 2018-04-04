TODO:
- 日志
- 环境变量
- i18n
- 缓存队列
- 上传
- 版本
- 跨域
- system.ts 有敏感信息没上传
- √ 环境变量env传递方式
- √ weHelper修改
- √ migrate修改为ts?服务器不支持async/await
### 安装开发流程
```
1.npm install
2.gulp dev
```
### API测试流程
```
具体看 src/tests/测试流程.md
```
### 测试服务器部署流程
- 登录测试服务器 
- *克隆项目 git clone git@github.com:ruanjiayou/project-name.git
- 进入测试目录 cd ~/project-name
- 拉取dev分支最新代码 git pull
- *npm install
- 刷表 node bin/migrate.js
- ~~启动创建课程任务 nodemon dist/tasks/test.js(注意修改环境变量)~~
- 启动测试环境 gulp online:test
#### 每次发布测试前的重要修改记录
```

```