var _ = require('lodash');

var Global = require('./global');

var makeBlankGrid = function(width, height){
  return _.times(width, function(){
      return _.times(height, function(){
        return {
          color : null
        };
      });
    });
};

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
    if(offset[0] >= 0 && offset[0] < grid.length &&
       offset[1] >=0 && offset[1] < grid[0].length){
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

var avalanche = function(grid, cb){
  //process column-wise, squash and move all the white space to the top
  var inner = function(){
    var i,j, gapFound, freeCell;
    for(i = 0;i < grid.length; ++i){
      colorFound = false;
      j = freeCell = grid[i].length - 1;
      for(; j >=0; --j){
        if(grid[i][j].color !== null){
          grid[i][freeCell--].color = grid[i][j].color;
        }
      }
      for(j = freeCell; j >= 0; --j){
        if(grid[i][j].color){
          gapFound = true;
        }
        grid[i][j].color = null;
      }
    }
    setTimeout(function(){
      //optimize later
      for(i = 0; i < grid.lenght; ++i){
        for(j = 0; j < grid[i].length; ++j){
          if(grid[i][j].color !== null){
            grid = cleanFrom(grid, i, j, grid[i][j].color);
          }
        }
      }
      if(gapFound){
        return setTimeout(inner, 500);
      }
      else{
        cb(grid);
      }
    }, 500);
  };
  inner();
};

module.exports = {
  makeBlankGrid : makeBlankGrid,
  neighborsWithColor : neighborsWithColor,
  cleanFrom : cleanFrom,
  avalanche : avalanche
};
