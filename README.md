### 安装开发流程
```
1.npm install
2.gulp 或者 gulp local:dev
其他:
  修改package.json的基本属性
  创建数据库
  修改configs文件夹的配置
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
- 刷表 node dist/bin/migrate.js
- ~~启动创建课程任务 nodemon dist/tasks/test.js(注意修改环境变量)~~
- 启动测试环境 gulp online:test
#### 每次发布测试前的重要修改记录
TODO:
- gulp中task类型任务
- 缓存队列
- secret 肯定会碰上改变的情况 写死在配置中不行!
- 权限系统
- email队列
- mongodb存小说数据
- 数据静态化
- redis缓存场景:少修改 数据多
- user sign-in时的令牌问题 以及过期时间
- *****ssr时的问题******
- √ views不会生成到dist中: 写gulp.task? 放到static中?不行 用gulp-sequence ? 用gulp 4.0版本? 还是 await 前 dest吧 2018-6-11 12:57:59 await 后复制的
- √ jwt 不带jwt空格
- √ ssr 还是要用cookie
- √ presenter paging()和return() 要抽离出来给ui ssr用
- √ presenter page/limit->offset/limit 丢失page offset计算出错
- 要做测试: baseBLL init . 其他项目 里 没有持续跟踪本模板的更新 导致出了许多bug
- 数据库备份
- render()前端部分: ejs/handlebars?
2018-6-20 09:45:18
```
统一文件上传限制;去掉生成的临时env.js文件;新增普通权限管理(3表,区别5表)
```