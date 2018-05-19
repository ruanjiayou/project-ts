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
TODO:
libs和configs文件夹 不循环遍历;必须验证是文件类型:为了放adapter这样的文件夹...
gulp中task类型任务
- i18n
- 缓存队列
- secret 肯定会碰上改变的情况 写死在配置中不行!
- 权限系统
- bll按车辆辆项目的改
```