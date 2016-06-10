/* jshint node: true */
var gulp = require('gulp');
//var common = require('./gulp/common.js');
var bytediff = require('gulp-bytediff');
var del = require('del');
var gulpNgConfig = require('gulp-ng-config');
var pkg = require('./package.json');
var plug = require('gulp-load-plugins')();

//var log = plug.util.log;

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

// Minify and concat our javascript
gulp.task('minify_concat_js', function() {
  var src_arr = ['./src/client/app/app.module.js','./src/client/app/app.env.config.js','./src/client/app/app.config.routing.js','./src/client/app/app.directive.js', '.src/client/app/app.controller.js', './src/client/app/*/*.js', '!./src/client/app/*.unit.spec.js', '!./src/client/app/*/*.unit.spec.js'];
  // read in all js files in js path in package.json, ignore if they are spec files
  return gulp.src(['./src/client/app/*.js', './src/client/app/*/*.js', '!./src/client/app/*.unit.spec.js', '!./src/client/app/*/*.unit.spec.js'])
    .pipe(plug.concat('app.min.js'))
    .pipe(plug.uglify())
    .pipe(gulp.dest(pkg.paths.build)); // + 'vendor'));
});

// Minify and concat unminified vendorjs
gulp.task('minify_vendorjs', function() {
  return gulp.src(pkg.paths.vendorjs)
    .pipe(plug.concat('more_vendors.min.js'))
    .pipe(plug.uglify())
    .pipe(gulp.dest(pkg.paths.build)); // + 'vendor'));
});

// concat the already minified vendors
gulp.task('concat_vendorjs', function() {
  return gulp.src(pkg.paths.minified_vendorjs)
    .pipe(plug.concat('vendor.min.js'))
    .pipe(gulp.dest(pkg.paths.build)); // + 'vendor'));
});
