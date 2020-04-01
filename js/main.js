function init () {
  game.init();
  game.draw();

}

class Cell {
  constructor(x, y) {
  this.x = x;
  this.y = y;
  this.ball = new Ball ('red', x, y);
  }

  drawCell (game) {
    let x = -game.cellWidth2;
    let y = -game.cellHeight2;
    let x2 = x + game.cellWidth - 1;
    let y2 = y + game.cellHeight - 1;

    game.ctx.strokeStyle = '#fafffb';
    game.ctx.beginPath();
    game.ctx.moveTo(x2, y);
    game.ctx.lineTo(x, y);
    game.ctx.lineTo(x, y2);
    game.ctx.stroke();

    game.ctx.strokeStyle = '#c8cdc9';
    game.ctx.beginPath();
    game.ctx.moveTo(x2, y);
    game.ctx.lineTo(x2, y2);
    game.ctx.lineTo(x, y2);
    game.ctx.stroke();

    //game.ctx.strokeRect(game.cellWidth*this.x, game.cellHeight*this.y, game.cellWidth, game.cellHeight);
  }

}


class Game {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.height = 0;
    this.width = 0;
    this.fieldHeight = 10;
    this.fieldWidth = 10;
    this.cellHeight = 0;
    this.cellWidth = 0;
    this.cellHeight2 = 0;
    this.cellWidth2 = 0;
    this.field = [];
    for (let y = 0; y < this.fieldHeight; y ++) {
      let row = [];
      for (let x = 0; x < this.fieldWidth; x++) {
        row.push(new Cell(x, y));
      }
      this.field.push(row);

    }
  }

  init () {
    this.canvas = document.getElementById('field');
    this.ctx = this.canvas.getContext('2d');
    this.height = this.canvas.offsetHeight;
    this.width = this.canvas.offsetWidth;
    this.cellHeight = this.height / this.fieldHeight;
    this.cellWidth = this.width / this.fieldWidth;
    this.cellHeight2 = this.cellHeight / 2;
    this.cellWidth2 = this.cellWidth / 2;

  }


  draw () {
    for (let y of this.field) {
      for (let cell of y) {
        this.ctx.save();
        this.ctx.translate(this.cellWidth * cell.x + this.cellWidth2, this.cellHeight * cell.y + this.cellHeight2);
        cell.drawCell(this);
        cell.ball.drawBall('red', this);
        this.ctx.restore();
      }
    }
  }

}

class Ball {
  constructor(x, y) {
    this.possibleColors = ['red', 'orange' , 'yellow' , 'green' ,  'light blue', 'blue', 'purple'];

    this.x = x;
    this.y = y;
  }

  drawBall (color, game) {
    let x = -game.cellWidth2;
    let y = -game.cellHeight2;

    game.ctx.save();
    game.ctx.translate(this.x, this.y);
    let gradient = game.ctx.createRadialGradient(-15, -15, 0, -5, -5, 25);

    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.7, color);
    gradient.addColorStop(0.9, color);
    gradient.addColorStop(1, 'transparent');

    game.ctx.fillStyle = gradient;
    game.ctx.fillRect(x, y, game.cellWidth, game.cellHeight);
    game.ctx.restore();

  }

}

let game = new Game();
