var gulp = require('gulp');
var jdists = require('gulp-jdists');
var rename = require('gulp-rename');

gulp.task('example', function() {
  return gulp.src('example.jdists.js')
    .pipe(jdists())
    .pipe(rename("example.js"))
    .pipe(gulp.dest('test'));
});

gulp.task('default', function() {
	return gulp.src('src/app.js')
		.pipe(jdists())
    // .pipe(uglify())
		.pipe(gulp.dest('lib'));
});