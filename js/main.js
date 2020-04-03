function init () {
  game.init();
  game.draw();
  game.generateBalls();
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
    this.ballsPerTime = 5;
    this.inARowToVanish = 4;
    this.fieldHeight = 10;
    this.fieldWidth = 10;

    this.canvas = null;
    this.ctx = null;
    this.from = null;
    this.height = 0;
    this.width = 0;
    this.cellHeight = 0;
    this.cellWidth = 0;
    this.cellHeight2 = 0;
    this.cellWidth2 = 0;
    this.isGameOver = false;
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

  checkAll (x, y, cell) {
    let state = false;
    let colorIdx = cell.ball.colorIdx;
    let selected = this.field[y][x];

    let state1 = this.check(x,y, 1, 0, colorIdx);
    let state4 = this.check(x,y, -1, 0, colorIdx);
    state1.push(selected);
    state1.push(...state4);
    state |= this.removeBallsIfNeeded(state1);

    let state2 = this.check(x,y, 0, 1, colorIdx);
    let state5 = this.check(x,y, 0, -1, colorIdx);
    state2.push(selected);
    state2.push(...state5);
    state |= this.removeBallsIfNeeded(state2);

    let state3 = this.check(x,y, 1, 1, colorIdx);
    let state6 = this.check(x,y, -1, -1, colorIdx);
    state3.push(selected);
    state3.push(...state6);
    state |= this.removeBallsIfNeeded(state3);

    let state7 = this.check(x,y, 1, -1, colorIdx);
    let state8 = this.check(x,y, -1, 1, colorIdx);
    state7.push(selected);
    state7.push(...state8);
    state |= this.removeBallsIfNeeded(state7);


    if (!state) {
      if (this.generateBalls() !== true) {
        this.isGameOver = true;
      }
    }
  }


  onClick (x, y) {
    if (this.isGameOver) {
      return;
    }
    let cellX = Math.floor(x / this.cellWidth);
    let cellY = Math.floor(y / this.cellHeight);
    let cellPressed = this.field[cellY][cellX];
    if (cellPressed.ball !== null) {
      this.from = cellPressed;
      cellPressed.selected = true;
    } else {
      if (this.from) {
        this.from.selected = false;
        cellPressed.ball = this.from.ball;
        this.from.ball = null;
        this.from = null;
        this.checkAll(cellX, cellY, cellPressed);
      } else {
        return false;
      }
      }

    this.draw();
  }

  createBall(x, y) {
    let colorIdx = Math.floor(Math.random() * this.possibleBallColors.length);
    let color = this.possibleBallColors[colorIdx];
    return new Ball(x, y, colorIdx, color);
  }

  initRandomCell () {
    let idx;

    let emptyCells = [];

    for (let row of this.field) {
      for (let cell of row) {
        if (!cell.ball) {
          emptyCells.push(cell);
        }
      }
    }

    if (emptyCells.length === 0) {
      return false;
    }

    idx = Math.floor(Math.random() * emptyCells.length);

    let selectedCell = emptyCells[idx];
      selectedCell.ball = this.createBall(selectedCell.x, selectedCell.y);
      this.draw();

      return true;
  }

  generateBalls () {
    for (let idx = 0; idx < this.ballsPerTime; idx++) {
      let state = this.initRandomCell();
      if (!state) {
        return false;
      }
    }
    return true;
  }

  removeBallsIfNeeded (state) {
    if (state.length >= this.inARowToVanish) {
      for (let cell of state) {
        cell.ball = null;
      }
      return true;
    }
    return false;
  }

  check(x, y, deltaY, deltaX, colorIdx) {
    let originalDY = deltaY;
    let originalDX = deltaX;
    let inARow = [];

    while (y+deltaY < this.fieldHeight && x+deltaX < this.fieldWidth
          && y+deltaY >= 0 && x+deltaX >= 0) {

      if (this.field[y + deltaY][x + deltaX]) {
        let element = this.field[y + deltaY][x + deltaX];
        if (element.ball === null || element.ball.colorIdx !== colorIdx) {
          return inARow;
        } else {
          inARow.push(element);

          deltaY = deltaY + originalDY;
          deltaX = deltaX + originalDX;

        }
      }
    }
    return inARow;
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
    if (this.isGameOver) {
      this.drawGameOver();
    }
  }

  drawGameOver () {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.font = 'bold 84px sans';
    this.ctx.fillStyle = 'rgb(180,0,46)';
    this.ctx.strokeStyle = 'rgb(255, 255, 255)';
    this.ctx.strokeWidth = 3;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.width/2, this.height/2);
    this.ctx.strokeText('GAME OVER', this.width/2, this.height/2);
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
