/* jshint node: true */
var gulp = require('gulp');
//var common = require('./gulp/common.js');
var bytediff = require('gulp-bytediff');
var del = require('del');
var gulpNgConfig = require('gulp-ng-config');
var gulpIgnore = require('gulp-ignore');
var pkg = require('./package.json');
var plug = require('gulp-load-plugins')();
var sourcemaps = require('gulp-sourcemaps');

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

gulp.task('minify_js', ['minify_vendorjs', 'concat_vendorjs', 'minify:app:core'], function(){
  console.log('Vendor javascript should now be minified and you should see in src/client/app the files vendor.min.js and more_vendors.min.js.');
});

// Minify and concat js of application core
// Make sure app start and core are executed in browser before rest of the application
gulp.task('minify:app:core', function() {
  return gulp.src(['./src/client/app/app.module.js', './src/client/app/app.env.config.js', '!./src/client/**/*.spec.js'])
    .pipe(sourcemaps.init())
      .pipe(plug.concat('app_core.min.js'))
      .pipe(plug.uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(pkg.paths.build)); // + 'vendor'));
});

// Minify and concat unminified vendorjs
gulp.task('minify_vendorjs', function() {
  return gulp.src(pkg.paths.vendorjs)
    .pipe(sourcemaps.init())
      .pipe(plug.concat('more_vendors.min.js'))
      .pipe(plug.uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(pkg.paths.build)); // + 'vendor'));
});

// concat the already minified vendors
gulp.task('concat_vendorjs', function() {
  return gulp.src(pkg.paths.minified_vendorjs)
    .pipe(sourcemaps.init())
      .pipe(plug.concat('vendor.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(pkg.paths.build)); // + 'vendor'));
});
