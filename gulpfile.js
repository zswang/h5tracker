/*jshint globalstrict: true*/
/*global require*/

'use strict';

var gulp = require('gulp');
var jdists = require('gulp-jdists');
var rename = require('gulp-rename');
var livereload = require('gulp-livereload');
var watch = require('gulp-watch');

gulp.task('example', () => {
  return gulp.src('example.jdists.js')
    .pipe(jdists())
    .pipe(rename('example.js'))
    .pipe(gulp.dest('test'));
});

gulp.task('default', () => {
  return gulp.src(['src/entry.js'])
    .pipe(jdists())
    .pipe(uglify())
    .pipe(gulp.dest('lib'));
});

gulp.task('live', () => {
  return gulp.src(['src/entry.js'])
    .pipe(jdists())
    .pipe(gulp.dest('lib'))
    .pipe(livereload());;
});

const http = require('http');
const fs = require('fs');
const path = require('path');
gulp.task('debug', () => {

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html'});
    console.log(req.url);
    switch (req.url) {
      case '/':
        res.write(fs.readFileSync('example/base.html'));
        break;
      case '/lib/entry.js':
        res.write(fs.readFileSync(path.join('.', req.url)));
        break;
    }
    res.end();
  });

  server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });
  server.listen(8111);
  livereload.listen();

  watch(['src/entry.js', 'example/base.html'], function() {
    gulp.start("live");
  });
  // gulp-open

});