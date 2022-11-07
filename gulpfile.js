const gulp = require('gulp'),
uglify = require('gulp-uglify'),
jshint = require('gulp-jshint'),
concat = require('gulp-concat'),
rename = require('gulp-rename'),
sass = require('gulp-sass')(require('sass'))

gulp.task('minifyjs', () =>{
	return gulp.src('js/**/*.js')
	.pipe(jshint())
	.pipe(jshint.reporter('default'))
	.pipe(concat('app.js'))
	.pipe(gulp.dest('public_html/js/'))
})



gulp.task('minifycss', () => {
	return gulp.src('scss/main.scss')
		.pipe( sass({
			outputStyle: 'compressed'
		}) )
		.pipe(gulp.dest('public_html/css/') )
})

gulp.task('minify', gulp.series(['minifyjs', 'minifycss']) )

gulp.task('default', () => {
	gulp.watch(['scss/**/*.scss', 'js/**/*.js'], (done) => {
		gulp.series(['minifyjs', 'minifycss'])(done);
	})
})