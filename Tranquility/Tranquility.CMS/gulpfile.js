/// <binding ProjectOpened='watch' />
/******************************************************
 * PATTERN LAB NODE
 * EDITION-NODE-GULP
 * The gulp wrapper around patternlab-node core, providing tasks to interact with the core library and move supporting frontend assets.
******************************************************/
const gulp = require('gulp'),
    config = require('./package.json'),
    changed = require('gulp-changed'),
    clean = require('gulp-clean'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    cleanCSS = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require("gulp-rename"),
    autoprefixer = require("gulp-autoprefixer"),
    jeditor = require('gulp-json-editor'),
    sassLint = require('gulp-sass-lint'),
    imagemin = require('gulp-imagemin'),
    babel = require('gulp-babel'),
    sassLintConfig = require('./sasslint-config.json'),
	externalJs = require('./a/src/scripts/external-references.json');

// Custom project tasks.

gulp.task('lint-sass', function () {
	return gulp.src(`${config.paths.src.styles}/**/*.s+(a|c)ss`)
        .pipe(sassLint(sassLintConfig))
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError());
});

gulp.task('styles', function () {
	return gulp.src(`${config.paths.src.styles}/*.s+(a|c)ss`)
       // .pipe(changed(`${config.paths.src.styles}`))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
        	browsers: [
          //
          // Official browser support policy:
          // https://v4-alpha.getbootstrap.com/getting-started/browsers-devices/#supported-browsers
          //
          'Chrome >= 35', // Exact version number here is kinda arbitrary
          // Rather than using Autoprefixer's native "Firefox ESR" version specifier string,
          // we deliberately hardcode the number. This is to avoid unwittingly severely breaking the previous ESR in the event that:
          // (a) we happen to ship a new Bootstrap release soon after the release of a new ESR,
          //     such that folks haven't yet had a reasonable amount of time to upgrade; and
          // (b) the new ESR has unprefixed CSS properties/values whose absence would severely break webpages
          //     (e.g. `box-sizing`, as opposed to `background: linear-gradient(...)`).
          //     Since they've been unprefixed, Autoprefixer will stop prefixing them,
          //     thus causing them to not work in the previous ESR (where the prefixes were required).
          'Firefox >= 38', // Current Firefox Extended Support Release (ESR); https://www.mozilla.org/en-US/firefox/organizations/faq/
          // Note: Edge versions in Autoprefixer & Can I Use refer to the EdgeHTML rendering engine version,
          // NOT the Edge app version shown in Edge's "About" screen.
          // For example, at the time of writing, Edge 20 on an up-to-date system uses EdgeHTML 12.
          // See also https://github.com/Fyrd/caniuse/issues/1928
          'Edge >= 12',
          'Explorer >= 10',
          // Out of leniency, we prefix these 1 version further back than the official policy.
          'iOS >= 8',
          'Safari >= 8',
          // The following remain NOT officially supported, but we're lenient and include their prefixes to avoid severely breaking in them.
          'Android 2.3',
          'Android >= 4',
          'Opera >= 12'
        	]
        }))
        .pipe(cleanCSS({ debug: true, semanticMerging: true }, function (details) {
        	console.log(`Original ${details.name}: ${details.stats.originalSize}`);
        	console.log(`Cleaned ${details.name}: ${details.stats.minifiedSize} (${Math.round((details.stats.minifiedSize / details.stats.originalSize) * 100)}%)`);
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(config.paths.dist.styles))
      //  .pipe(browserSync.stream());
})


/******************************************************
 * COPY TASKS - stream assets from source to destination
******************************************************/
// JS copy
gulp.task('js', function () {
	return gulp.src('**/*.js', { cwd: config.paths.src.scripts })
        .pipe(babel({
        	presets: ['es2015']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.paths.dist.scripts));
});

// Copy external frameworks over.
gulp.task('external-js', function () {
	return gulp.src(externalJs.references)
      .pipe(gulp.dest(config.paths.dist.scripts));
});

// Images copy
gulp.task('img', function () {
	return gulp.src(`${config.paths.src.images}/**/*.*`)
		.pipe(changed(config.paths.dist.images))
        .pipe(imagemin())
        .pipe(gulp.dest(config.paths.dist.images));
});

// CSS Copy
gulp.task('css', gulp.series('lint-sass', 'styles'));

function paths() {
	return config;
}

function build(done) {
	patternlab.build(done, getConfiguredCleanOption());
}

gulp.task('build', gulp.series(
  gulp.parallel(
    'css',
    'js',
    'external-js',
    'img'
  ),
  function (done) {
  	done();
  })
);

function watch() {
	gulp.watch(`${config.paths.src.styles}/**/*.scss`, { awaitWriteFinish: true }).on('change', gulp.series('css'));
	gulp.watch(`${config.paths.src.js}/**/*.js`, { awaitWriteFinish: true }).on('change', gulp.series('js'));
	gulp.watch(`${config.paths.src.images}/**/*.*`, { awaitWriteFinish: true }).on('change', gulp.series('img'));
}

/******************************************************
 * COMPOUND TASKS
******************************************************/
gulp.task('default', gulp.series('build'));
gulp.task('watch', gulp.series('build', watch));