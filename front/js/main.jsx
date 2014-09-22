/** @jsx React.DOM */
require('../style/main.less');
var _ = require('lodash');
var React = require('react');

var g_GameScreens = require('./screens');

//shim:
//window.innerWidth
//window.innerHeight
//window.scrollX
//window.scrollY
//document.width
//document.height

//https://gist.github.com/yckart/9128d824c7bdbab2832e
(function(d,b){var c=b.documentElement;var a=b.body;var e=function(g,h,f){if(typeof g[h]==="undefined"){Object.defineProperty(g,h,{get:f})}};e(d,"innerWidth",function(){return c.clientWidth});e(d,"innerHeight",function(){return c.clientHeight});e(d,"scrollX",function(){return d.pageXOffset||c.scrollLeft});e(d,"scrollY",function(){return d.pageYOffset||c.scrollTop});e(b,"width",function(){return Math.max(a.scrollWidth,c.scrollWidth,a.offsetWidth,c.offsetWidth,a.clientWidth,c.clientWidth)});e(b,"height",function(){return Math.max(a.scrollHeight,c.scrollHeight,a.offsetHeight,c.offsetHeight,a.clientHeight,c.clientHeight)});return e}(window,document));



var Body = React.createClass({
  getInitialState : function(){
    return {
      gameScreen : g_GameScreens.game
    };
  },
  updateWindowDimensions : function(){
    this.setState({
      dimensions : {
        width : window.innerWidth,
        height : window.innerHeight
      }
    });
  },
  componentWillMount : function(){
    this.updateWindowDimensions();
  },
  componentDidMount : function(){
    window.addEventListener("resize", this.updateWindowDimensions);
  },
  componentWillUnmount : function(){
    window.removeEventListener("resize", this.updateWindowDimensions);
  },
  render : function(){
    var setGameScreen = function(screen){
      this.setState({
        gameScreen : screen
      });
    }.bind(this);
    return (
      <div className="screen-container">
        {this.state.gameScreen({
          setGameScreen:setGameScreen,
          dimensions:this.state.dimensions
        })}
      </div>
    );
  }
});

//Workaround for debugger
window.React = React;

var container = document.getElementById('container');
React.renderComponent(<Body />, container);
