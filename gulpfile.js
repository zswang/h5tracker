/*jshint globalstrict: true*/
/*global require*/

'use strict';

var gulp = require('gulp');
var util = require('util');
var jdists = require('gulp-jdists');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var open = require('gulp-open');
var less = require('gulp-less');
var examplejs = require('gulp-examplejs');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('example', function() {
  return gulp.src([
    'src/**/*.js',
    '!src/inline.js',
    '!src/storage-keys.js'
    ])
    .pipe(examplejs({
      header: `
var dom = require('./lib/dom');
global.window = dom.window;
global.document = dom.document;
global.localStorage = dom.localStorage;
global.sessionStorage = dom.sessionStorage;

require('../src/index.js');
var app = window.h5t.app;
      `
    }))
    .pipe(gulp.dest('test'));
});

gulp.task('build', function() {
  return gulp.src(['src/index.js'])
    .pipe(jdists({
      trigger: 'release',
      remove: 'remove,debug,test,safe'
    }))
    .pipe(rename('h5tracker.js'))
    .pipe(gulp.dest('./'))
    .pipe(uglify())
    .pipe(rename('h5tracker.min.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('buildInline', function() {
  return gulp.src(['src/inline.js'])
    .pipe(jdists({
      trigger: 'release'
    }))
    .pipe(gulp.dest('./lib'))
    .pipe(uglify())
    .pipe(rename('inline.min.js'))
    .pipe(gulp.dest('./lib'));
});

gulp.task('buildDev', function() {
  gulp.src(['example/base.html'])
    .pipe(jdists({
      trigger: 'debug'
    }))
    .pipe(rename('base.dev.html'))
    .pipe(gulp.dest('./example'));

  gulp.src(['src/index.js'])
    .pipe(jdists({
      trigger: 'debug'
    }))
    .pipe(rename('h5tracker.dev.js'))
    .pipe(gulp.dest('./'));
});

var debugPort = 8111;

function debugAddress() {
  var net = require('os').networkInterfaces();
  var result;
  Object.keys(net).some(function(key) {
    return net[key].some(function(item) {
      if (!item.internal && item.family === 'IPv4') {
        result = item.address;
        return true;
      }
    });
  });
  return result;
}

gulp.task('connect', function() {
  connect.server({
    root: './',
    port: debugPort,
    livereload: true
  });
});

gulp.task('html', function() {
  gulp.src(['./example/*.html', './tools/**/*.html|css|js'])
    .pipe(connect.reload());
});

gulp.task('open', function() {
  gulp.src(__filename)
    .pipe(open({
      uri: util.format('http://%s:%s/example/base.dev.html', debugAddress(), debugPort)
    }));
});

gulp.task('less', function() {
  gulp.src('./tools/less/*.less')
    .pipe(less())
    .pipe(autoprefixer({
      cascade: true,
      remove:true
    }))
    .pipe(gulp.dest('./tools/css/'));
})

gulp.task('watch', function() {
  gulp.watch(['src/*.js', 'example/*.html', './tools/**/*.*'], ['buildDev', 'buildInline', 'html' ,'less']);
});

gulp.task('debug', ['buildDev', 'buildInline', 'html', 'connect', 'open', 'watch']);

gulp.task('default', ['build', 'buildInline']);
