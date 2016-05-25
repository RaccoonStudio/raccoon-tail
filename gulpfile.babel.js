/*jshint -W079 */
'use strict';


/*
 * Gulp components
 */

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import gSync from 'gulp-sync';
import browserSync from 'browser-sync';
import argv from 'yargs';


/*
 * Project configuration
 */
const project = {
  name: 'Raccoon\'s Tail', // project name for gulp-notify
  url: 'https://raccoon.studio', // project dev url
  preprocessor: {
    js: 'es2015', // choose 'es2015' or another installed babel preset
  },
  conf: {
    suffix: '.min', // suffix add to prod concat & minified files
    // gulp-autoprefixer configuration
    autoprefixer: ['> 1%', 'Firefox ESR', 'last 2 versions', 'not ie <= 10'],
  },
};

const paths = {
  root: './',
  src: {
    root: './assets/src',
    styles: {
      less: './assets/src/less/styles.less',
      lessFiles: './assets/src/less/*.less',
      sass: './assets/src/scss/styles.scss',
      sassFiles: './assets/src/scss/*.scss',
    },
  },
  vendors: './node_modules',
  dist: {
    root: './assets/dist',
    styles: './assets/dist/css',
    cssFiles: './assets/dist/css/*.css',
    cssMinFiles: `./assets/dist/css/*${project.conf.suffix}.css`,
  },
};

const vendors = {
  list: [],
};


/*
 * Gulp components init
 */

const $ = gulpLoadPlugins();
const gulpSync = gSync(gulp);
browserSync.create();


/*
 * Command flags
 */

const args = argv.argv;
const isBrowserSync = args.browsersync;


/*
 * Error task
 */

const onError = {
  errorHandler: function (err) {
    console.log(err);
    $.notify.onError({
      title: `Gulp ${project.name}`,
      subtitle: 'Erreur de compilation',
      message: 'Erreur : <%= error.message %>',
    })(err);
    this.emit('end');
  }
};


/*
 * Gulp tasks: css, js, img, fonts, icons
 */

// Less task: less compilation + (src -> dist)
gulp.task('less', () => {
  return gulp.src(paths.src.styles.less)
    .pipe($.plumber(onError))
    .pipe($.less())
    .pipe(gulp.dest(paths.dist.styles));
});

// Sass task: sass compilation + (src -> dist)
gulp.task('sass', () => {
  return gulp.src(paths.src.styles.sass)
    .pipe($.plumber(onError))
    .pipe($.sass())
    .pipe(gulp.dest(paths.dist.styles));
});

// CSS task: autoprefixer + css optimizer + rename (.min)
gulp.task('css', () => {
  let source = [
    paths.dist.cssFiles,
    `!${paths.dist.cssMinFiles}`,
  ];

  return gulp.src(source)
    .pipe($.plumber(onError))
    .pipe($.autoprefixer({
      browsers: project.conf.autoprefixer,
    }))
    .pipe($.csso())
    .pipe($.rename({
      suffix: project.conf.suffix,
    }))
    .pipe(gulp.dest(paths.dist.styles))
    .pipe(browserSync.stream());
});


/*
 * Watch task
 */

gulp.task('watch', () => {
  // Less & Sass watch task
  gulp.watch(paths.src.styles.lessFiles, gulpSync.sync(['less', 'css']));
  gulp.watch(paths.src.styles.sassFiles, gulpSync.sync(['sass', 'css']));
});


/*
 * Global tasks
 */

gulp.task('build', gulpSync.sync([project.preprocessor.css, ['css']]));
gulp.task('default', ['build']);
