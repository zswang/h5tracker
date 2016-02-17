var gulp = require('gulp');
var jdists = require('gulp-jdists');

gulp.task('default', function() {
	return gulp.src('src/app.js')
		.pipe(jdists())
		.pipe(gulp.dest('lib'));
});