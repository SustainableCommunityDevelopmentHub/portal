var gulp = require('gulp');
var gulpNgConfig = require('gulp-ng-config');
var del = require('del');
var pkg = require('./package.json');

/**
 * Build files for angular app
 * NOTE: angular.js config filename must match name of .json file it is generated from.
 * If you change name of app.env.config.json files, update the module_name var.
 */
var module_name = 'app.env.config';

// delete config file.
gulp.task('clean:config', function(){
  return del([ pkg.paths.angularConfigFilePath ]);
});

gulp.task('config:local', function() {
  gulp.src(pkg.paths.angularConfigLocal)
    .pipe(gulpNgConfig( module_name, {wrap: true} ))
    .pipe(gulp.dest( pkg.paths.angularSource ));
});

gulp.task('config:develop', function() {
  gulp.src(pkg.paths.angularConfigDevelop)
    .pipe(gulpNgConfig( module_name, {wrap: true} ))
    .pipe(gulp.dest( pkg.paths.angularSource ));
});

gulp.task('config:prod', function() {
  gulp.src(pkg.paths.angularConfigProd)
    .pipe(gulpNgConfig( module_name, { wrap: true } ))
    .pipe(gulp.dest( pkg.paths.angularSource ));
});

/**
 * Minify javascript
 */

