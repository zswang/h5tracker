/*jshint globalstrict: true*/
/*global require*/

'use strict';

var gulp = require('gulp');
var jdists = require('gulp-jdists');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');

gulp.task('example', function () {
  return gulp.src('example.jdists.js')
    .pipe(jdists())
    .pipe(rename('example.js'))
    .pipe(gulp.dest('test'));
});

gulp.task('build', function () {
  return gulp.src(['src/index.js'])
    .pipe(jdists({trigger: 'release'}))
    .pipe(rename('h5tracker.js'))
    .pipe(gulp.dest('./'))
    .pipe(uglify())
    .pipe(rename('h5tracker.min.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('buildInline', function () {
  return gulp.src(['src/inline.js'])
    .pipe(jdists({trigger: 'release'}))
    .pipe(gulp.dest('./lib'))
    .pipe(uglify())
    .pipe(rename('inline.min.js'))
    .pipe(gulp.dest('./lib'));
});

gulp.task('buildDev', function () {
  return gulp.src(['src/index.js'])
    .pipe(jdists({trigger: 'debug'}))
    .pipe(rename('h5tracker.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('connect', function() {
  connect.server({
    root: './',
    port: 8111,
    livereload: true
  });
});

gulp.task('html', function () {
  gulp.src('./example/*.html')
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(['src/*.js', 'example/*.html'], ['buildDev', 'buildInline', 'html']);
});

gulp.task('debug', ['buildDev', 'buildInline', 'html', 'connect', 'watch']);

gulp.task('default', ['build', 'buildInline']);