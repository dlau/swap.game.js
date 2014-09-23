/** @jsx React.DOM */
var React = require('react');
var _ = require('lodash');

//Local includes
var GameUtil= require('./util');
var Global = require('./global');


var Grid = React.createClass({
  getInitialState : function(){
    //this should work dynamically
    return {
      secondsElapsed : 0
    };
  },
  componentWillMount : function(){
    var grid = this.props.grid;
    _.each(grid, function(e, i){
      _.each(e, function(e, j){
        var colors = _.shuffle(['#2ecc71','#8e44ad', '#e74c3c']);
        //Check Neighbors
        _.each(colors, function(color){
          if(!GameUtil.neighborsWithColor(grid, i, j, color)){
            e.color = color;
            return false;
          }
        });
      });
    });
  },
  selectGridElement : function(x, y, e){
    //this is really bad, find a better way to do this
    var rect = e.target.parentElement.parentElement.getBoundingClientRect();
    var grid = this.props.grid;
    var offsetX = (e.pageX - rect.left) / Global.GRID_ELEMENT_WIDTH - x;
    var offsetY = (e.pageY - rect.top) / Global.GRID_ELEMENT_WIDTH - y;
    var offsets = [
      [{ xMin : 0.3, xMax : 0.7, yMin : 0.7, yMax :  1} , [x, y+1] ], //bottom
      [{ xMin : 0.3, xMax : 0.7, yMin :  0, yMax : 0.3} , [x, y-1] ], //top
      [{ xMin :  0, xMax : 0.3, yMin : 0.3, yMax : 0.7} , [x-1, y] ], //left
      [{ xMin : 0.7, xMax :  1, yMin : 0.3, yMax : 0.7} , [x+1, y] ], //right
    ];
    _.each(offsets, function(e){
      var cond = e[0];
      var dst = e[1];
      if(offsetX > cond.xMin && offsetX < cond.xMax &&
         offsetY > cond.yMin && offsetY < cond.yMax &&
         dst[0] < Global.GRID_WIDTH && dst[0] >= 0 && dst[1] < Global.GRID_HEIGHT && dst[1] >=0){
        if(grid[x][y].color && grid[dst[0]][dst[1]].color){
          this.animateSwap([x, y], dst, Global.DEFAULT_ANIMATION_DURATION);
        }
        return false;
      }
    }.bind(this));
  },
  animateSwap : function(src, dst, duration){
    var FRAMERATE = 1000/30; //25fps
    var grid = this.props.grid;
    if(!grid[src[0]][src[1]].animateL){
      grid[src[0]][src[1]].animateL = grid[src[0]][src[1]].animateR = 0;
      grid[dst[0]][dst[1]].animateL = grid[dst[0]][dst[1]].animateR = 0;
    }
    if(duration >= 1){
      //figure out direction
      var diffX = (src[0] - dst[0]) * Global.GRID_ELEMENT_WIDTH;
      var diffY =(src[1] - dst[1]) * Global.GRID_ELEMENT_WIDTH;
      diffX = diffX - diffX / (Global.DEFAULT_ANIMATION_DURATION / duration);
      diffY = diffY - diffY / (Global.DEFAULT_ANIMATION_DURATION / duration);
      grid[src[0]][src[1]].animateL = ~diffX;
      grid[dst[0]][dst[1]].animateL = diffX;

      grid[src[0]][src[1]].animateR = ~diffY;
      grid[dst[0]][dst[1]].animateR = diffY;

      //movement speed, distance/time
      this.props.setGrid(grid);
      duration -= FRAMERATE * (Global.DEFAULT_ANIMATION_DURATION / 1000);
      setTimeout(this.animateSwap.bind(null, src, dst, duration), FRAMERATE);
    }
    else{
      //swap colors
      var tmp = grid[dst[0]][dst[1]].color;
      grid[dst[0]][dst[1]].color = grid[src[0]][src[1]].color;
      grid[src[0]][src[1]].color = tmp;
      delete grid[src[0]][src[1]].animateL;
      delete grid[src[0]][src[1]].animateR;
      delete grid[dst[0]][dst[1]].animateL;
      delete grid[dst[0]][dst[1]].animateR;
      //clean the grid
      GameUtil.cleanFrom(grid, src[0], src[1], grid[src[0]][src[1]].color);
      GameUtil.cleanFrom(grid, dst[0], dst[1], grid[dst[0]][dst[1]].color);
      this.props.onMove();
      return this.props.setGrid(grid);
    }
  },
  render : function(){
    var gridElements = _.map(this.props.grid, function(e, i){
      return <div className="grid-row">
        {_.map(e, function(e, j){
          var style = {
            'margin-left' : Global.GRID_ELEMENT_WIDTH * i,
            'margin-top' : Global.GRID_ELEMENT_WIDTH * j
          };
          if(e.color){
            style.background = e.color;
          }
          style['margin-left'] = e.animateL ? style['margin-left'] + e.animateL : style['margin-left'];
          style['margin-top'] = e.animateR ? style['margin-top'] + e.animateR : style['margin-top'];
          var squareClassName = 'grid-square';
          return (
            <div
              className={"grid-square" +(e.color ? " bevel" : " blank")} 
              style={style} key={"grid-" + i + "-" + j}
              onClick={_.bind(this.selectGridElement, null, i, j)}
            >
            </div>
          );
        }.bind(this))}
        </div>
    }.bind(this));
    var gridStyle = {
      width : Global.GRID_ELEMENT_WIDTH * Global.GRID_WIDTH,
      height : Global.GRID_ELEMENT_WIDTH * Global.GRID_HEIGHT
    };
    return (
      <div className="game-grid" style={gridStyle}>
        {gridElements}
      </div>
    );
  }
});

var ScoreBoard = React.createClass({
  render : function(){
    var ms2pretty = function(elapsed){
      var trans = [elapsed, 1000, 60, 60, 24, 365];
      var tNames = ['ms', 's', 'm', 'h', 'd', 'y'];
      var i,r;
      for(i=1; i<trans.length; ++i){
        r = Math.floor(trans[i-1] / trans[i]);
        trans[i-1] %= trans[i];
        trans[i] = r;
      }
      return _.filter(
        _.map(trans,function(e,i){ return e ? e + tNames[i] : null; }),
        function(e){ return e !== null; }
      ).reverse().join(':');
    };
    return (
      <div className="game-scoreboard">
        <ul className="game-scoreboard-listing">
          <li>Swaps : {this.props.nMoves}</li>
          <li> Elapsed : {ms2pretty(this.props.secondsElapsed*1000)} </li>
          <li> Colors : 3 </li>
        </ul>
      </div>
    );
  }
});

var Controls = React.createClass({
  render : function(){
    return (
      <div className="game-controls">
        <button onClick={this.props.onAvalanche}>
          Avalanche
        </button>
        <button>
          Add square
        </button>
        <button disabled>
          Done!
        </button>
      </div>
      );
  }
});

var Game = React.createClass({
  getInitialState : function(){
    return {
      grid : GameUtil.makeBlankGrid(Global.GRID_WIDTH, Global.GRID_HEIGHT),
      nMoves : 0,
      secondsElapsed : 0
    };
  },
  setGrid : function(grid){
    this.setState({
      grid : grid
    });
  },
  componentDidMount : function(){
    setInterval(function(){
      this.setState({
        secondsElapsed : this.state.secondsElapsed + 1
      });
    }.bind(this), 1000);
  },
  render : function(){
    //not optimized, tested w/ v8--this creates a new function expr everytime render is called ...
    var onMove = function(e){
      this.setState({ nMoves : this.state.nMoves + 1 });
    }.bind(this);
    var onAvalanche = function(){
      GameUtil.avalanche(this.state.grid, function(grid){
        this.setGrid(grid);
      }.bind(this));
    }.bind(this);
    return (
      <div>
        <Grid grid={this.state.grid} onMove={onMove} setGrid={this.setGrid}/>
        <div className="game-right">
          <ScoreBoard nMoves={this.state.nMoves} secondsElapsed={this.state.secondsElapsed} />
          <Controls onAvalanche={onAvalanche} />
        </div>
      </div>
    );
  }
});

module.exports = Game;
