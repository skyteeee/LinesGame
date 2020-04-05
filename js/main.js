function init () {
  game.init();
  game.refresh(performance.now());
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

  setBall (ball) {
    this.ball = ball;
    this.ball.x = this.x;
    this.ball.y = this.y;
  }

  handleSelect (state, game) {
    this.selected = state;
    if (state && this.ball) {
      this.ball.selected(game);
    } else {
      this.ball.deselect(game);
    }
  }

  innerDraw (game) {
    let x = -game.cellWidth2;
    let y = -game.cellHeight2;
    let x2 = x + game.cellWidth - 1;
    let y2 = y + game.cellHeight - 1;

    if (this.selected) {
      game.ctx.fillStyle = '#cbcbcb';
      game.ctx.fillRect(x+1, y+1, game.cellWidth-2, game.cellHeight-2);
    } else {
      game.ctx.clearRect(x+1, y+1, game.cellWidth - 2, game.cellHeight - 2);
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

  }

  drawCell (game) {
    game.ctx.save();
    game.ctx.translate(game.cellWidth * this.x + game.cellWidth2, game.cellHeight * this.y + game.cellHeight2);
    this.innerDraw(game);
    game.ctx.restore();
  }

  drawBall (game) {
    if (this.ball) {
      game.ctx.save();
      game.ctx.translate(game.cellWidth * this.x + game.cellWidth2, game.cellHeight * this.y + game.cellHeight2);
      this.ball.drawBall(game);
      game.ctx.restore();
    }
  }

}


class Game {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.from = null;
    this.height = 0;
    this.width = 0;
    this.delay = 0;
    this.cellHeight = 0;
    this.cellWidth = 0;
    this.cellHeight2 = 0;
    this.cellWidth2 = 0;
    this.hudHeight = 50;
    this.possibleBallColors = ['rgb(218,0,25)', 'rgb(14,109,0)', 'rgb(0,158,255)',
      'rgb(255,91,0)', 'rgb(255,203,1)', 'rgb(0,0,255)', 'rgb(125,0,125)'];
  }

  refresh (time) {
    this.animate(time);
    this.draw();
    if (this.decideToRefresh()) {
      requestAnimationFrame((time1 => this.refresh(time1)));
    }
  }

  animate (time) {
    TWEEN.update(time);
  }

  decideToRefresh () {
    return true;
  }

  initGame() {
    this.ballsPerTime = 5;
    this.inARowToVanish = 4;
    this.fieldHeight = 10;
    this.fieldWidth = 10;
    this.score = 0;
    this.multiplier = 1;
    this.level = 1;
    this.scoreToLevelUp = 250;
    this.levelToAddColor = 3;
    this.isGameOver = false;

    this.newColorIdx = 2;
    this.field = [];
    this.initField();
  }

  initField() {
    for (let y = 0; y < this.fieldHeight; y++) {
      let row = [];
      for (let x = 0; x < this.fieldWidth; x++) {
        let cell = new Cell(x, y);
        row.push(cell);
      }
      this.field.push(row);
    }

  }

  init() {
    this.initGame();
    this.canvas = document.getElementById('field');
    this.ctx = this.canvas.getContext('2d');
    this.height = this.canvas.offsetHeight - this.hudHeight;
    this.gameHeight = this.canvas.offsetHeight;
    this.width = this.canvas.offsetWidth;
    this.cellHeight = this.height / this.fieldHeight;
    this.cellWidth = this.width / this.fieldWidth;
    this.cellHeight2 = this.cellHeight / 2;
    this.cellWidth2 = this.cellWidth / 2;
    this.generateBalls();
  }

  addColorOnLvlUp() {
    if (this.level % this.levelToAddColor === 0) {
      if (this.newColorIdx < this.possibleBallColors.length-1) {
        this.newColorIdx++;
        if (this.levelToAddColor === 3) {
          this.levelToAddColor = 5;
        }
      }
    }
  }


  levelUpIfNeeded() {
    if (this.score >= this.scoreToLevelUp) {
      this.level++;
      this.multiplier = this.multiplier * 1.25;
      this.scoreToLevelUp = Math.ceil(this.scoreToLevelUp + 250 * this.multiplier);
      this.addColorOnLvlUp();
    }
  }

  changeScore(multiplier) {
    this.score = Math.floor(this.score + 25 * multiplier);
    this.levelUpIfNeeded();
  }

  checkAll(x, y, ball) {
    if (ball !== null) {
      let state = false;
      let colorIdx = ball.colorIdx;
      let selected = this.field[y][x];

      let state1 = this.check(x, y, 1, 0, colorIdx);
      let state4 = this.check(x, y, -1, 0, colorIdx);
      state1.push(selected);
      state1.push(...state4);
      state |= this.removeBallsIfNeeded(state1);

      let state2 = this.check(x, y, 0, 1, colorIdx);
      let state5 = this.check(x, y, 0, -1, colorIdx);
      state2.push(selected);
      state2.push(...state5);
      state |= this.removeBallsIfNeeded(state2);

      let state3 = this.check(x, y, 1, 1, colorIdx);
      let state6 = this.check(x, y, -1, -1, colorIdx);
      state3.push(selected);
      state3.push(...state6);
      state |= this.removeBallsIfNeeded(state3);

      let state7 = this.check(x, y, 1, -1, colorIdx);
      let state8 = this.check(x, y, -1, 1, colorIdx);
      state7.push(selected);
      state7.push(...state8);
      state |= this.removeBallsIfNeeded(state7);

      return state;
    }
  }

  prepareNextMove (x, y, cell) {
    if (!this.checkAll(x, y, cell.ball)) {
      if (this.generateBalls() !== true) {
        this.isGameOver = true;
      }
    }
  }

  operateGameOver() {
    if (this.isGameOver) {
      this.initGame();
      this.generateBalls();
      this.draw();
    }
  }

  onClick(x, y) {
    this.operateGameOver();
    let cellX = Math.floor(x / this.cellWidth);
    let cellY = Math.floor((y-this.hudHeight) / this.cellHeight);
    let cellPressed = this.field[cellY][cellX];
    if (cellPressed.ball !== null) {
      if (this.from) {
        this.from.handleSelect (false, this);
      }
      this.from = cellPressed;
      cellPressed.handleSelect (true, this);
    } else {
      if (this.from) {
        this.from.handleSelect (false, this);
        cellPressed.setBall(this.from.ball);
        cellPressed.ball.hoover(this.from.x, this.from.y);
        this.from.ball = null;
        this.from = null;
        this.prepareNextMove(cellX, cellY, cellPressed);
      }
    }

    this.draw();
  }

  findEmptyCells() {
    let emptyCells = [];

    for (let row of this.field) {
      for (let cell of row) {
        if (!cell.ball) {
          emptyCells.push(cell);
        }
      }
    }

    if (emptyCells.length === 0) {
      this.isGameOver = true;
    }

    return emptyCells;

  }

  initRandomCell(emptyCells) {
    let idx;
    if (emptyCells.length === 0) {
      return null;
    }
    idx = Math.floor(Math.random() * emptyCells.length);
    let selectedCell = emptyCells[idx];
    selectedCell.ball = this.createBall(selectedCell.x, selectedCell.y);
    selectedCell.ball.appear(this.delay);
    this.delay = this.delay + 100;
    return selectedCell;
  }

  checkBalls(state) {
    for (let cell of state) {
      if (cell !== null) {
        this.checkAll(cell.x, cell.y, cell.ball);
      } else {
        alert('Error!!!');
      }
    }
  }


  removeBallsIfNeeded (state) {
    if (state.length >= this.inARowToVanish) {
      for (let cell of state) {
        this.changeScore(this.multiplier);
        cell.ball = null;
      }
      return true;
    }
    return false;
  }

  generateBalls () {
    let state = [];
    for (let idx = 0; idx < this.ballsPerTime; idx++) {
      let element = this.initRandomCell(this.findEmptyCells());
      if (element !== null) {
        state.push(element);
      }
    }
    let empty = this.findEmptyCells();
    if (empty.length === 0) {
      this.delay = 0;
      return false;
    }
     else {
      this.checkBalls(state);
      this.delay = 0;
      return true;
    }
  }

  createBall(x, y) {
    let colorIdx = Math.floor(Math.random() * (this.newColorIdx+1));
    let color = this.possibleBallColors[colorIdx];
    return new Ball(x, y, colorIdx, color, this.cellWidth, this.cellHeight);
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

  drawHUD () {
    let offsetY = 12;
    let offsetX = 10;
    this.ctx.font = 'bold 28px sans';
    this.ctx.textBaseline = 'top';
    this.ctx.textAlign = 'start';
    this.ctx.fillStyle = 'rgb(98,98,98)';
    this.ctx.fillText(`Score: ${this.score}`, offsetX, offsetY);
    this.ctx.textAlign = 'end';
    this.ctx.fillText(`To Level Up: ${this.scoreToLevelUp-this.score}`, this.width - offsetX, offsetY);
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Level: ${this.level}`, this.width/2, offsetY);
  }


  drawField () {
    this.ctx.save();
    this.ctx.translate(0, this.hudHeight);
    for (let y of this.field) {
      for (let cell of y) {
        cell.drawCell(this);
      }
    }
    for (let y of this.field) {
      for (let cell of y) {
        cell.drawBall(this);
      }
    }
    this.ctx.restore();
  }

  draw () {
    this.ctx.clearRect(0, 0, this.width, this.gameHeight);
    this.drawHUD();
    this.drawField();
    if (this.isGameOver) {
      this.drawGameOver();
    }
  }

  drawGameOver () {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    this.ctx.fillRect(0, 0, this.width, this.gameHeight);
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
  constructor(x, y, colorIdx, color, cellWidth, cellHeight) {
    this.colorIdx = colorIdx;
    this.color = color;
    this.px = 0;
    this.py = 0;
    this.x = x;
    this.y = y;
    this.scaleX = 0;
    this.scaleY = 0;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.selectedTween = null;
  }

  xy2screen (x, y) {
    let pX = x*this.cellWidth+this.cellWidth/2;
    let pY = y*this.cellHeight+this.cellHeight/2;
    return {pX:pX, pY:pY};
  }

  hoover (oldx, oldy) {
    let oldP = this.xy2screen(oldx, oldy);
    let p = this.xy2screen(this.x, this.y);
    let mx = p.pX-oldP.pX;
    let my = p.pY-oldP.pY;

    this.px = -mx;
    this.py = -my;

    let scaling = new TWEEN.Tween(this).to({scaleX:1.5, scaleY:1.5}, 250)
      .easing(TWEEN.Easing.Quadratic.Out)
      .chain(new TWEEN.Tween(this).to({scaleX:1, scaleY:1}, 250)
        .easing(TWEEN.Easing.Quadratic.In)).start();
    let animation = new TWEEN.Tween(this).to({px:0, py:0}, 500).easing(TWEEN.Easing.Quadratic.InOut)
      .start();

  }

  appear (delay=0) {
    let animation = new TWEEN.Tween(this).to({scaleX:1, scaleY:1}, 400)
                                          .easing(TWEEN.Easing.Quadratic.In).delay(delay);
    animation.start();
  }

  selected (game) {
    console.log('Selected ', this);
    let goDown = new TWEEN.Tween(this).to({py: 0, scaleY:1, scaleX:1}, 300)
                                      .easing(TWEEN.Easing.Quadratic.In);
    let squeeze = new TWEEN.Tween(this).to({scaleX: 1.25, scaleY:0.75, py:game.cellHeight/8}, 300)
                                      .easing(TWEEN.Easing.Quadratic.Out);
    let unsqueeze = new TWEEN.Tween(this).to({scaleX: 1, scaleY:1, py: 0}, 200)
                                          .easing(TWEEN.Easing.Quadratic.In);

    this.selectedTween = new TWEEN.Tween(this)
                  .to({py: -game.cellHeight/4, scaleY: 1.05, scaleX: 0.95}, 500)
                  .easing(TWEEN.Easing.Quadratic.Out)
                  .chain(goDown);
    goDown.chain(squeeze);
    squeeze.chain(unsqueeze);
    unsqueeze.chain(this.selectedTween);
    this.selectedTween.start();
  }

  deselect (game) {
    console.log('Deselected ', this);
    this.selectedTween.stop();
    this.selectedTween = null;
    this.py = 0;
    this.scaleX = 1;
    this.scaleY = 1;
  }

  drawBall (game) {
    game.ctx.translate (this.px, this.py);
    game.ctx.scale(this.scaleX, this.scaleY);
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
