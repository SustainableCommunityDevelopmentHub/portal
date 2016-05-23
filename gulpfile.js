var gulp = require('gulp');
var gulpNgConfig = require('gulp-ng-config');
var del = require('del');

/**
 * Tasks to create angular/frontend config files for client app
 * NOTE: config filename matches name of .json file it is generated from
 */

var config_dest = 'src/client/app/';

// delete config file if exists.
gulp.task('clean:config', function(){
  // modify if you change .json filename
  var file_path = config_dest + 'app.env.config.js';
  return del([ file_path ]);
});

// local
gulp.task('config:local', function() {
  gulp.src('config/local/app.env.config.json')
    .pipe(gulpNgConfig('app.config'))
    .pipe(gulp.dest('src/client/app'));
});

// develop
gulp.task('config:dev', function() {
  gulp.src('config/develop/app.env.config.json')
    .pipe(gulpNgConfig('app.config'))
    .pipe(gulp.dest('src/client/app'));
});

// production
gulp.task('config:prod', function() {
  gulp.src('config/prod/app.env.config.json')
    .pipe(gulpNgConfig('app.config'))
    .pipe(gulp.dest('src/client/app'));
});
