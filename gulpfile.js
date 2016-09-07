"use strict";

/* Подключение необходимых плагинов */

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync");
var mqpacker = require("css-mqpacker");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var server = require("browser-sync");
var run = require("run-sequence");
var del = require("del");
var uglify = require("gulp-uglify");
var sourcemaps = require("gulp-sourcemaps");
var pump = require("pump");
var mainBowerFiles = require('main-bower-files');


gulp.task("style", function() {
  gulp.src("src/sass/style.scss")
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 1 version",
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Edge versions"
      ]}),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.reload({stream: true}));
});

gulp.task("html", function () {
  gulp.src("src/*.html")
    .pipe(gulp.dest("build"))
    .pipe(server.reload({stream: true}));
});

gulp.task('jscompress', function () {
  gulp.src("src/js/*.js")
    .pipe(plumber())
    .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(rename("app.min.js"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("build/js"))
    .pipe(server.reload({stream: true}));
});

gulp.task("images", function() {
  return gulp.src("src/images/*.{png,jpg,gif,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
});

// gulp.task("symbols", function() {
//   return gulp.src("build/img/*.svg")
//     .pipe(svgmin())
//     .pipe(svgstore({
//       inlineSvg: true
//     }))
//     .pipe(rename("symbols.svg"))
//     .pipe(gulp.dest("build/img"));
// });

gulp.task("fonts", function() {
  gulp.src("src/fonts/**/*.*")
    .pipe(gulp.dest("build/fonts"))
});

gulp.task('libs', function() {
  return gulp.src(mainBowerFiles({
    "overrides": {
      "bootstrap": {
        "main" : [
          "./dist/js/bootstrap.min.js",
          "./dist/css/bootstrap.min.css",
          "./dist/css/bootstrap-theme.min.css"
        ]
      }
    }
  }))
    .pipe(gulp.dest("build/libs"))
});

gulp.task("serve", ["style"], function() {
  server.init({
    server: "build",
    notify: false,
    open: true,
    ui: false
  });

  gulp.watch("src/sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("src/*.html", ["html"]);
  gulp.watch("src/js/*.js", ["jscompress"]);
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("build", function(fn) {
  run(
    "clean",
    "html",
    "style",
    "jscompress",
    "fonts",
    "images",
    // "symbols",
    "libs",
    fn
  );
});
