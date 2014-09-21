'use strict';
var koa = require('koa');
var koa_static = require('koa-static');

var app = koa();

app.use(koa_static(__dirname + '/public'));

/*********
  REACT IN MIDDLEWARE
**********/
//Transparently hooks the require for the .jsx extension
require('node-jsx').install({extension: '.jsx'});
var thunkify = require('thunkify');
var react = require('react');
var reactGen = {
  renderComponentToString : thunkify(
    function(component, callback){
      return callback(null, react.renderComponentToString(component));
    })
};

app.use(function*(next){
  this.react = reactGen;
  yield next;
});

app.use(function *(){
  this.status = 404;
  this.body = 'Not Found';
});

var port = process.env.SG_PORT || 8002;
app.listen(port);
console.log('Swap Game Server Running on Port %d',port);
