const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const fs = require('fs');
const clean = require('gulp-clean');
const apidoc = require('gulp-apidoc');
const tsProject = ts.createProject('tsconfig.json');
const pm2 = require('pm2');
const path = require('path');

// 生成NODE_ENV环境变量 启动项目时根据MODE读取对应env
var createModeConfig = function (mode) {
  fs.writeFileSync(path.join(__dirname, 'dist/node-env-mode.json'), JSON.stringify({ mode: mode }));
};

gulp.task('dist', ['clean'], () => {
  return new Promise((resolve) => {
    tsProject.src()
      .pipe(sourcemaps.init())
      .pipe(tsProject()).js
      .pipe(sourcemaps.write('./maps', {
        sourceRoot: (file) => {
          return path.join(file.cwd, 'lib');
        }
      }))
      .pipe(gulp.dest('dist'))
      .on('finish', () => {
        createModeConfig('dev');
        return resolve();
      });
  }).catch((err) => {
    return console.error(err);
  });
});

gulp.task('clean', () => {
  return gulp
    .src('./dist', { read: false })
    .pipe(clean());
});

gulp.task('doc', (done) => {
  apidoc({ src: 'src/routes', dest: 'static/doc', debug: true }, done);
});

// 本地发布(dev/test两种)
var localPublish = (mode) => {
  createModeConfig(mode);
  const env = require('./dist/configs/env')[mode];
  var stream = nodemon({
    script: 'dist/app.js',
    watch: ['src'],
    ext: 'ts json',
    tasks: ['dist'],
    delay: '2500',
    env: env
  });
  stream
    .on('restart', () => { console.log('restarted!'); })
    .on('crash', (err) => {
      console.error(err);
      console.error('Application has crashed!\n');
      stream.emit('restart', 10);  // restart the server in 10 seconds
    })
    .on('exit', (code) => {
      //stream.emit('quit');
      //process.exit(code);
    });
};
// 线上发布(test/production两种)
var onlinePublish = (mode) => {
  createModeConfig(mode);
  const env = require('./dist/configs/env')[mode];
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
        env.PORT = 3010;
        pm2.start({
          name: 'qingSongYiBai-server',
          script: './dist/app.js',         // Script to be run
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

gulp.task('local:dev', ['dist'], () => {
  localPublish('dev');
});

gulp.task('local:test', ['dist'], () => {
  localPublish('test');
});

gulp.task('online:test', ['dist', 'doc'], () => {
  onlinePublish('test');
});

gulp.task('online:production', ['dist', 'doc'], () => {
  onlinePublish('production');
});