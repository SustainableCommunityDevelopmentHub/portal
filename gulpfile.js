var gulp = require('gulp');
var gulpNgConfig = require('gulp-ng-config');
var del = require('del');

/**
 * Tasks to create angular/frontend config files for client app
 * NOTE: config filename matches name of .json file it is generated from
 */

var module_name = 'app.env.config';
var file_name = 'app.env.config.json';
var config_destination = 'src/client/app/';

// delete config file if exists.
gulp.task('clean:config', function(){
  // modify if you change .json filename
  var config_file_path = config_destination + 'app.env.config.js';
  return del([ config_file_path ]);
});

gulp.task('config:local', function() {
  gulp.src('config/local/' + file_name )
    .pipe(gulpNgConfig( module_name, {wrap: true} ))
    .pipe(gulp.dest( config_destination ));
});

gulp.task('config:develop', function() {
  gulp.src('config/develop/' + file_name )
    .pipe(gulpNgConfig( module_name, {wrap: true} ))
    .pipe(gulp.dest( config_destination ));
});

gulp.task('config:prod', function() {
  gulp.src('config/prod/' + file_name )
    .pipe(gulpNgConfig( module_name, { wrap: true } ))
    .pipe(gulp.dest( config_destination ));
});
