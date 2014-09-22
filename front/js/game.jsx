/** @jsx React.DOM */
var React = require('react');
var _ = require('lodash');

var GRID_ELEMENT_WIDTH = 30;
var DEFAULT_ANIMATION_DURATION = 500;

//helpers
var neighborsWithColor = function(grid, x, y, color){
  //Has to be touching
  var offsets = [
    [-1, 0], //left
    [1, 0],  //right
    [0, -1], //top
    [0, 1]  //bottom
  ];
  var neighborsFound = [];
  for(var i=0;i < offsets.length; ++i){
    var offset = [offsets[i][0] + x, offsets[i][1] + y];
    if(offset[0] >= 0 && offset[0] < 10 &&
       offset[1] >=0 && offset[1] < 10){
      var neighborColor = grid[offset[0]][offset[1]].color;
      if(neighborColor && neighborColor === color){
        neighborsFound.push(offset);
      }
    }
  }
  return neighborsFound.length ? neighborsFound : null;
};

var cleanFrom = function(grid, x, y, color, moved){
  moved = moved || false;
  if(moved){
      if(grid[x][y].color === color){
        grid[x][y].color = null;
      }
  }
  var neighbors = neighborsWithColor(grid, x, y, color);
  if(neighbors){
    if(!moved){
      if(grid[x][y].color === color){
        grid[x][y].color = null;
      }
    }
    _.each(neighbors, function(neighbor){
      grid = cleanFrom(grid, neighbor[0], neighbor[1], color, true);
    });
  }
  return grid;
};


var Grid = React.createClass({
  getInitialState : function(){
    //this should work dynamically
    return {
      width : 10,
      height : 10,
      grid : _.times(10, function(){
        return _.times(10, function(){
          return {
            color : null
          };
        });
      }),
      secondsElapsed : 0
    };
  },
  componentWillMount : function(){
    var grid = this.state.grid;
    _.each(grid, function(e, i){
      _.each(e, function(e, j){
        var colors = _.shuffle(['#2ecc71','#8e44ad', '#e74c3c']);
        //Check Neighbors
        _.each(colors, function(color){
          if(!neighborsWithColor(grid, i, j, color)){
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
    var grid = this.state.grid;
    var offsetX = (e.pageX - rect.left) / GRID_ELEMENT_WIDTH - x;
    var offsetY = (e.pageY - rect.top) / GRID_ELEMENT_WIDTH - y;
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
         dst[0] < 10 && dst[0] >= 0 && dst[1] < 10 && dst[1] >=0){
        if(grid[x][y].color && grid[dst[0]][dst[1]].color){
          this.animateSwap([x, y], dst, DEFAULT_ANIMATION_DURATION);
        }
        return false;
      }
    }.bind(this));
  },
  animateSwap : function(src, dst, duration){
    var FRAMERATE = 1000/30; //25fps
    var grid = this.state.grid;
    if(!grid[src[0]][src[1]].animateL){
      grid[src[0]][src[1]].animateL = grid[src[0]][src[1]].animateR = 0;
      grid[dst[0]][dst[1]].animateL = grid[dst[0]][dst[1]].animateR = 0;
    }
    if(duration >= 1){
      //figure out direction
      var diffX = (src[0] - dst[0]) * GRID_ELEMENT_WIDTH;
      var diffY =(src[1] - dst[1]) * GRID_ELEMENT_WIDTH;
      diffX = diffX - diffX / (DEFAULT_ANIMATION_DURATION / duration);
      diffY = diffY - diffY / (DEFAULT_ANIMATION_DURATION / duration);
      grid[src[0]][src[1]].animateL = ~diffX;
      grid[dst[0]][dst[1]].animateL = diffX;

      grid[src[0]][src[1]].animateR = ~diffY;
      grid[dst[0]][dst[1]].animateR = diffY;

      //movement speed, distance/time
      this.setState({
        grid : grid
      });
      duration -= FRAMERATE * (DEFAULT_ANIMATION_DURATION / 1000);
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
      cleanFrom(grid, src[0], src[1], grid[src[0]][src[1]].color);
      cleanFrom(grid, dst[0], dst[1], grid[dst[0]][dst[1]].color);
      this.props.onMove();
      return this.setState({
        grid : grid
      });
    }
  },
  render : function(){
    var gridElements = _.map(this.state.grid, function(e, i){
      return <div className="grid-row">
        {_.map(e, function(e, j){
          var style = {
            background : e.color,
            'margin-left' : GRID_ELEMENT_WIDTH * i,
            'margin-top' : GRID_ELEMENT_WIDTH * j
          };
          style['margin-left'] = e.animateL ? style['margin-left'] + e.animateL : style['margin-left'];
          style['margin-top'] = e.animateR ? style['margin-top'] + e.animateR : style['margin-top'];
          return (
            <div
              className={"grid-square" +(e.color ? " bevel" : "")} 
              style={style} key={"grid-" + i + "-" + j}
              onClick={_.bind(this.selectGridElement, null, i, j)}
            >
            </div>
          );
        }.bind(this))}
        </div>
    }.bind(this));
    var gridStyle = {
      width : GRID_ELEMENT_WIDTH * 10,
      height : GRID_ELEMENT_WIDTH * 10
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
        <button>
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
      nMoves : 0,
      secondsElapsed : 0
    };
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
    return (
      <div>
        <Grid onMove={onMove}/>
        <div className="game-right">
          <ScoreBoard nMoves={this.state.nMoves} secondsElapsed={this.state.secondsElapsed} />
          <Controls />
        </div>
      </div>
    );
  }
});

module.exports = Game;
