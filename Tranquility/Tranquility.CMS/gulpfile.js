/// <binding ProjectOpened='watch' />
const gulp = require('gulp');
const changed = require('gulp-changed');
const clean = require('gulp-clean');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const runSequence = require('run-sequence');
const rename = require("gulp-rename");
const imagemin = require('gulp-imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
var gutil = require('gulp-util');

const projectProperties =
{
	assetDirectory: 'a',
	sourceName: '/src',
	distName: '/dist'
}

const path = {
	build: {
		style: `${projectProperties.assetDirectory + projectProperties.distName}/css`,
		js: `${projectProperties.assetDirectory + projectProperties.distName}/js`,
		img: `${projectProperties.assetDirectory + projectProperties.distName}/img`,
		config: `${projectProperties.assetDirectory + projectProperties.distName}`
	},
	src: {

		style: `${projectProperties.assetDirectory + projectProperties.sourceName}/styles`,
		js: `${projectProperties.assetDirectory + projectProperties.sourceName}/scripts`,
		img: `${projectProperties.assetDirectory + projectProperties.sourceName}/images`,
		config: `${projectProperties.assetDirectory + projectProperties.sourceName}`
	},
	clean: `${projectProperties.assetDirectory + projectProperties.distName}`
};

gulp.task('default', () => {
	runSequence('clean', ['styles', 'images', 'scripts', 'externalScripts', 'configs']);
});
gulp.task('clean', () =>
	gulp.src([`${path.clean}/*`, `!${path.build.img}`], { read: false })
        .pipe(clean({ force: true }))
);
gulp.task('styles', () =>
	gulp.src([`${path.src.style}/ste-pam.scss`])
	  .pipe(sourcemaps.init())
	  .pipe(changed(path.build.style))
	  .pipe(sass().on('error', sass.logError))
	  .pipe(cleanCSS())
	  .pipe(rename({ suffix: '.min' }))
	  .pipe(sourcemaps.write('./'))
	  .pipe(gulp.dest(path.build.style))
);
gulp.task('images', () =>
	gulp.src(`${path.src.img}/**/**.**`)
        .pipe(changed(path.build.img))
        .pipe(imagemin([
            imageminJpegRecompress({
            	quality: 'low',
            	progressive: true
            }),
            imagemin.gifsicle(),
            imagemin.optipng(),
            imagemin.svgo()
        ]))
        .pipe(gulp.dest(path.build.img))
);

gulp.task('scripts', () => {
	return gulp.src([`${path.src.js}/**.js`])
        .pipe(sourcemaps.init())
        .pipe(concat('site.js'))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.build.js))
});
gulp.task('externalScripts', () => {
	return gulp.src([`${path.src.js}/external/**.js`])
        .pipe(sourcemaps.init())
        .pipe(concat('external.js'))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.build.js))
});

gulp.task('configs', () =>
	gulp.src(`${path.src.config}/Web.config`)
        .pipe(gulp.dest(path.build.config))
);

gulp.task('watch', () => {
	gulp.watch(`${path.src.style}/**/*.scss`, ['styles']);
	gulp.watch(`${path.src.img}/**/**.**`, ['images']);
	gulp.watch(`${path.src.js}/**.js`, ['scripts']);
	gulp.watch(`${path.src.js}/external/**.js`, ['externalScripts']);
});