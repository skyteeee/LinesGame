function init () {
  game.init();
  game.draw();
  game.initRandomCell();
  game.initRandomCell();
  game.initRandomCell();
  game.initRandomCell();
}

function onCanvasClick (event) {
  console.log(event);
  game.onClick(event.offsetX, event.offsetY);
}

class Cell {
  constructor(x, y) {
  this.x = x;
  this.y = y;
  this.ball = null;
  this.selected = false;
  }

  drawCell (game) {
    let x = -game.cellWidth2;
    let y = -game.cellHeight2;
    let x2 = x + game.cellWidth - 1;
    let y2 = y + game.cellHeight - 1;

    if (this.selected) {
      game.ctx.fillStyle = '#cbcbcb';
      game.ctx.fillRect(x+1, y+1, game.cellWidth-2, game.cellHeight-2);
    }

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

    if (this.ball) {
      this.ball.drawBall(game);
    }

    //game.ctx.strokeRect(game.cellWidth*this.x, game.cellHeight*this.y, game.cellWidth, game.cellHeight);
  }

}


class Game {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.from = false;
    this.height = 0;
    this.width = 0;
    this.fieldHeight = 10;
    this.fieldWidth = 10;
    this.cellHeight = 0;
    this.cellWidth = 0;
    this.cellHeight2 = 0;
    this.cellWidth2 = 0;
    this.possibleBallColors = ['rgb(255,0,95)', 'rgb(255,91,0)' , 'rgb(255,203,1)' , 'green' ,  'blue', 'rgb(0,158,255)' , 'purple'];
    this.field = [];
    for (let y = 0; y < this.fieldHeight; y ++) {
      let row = [];
      for (let x = 0; x < this.fieldWidth; x++) {
        let cell = new Cell(x, y);
        row.push(cell);
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

  onClick (x, y) {
    let cellX = Math.floor(x / this.cellWidth);
    let cellY = Math.floor(y / this.cellHeight);
    let cellPressed = this.field[cellY][cellX];
    if (cellPressed.ball !== null) {
      this.from = cellPressed;
      cellPressed.selected = true;
    } else {
      this.from.selected = false;
      cellPressed.ball = this.from.ball;
      this.from.ball = null;
      // let state = this.check();
      // if (!state) {
      //
      // }
    }
    this.draw();
  }

  createBall(x, y) {
    let colorIdx = Math.floor(Math.random() * this.possibleBallColors.length);
    let color = this.possibleBallColors[colorIdx];
    return new Ball(x, y, colorIdx, color);
  }

  initRandomCell () {
    let x;
    let y;

      y = Math.floor(Math.random()*this.fieldHeight);
      x = Math.floor(Math.random()*this.fieldWidth);
      let selectedCell = this.field[y][x];
      selectedCell.ball = this.createBall(x, y);
      this.draw();


  }

  check() {
    console.log('Here is where I check!');
  }

  draw () {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let y of this.field) {
      for (let cell of y) {
        this.ctx.save();
        this.ctx.translate(this.cellWidth * cell.x + this.cellWidth2, this.cellHeight * cell.y + this.cellHeight2);
        cell.drawCell(this);
        this.ctx.restore();
      }
    }
  }

}

class Ball {
  constructor(x, y, colorIdx, color) {
    this.colorIdx = colorIdx;
    this.color = color;
    this.x = x;
    this.y = y;
  }

  drawBall (game) {
    let x = -game.cellWidth2;
    let y = -game.cellHeight2;

    let gradient = game.ctx.createRadialGradient(-12, -12, 0, 0, 0, 25);

    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.7, this.color);
    gradient.addColorStop(0.9, this.color);
    gradient.addColorStop(1, 'transparent');

    game.ctx.fillStyle = gradient;
    game.ctx.fillRect(x, y, game.cellWidth, game.cellHeight);

  }

}

let game = new Game();
