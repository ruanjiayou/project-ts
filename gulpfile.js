const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const ts = require('gulp-typescript');
const apidoc = require('gulp-apidoc');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const tsProject = ts.createProject('tsconfig.json');
const pm2 = require('pm2');
const path = require('path');

gulp.task('clean', () => {
  return gulp
    .src('./dist', { read: false })
    .pipe(clean());
});

gulp.task('doc', (done) => {
  apidoc({ src: 'src/routes', dest: 'static/doc', debug: true }, done);
});

gulp.task('dist', ['clean'], async () => {
  await new Promise((resolve) => {
    tsProject.src()
      .pipe(sourcemaps.init())
      .pipe(tsProject()).js
      // .pipe(sourcemaps.write('./maps', {
      //   sourceRoot: (file) => {
      //     return path.join(file.cwd, 'lib');
      //   }
      // }))
      .pipe(babel({
        presets: ['es2015'] // es5检查机制
      }))
      .pipe(uglify())
      .pipe(gulp.dest('dist'))
      .on('finish', () => {
        return resolve();
      });
  });
  gulp.src('src/views/**/*')
    .pipe(gulp.dest('dist/views'));
});

// 本地发布(dev/test两种)
var localPublish = (mode) => {
  const env = require('./dist/configs/env').env[mode];
  env.NODE_ENV = mode;
  var stream = nodemon({
    script: './launch.js',
    watch: ['src'],
    ext: 'ts json html',
    tasks: ['dist'],
    delay: '2500',
    env: env
  });
  stream
    .on('restart', () => { console.log('restarted!'); })
    .on('crash', (err) => {
      console.error(err);
      console.error('服务器挂了,server crashed!\n');
      stream.emit('restart', 10);  // restart the server in 10 seconds
    })
    .on('exit', (/* code */) => {
      //stream.emit('quit');
      //process.exit(code);
    });
};
// 线上发布(test/production两种)
var onlinePublish = (mode) => {
  const env = require('./dist/configs/env').env[mode];
  env.NODE_ENV = mode;
  var pmList = () => {
    return new Promise((resolve, reject) => {
      pm2.list((err, list) => {
        if (err) return reject(err);
        return resolve(list);
      });
    });
  };
  var pmDelete = (pmId) => {
    return new Promise((resolve, reject) => {
      pm2.delete(pmId, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  };
  var pmStart = () => {
    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) {
          if (err) return reject(err);
        }
        // 可在这里修改env的port
        // env.port = 3010;
        pm2.start({
          name: env.project,
          script: './launch.js',         // Script to be run
          env: env,
        }, (err) => {
          if (err) return reject(err);
          pm2.disconnect();   // Disconnects from PM2
          return resolve();
        });
      });
    });
  };
  return new Promise((resolve) => {
    pmList().then((res) => {
      const instance = res.find((item) => {
        return item.name === env.project;
      });
      if (instance) {
        return pmDelete(instance.pm_id);
      }
      return resolve();
    }).then(() => {
      return pmStart();
    }).then(() => {
      process.exit(2);
    }).catch((err) => {
      console.error(err);
      process.exit(2);
    });
  });
};
// 本地开发,连本地数据库
gulp.task('local:dev', ['dist'], () => {
  localPublish('dev');
});
// 本地开发,连测试数据库
gulp.task('local:test', ['dist'], () => {
  localPublish('test');
});
// 测试服务器环境
gulp.task('online:test', ['dist', 'doc'], () => {
  onlinePublish('test');
});
// 线上服务器环境
gulp.task('online:production', ['dist', 'doc'], () => {
  onlinePublish('production');
});

gulp.task('default', ['local:dev']);