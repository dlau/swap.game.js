require('should');

var GameUtil = require('../front/js/util');

describe('grid', function(){
  describe('makeBlankGrid', function(){
    it('should make a blank grid', function(){
      var grid = GameUtil.makeBlankGrid(10, 10);
      var i,j;
      grid.should.have.length(10);
      for(i=0; i<10; ++i){
        grid[i].should.have.length(10);
        for(j=0; j< 10; ++j){
          grid[i][j].should.have.property('color');
          (grid[i][j].color == null).should.be.true;
        }
      }
    });
  });
  var grid;
  describe('neighborsWithColor', function(){
    it('should properly identify neighbors', function(){
      grid = GameUtil.makeBlankGrid(10, 10);
      /* ------
         |xoxxx
         |oooxx
         |xoxxx
         |xxxxx
       */
      grid[1][0].color = '#fff';
      grid[1][1].color = '#fff';
      grid[1][2].color = '#fff';
      grid[0][1].color = '#fff';
      grid[2][1].color = '#fff';
      var neighbors = GameUtil.neighborsWithColor(grid, 1, 1, '#fff');
      (neighbors !== null).should.be.true;
      neighbors.should.have.length(4);
      neighbors.should.containEql([1,0]);
      neighbors.should.containEql([1,2]);
      neighbors.should.containEql([0,1]);
      neighbors.should.containEql([2,1]);
    });
  });
  describe('cleanFrom', function(){
    it('should clean from 1,1 outwards', function(){
      grid = GameUtil.cleanFrom(grid, 1, 1, grid[1][1].color);
      (grid[1][0].color === null).should.be.true;
      (grid[1][1].color === null).should.be.true;
      (grid[1][2].color === null).should.be.true;
      (grid[0][1].color === null).should.be.true;
      (grid[2][1].color === null).should.be.true;
    });
  });
  describe('avalanche', function(){
    it('should move 0,0 and 2,0 down', function(){
      GameUtil.avalanche(grid, function(grid){
        console.log('GGGGG');
        console.log(grid);
        (grid[0][0].color === null).should.be.true;
        (grid[0][1].color === null).should.be.true;
        (grid[1][0].color === null).should.be.true;
        (grid[1][1].color === null).should.be.true;
        (grid[1][2].color === null).should.be.true;

        (grid[1][1].color === null).should.be.false;
        (grid[2][1].color === null).should.be.false;
        grid[1][1].color.should.be('#fff');
        grid[2][1].color.should.be('#fff');
      });
    });
  });
});
