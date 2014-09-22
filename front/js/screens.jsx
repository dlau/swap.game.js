/** @jsx React.DOM */
var React = require('react');
var _ = require('lodash');

//Local includes
var Game = require('./game');

var Placeholder = React.createClass({
  render : function(){
    return (
      <div>
        placeholder state ...
      </div>
    );
  }
});

var GameState = Game;

var Selection = React.createClass({
  render : function(){
    var style = {
      'padding-top' : this.props.dimensions.height / 2
    };
    return (
      <div>
        <div className="selection-choices" style={style}>
          <button onClick={_.bind(this.props.setGameScreen, null, GameState)}>
            New Game
          </button>
        </div>
      </div>
    );
  },
});

var Splash = React.createClass({
  render : function(){
    var style = {
      'padding-top' : this.props.dimensions.height / 2
    };
    return (
      <div>
        <div className="splash-continue" style={style}>
          <button onClick={_.bind(this.props.setGameScreen, null, Selection)}>
            Continue
          </button>
        </div>
      </div>
    );
  },
});


module.exports = {
  splash : Splash,
  selection : Selection,
  game : Game,
  credits : Placeholder,
};
