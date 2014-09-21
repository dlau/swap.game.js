/** @jsx React.DOM */
require('../style/main.less');
var _ = require('lodash');
var React = require('react');

var GameStates = require('./screens');


var Body = React.createClass({
  getInitialState : function(){
    return {
      gameState : GameStates['splash']
    };
  },
  render : function(){
    return (
      <div>
        {this.state.gameState(null)}
      </div>
    );
  }
});

//Workaround for debugger
window.React = React;
console.log('test');

var container = document.getElementById('container');
React.renderComponent(<Body />, container);
