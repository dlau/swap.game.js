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
  componentDidMount : function(){
    setInterval(function(){
      this.setState({
        secondsElapsed : this.state.secondsElapsed + 1
      });
    }.bind(this), 1000);
  },
  selectGridElement : function(x, y, e){
    var grid = this.state.grid;
    var offsetX = e.pageX / GRID_ELEMENT_WIDTH - x;
    var offsetY = e.pageY / GRID_ELEMENT_WIDTH - y;
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
            left : GRID_ELEMENT_WIDTH * i,
            top : GRID_ELEMENT_WIDTH * j
          };
          style.left = e.animateL ? style.left + e.animateL : style.left;
          style.top = e.animateR ? style.top + e.animateR : style.top;
          return (
            <div
              className={"grid-square"} 
              style={style} key={"grid-" + i + "-" + j}
              onClick={_.bind(this.selectGridElement, null, i, j)}
            >
            </div>
          );
        }.bind(this))}
        </div>
    }.bind(this));
    var scoreboardStyle = {
      left : GRID_ELEMENT_WIDTH * 10
    };
    return (
      <div>
        <div className="game-grid">
        {gridElements}
        </div>
        <div className="game-scoreboard" style={scoreboardStyle}>
          <ul className="game-scoreboard-listing">
            <li>Swaps : {this.state.nMoves}</li>
            <li>Time Taken : {this.state.secondsElapsed}</li>
            <li> Colors : 3 </li>
          </ul>
        </div>
      </div>
    );
  }
});

var Game = React.createClass({
  render : function(){
    return (
      <div>
        <Grid />
      </div>
    );
  }
});

module.exports = Game;
