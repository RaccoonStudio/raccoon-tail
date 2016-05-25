/*jshint -W079 */
'use strict';

/*
 * Gulp components
 */

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _gulpLoadPlugins = require('gulp-load-plugins');

var _gulpLoadPlugins2 = _interopRequireDefault(_gulpLoadPlugins);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _gulpSync = require('gulp-sync');

var _gulpSync2 = _interopRequireDefault(_gulpSync);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Project configuration
 */
var project = {
  name: 'Raccoon\'s Tail', // project name for gulp-notify
  url: 'https://raccoon.studio', // project dev url
  preprocessor: {
    js: 'es2015' },
  // choose 'es2015' or another installed babel preset
  conf: {
    suffix: '.min', // suffix add to prod concat & minified files
    // gulp-autoprefixer configuration
    autoprefixer: ['> 1%', 'Firefox ESR', 'last 2 versions', 'not ie <= 10']
  }
};

var paths = {
  root: './',
  src: {
    styles: {
      less: './less/styles.less',
      lessFiles: './less/*.less',
      sass: './scss/styles.scss',
      sassFiles: './scss/*.scss'
    }
  },
  vendors: './node_modules',
  dist: {
    styles: './css',
    cssFiles: './css/*.css',
    cssMinFiles: './css/*' + project.conf.suffix + '.css'
  }
};

var vendors = {
  list: []
};

/*
 * Gulp components init
 */

var $ = (0, _gulpLoadPlugins2.default)();
var gulpSync = (0, _gulpSync2.default)(_gulp2.default);

/*
 * Command flags
 */

var args = _yargs2.default.argv;
var isBrowserSync = args.browsersync;

/*
 * Error task
 */

var onError = {
  errorHandler: function errorHandler(err) {
    console.log(err);
    $.notify.onError({
      title: 'Gulp ' + project.name,
      subtitle: 'Erreur de compilation',
      message: 'Erreur : <%= error.message %>'
    })(err);
    this.emit('end');
  }
};

/*
 * Gulp tasks: css, js, img, fonts, icons
 */

// Less task: less compilation + (src -> dist)
_gulp2.default.task('less', function () {
  return _gulp2.default.src(paths.src.styles.less).pipe($.plumber(onError)).pipe($.less()).pipe(_gulp2.default.dest(paths.dist.styles));
});

// Sass task: sass compilation + (src -> dist)
_gulp2.default.task('sass', function () {
  return _gulp2.default.src(paths.src.styles.sass).pipe($.plumber(onError)).pipe($.sass()).pipe(_gulp2.default.dest(paths.dist.styles));
});

// CSS task: autoprefixer + css optimizer + rename (.min)
_gulp2.default.task('css', function () {
  var source = [paths.dist.cssFiles, '!' + paths.dist.cssMinFiles];

  return _gulp2.default.src(source).pipe($.plumber(onError)).pipe($.autoprefixer({
    browsers: project.conf.autoprefixer
  })).pipe($.csso()).pipe($.rename({
    suffix: project.conf.suffix
  })).pipe(_gulp2.default.dest(paths.dist.styles));
});

/*
 * Watch task
 */

_gulp2.default.task('watch', function () {
  // Less & Sass watch task
  _gulp2.default.watch(paths.src.styles.lessFiles, gulpSync.sync(['less', 'css']));
  _gulp2.default.watch(paths.src.styles.sassFiles, gulpSync.sync(['sass', 'css']));
});

/*
 * Global tasks
 */

_gulp2.default.task('build', gulpSync.sync([project.preprocessor.css, ['css']]));
_gulp2.default.task('default', ['build']);
