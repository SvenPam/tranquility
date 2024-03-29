﻿/// <binding ProjectOpened='watch' />
/******************************************************
 * PATTERN LAB NODE
 * EDITION-NODE-GULP
 * The gulp wrapper around patternlab-node core, providing tasks to interact with the core library and move supporting frontend assets.
******************************************************/
const gulp = require('gulp'),
    pckg = require('./package.json'),
    $ = require('gulp-load-plugins')({ lazy: true });

const sass = require('gulp-sass')(require('node-sass'));

// Custom project tasks.

gulp.task('lint-sass', function () {
    return gulp.src(`${pckg.paths.src.styles}/**/*.s+(a|c)ss`)
        .pipe($.sassLint(pckg.sassLintConfig))
        .pipe($.sassLint.format())
        .pipe($.sassLint.failOnError());
});

gulp.task('lint-js', function () {
    return gulp.src(`${pckg.paths.src.styles}/**/*.js`)
        .pipe($.jshint(pckg.jshintConfig))
        .pipe($.jshint.reporter('default'))
        .pipe($.jshint.reporter('fail'))
})


gulp.task('styles', function () {
    return gulp.src(`${pckg.paths.src.styles}/*.s+(a|c)ss`)
        .pipe($.sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe($.autoprefixer({
            browsers: [
                'Chrome >= 35',
                'Firefox >= 38',
                'Edge >= 12',
                'Explorer >= 10',
                'iOS >= 8',
                'Safari >= 8',
                'Android 2.3',
                'Android >= 4',
                'Opera >= 12'
            ]
        }))
        .pipe($.cleanCss({ debug: true, semanticMerging: true }, function (details) {
            console.log(`Original ${details.name}: ${details.stats.originalSize}`);
            console.log(`Cleaned ${details.name}: ${details.stats.minifiedSize} (${Math.round((details.stats.minifiedSize / details.stats.originalSize) * 100)}%)`);
        }))
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest(pckg.paths.dist.styles))
})

// Images copy
gulp.task('img', function () {
    return gulp.src(`${pckg.paths.src.images}/**/*.*`)
        .pipe($.changed(pckg.paths.dist.images))
        .pipe($.imagemin())
        .pipe(gulp.dest(pckg.paths.dist.images));
});

// CSS Copy
gulp.task('css', gulp.series('lint-sass', 'styles'));

gulp.task('build', gulp.series(
    gulp.parallel(
        'css',
        'img'
    ),
    function (done) {
        done();
    })
);

function watch() {
    gulp.watch(`${pckg.paths.src.styles}/**/*.scss`, { awaitWriteFinish: true }).on('change', gulp.series('css'));
    gulp.watch(`${pckg.paths.src.images}/**/*.*`, { awaitWriteFinish: true }).on('change', gulp.series('img'));
}

/******************************************************
 * COMPOUND TASKS
******************************************************/
gulp.task('default', gulp.series('build'));
gulp.task('watch', gulp.series('build', watch));