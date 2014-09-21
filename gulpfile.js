var gulp = require('gulp');
var fs = require('fs');
var gutil = require('gulp-util');
var nodemon = require('gulp-nodemon');
var rename = require('gulp-rename');
var react = require('gulp-react');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config');
var clean = require('gulp-clean');

var webpackStringOpts = {
  colors : true,
  chunks : false,
  chunkModules : false,
  chunkOrigins : false
};

gulp.task('webpack', function(callback){
  webpack(
    webpackConfig,
    function(err,stats){
      gutil.log(stats.toString(webpackStringOpts));
      callback();
    }
  );
});

gulp.task('jsxcompile', function(){
  gulp.src('components/**/*.jsx')
    .pipe(react()
      .on('error', gutil.log)
      .on('error', gutil.beep)
    )
    .pipe(gulp.dest('components'));
});

gulp.task('clean', function(){
  gulp.src([
    'public/assets/js/*.js',
  ], {read: false})
    .pipe(clean());
});

gulp.task('build', ['webpack'], function(){
});

gulp.task('dev', ['build'], function(){
  nodemon({
    execMap : {
      js : 'node --harmony --debug',
      jsx : 'node --harmony --debug'
    },
    ext : 'js jsx',
    script : './index.js'
  });
  var compiler = webpack(webpackConfig);
  var onCompilerRun = function(err, stats){
    if(err){
      gutil.beep();
      gutil.log(err);
    }
    else{
      gutil.log(stats.toString(webpackStringOpts));
    }
  };
  compiler.watch(200, onCompilerRun);
});

gulp.task('default',['build']);
gulp.task('b',['build']);
gulp.task('w',['dev']);
