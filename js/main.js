function init () {
  game.init();
  game.refresh(performance.now());
}


function xy2screen (x, y, object) {
  let pX = x * object.cellWidth + object.cellWidth / 2;
  let pY = y * object.cellHeight + object.cellHeight / 2;
  return {pX: pX, pY: pY};
}

function onResize() {
  game.resize();
}

function onCanvasClick (event) {
  game.onClick(event.offsetX, event.offsetY);
}

function intersection(setA, setB) {
  let _intersection = new Set();
  for (let elem of setB) {
    if (setA.has(elem)) {
      _intersection.add(elem);
    }
  }
  return _intersection;
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
      if (this.ball) {
        this.ball.deselect();
      }
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

class Color {
  constructor(r, g, b, a = 1) {
    this.red = r;
    this.green = g;
    this.blue = b;
    this.alpha = a;
  }

  lightenColor (percent = 0.2) {
    let r = Math.min(this.red*(1+percent), 255);
    let g = Math.min(this.green*(1+percent), 255);
    let b = Math.min(this.blue*(1+percent), 255);
    return `rgba(${r},${g},${b},${this.alpha})`
  }

  darkenColor (percent = 0.8) {
    return `rgba(${this.red*percent},${this.green*percent},${this.blue*percent},${this.alpha})`
  }

  clone () {
    return new Color(this.red, this.green, this.blue, this.alpha);
  }

  iRequestNormalColor () {
    return `rgba(${this.red},${this.green},${this.blue},${this.alpha})`;
  }

}

const expansionBall = 'expansion';
const doubleBall = 'double';
const regular = 'regular';
const rainbow = 'rainbow';
const contractionBall = 'contraction';
const superBomb = 'superBomb';
const colorWave = 'colorWave';

class Game {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.from = null;
    this.height = 0;
    this.width = 0;
    this.delay = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.cellHeight = 0;
    this.cellWidth = 0;
    this.cellHeight2 = 0;
    this.cellWidth2 = 0;
    this.hudHeight = 0;
    this.blockedCells = [];
    this.drawOverAll = [];
    this.blockClick = false;
    this.colorWaveTimer = null;
    this.possibleBallColors = [
      new Color(218, 0, 25),
      new Color(255, 91, 0),
      new Color(255, 203, 1),
      new Color(14, 109, 0),
      new Color(0, 158, 255),
      new Color(0, 0, 255),
      new Color(125, 0, 125)
    ];

  }

  resize () {
    console.log('resizing');
    this.gameHeight = this.canvas.offsetHeight;
    this.width = this.canvas.offsetWidth;
    this.hudHeight = this.gameHeight-this.width;
    this.height = this.gameHeight - this.hudHeight;
    this.cellHeight = this.height / this.fieldHeight;
    this.cellWidth = this.width / this.fieldWidth;
    this.cellHeight2 = this.cellHeight / 2;
    this.cellWidth2 = this.cellWidth / 2;
    this.canvas.width = this.width;
    this.canvas.height = this.gameHeight;
    for (let row of this.field) {
      for (let cell of row) {
        if (cell.ball) {
          cell.ball.cellWidth = this.cellWidth;
          cell.ball.cellHeight = this.cellHeight;
        }
      }
    }
  }

  refresh(time) {
    this.animate(time);
    this.draw();
    if (this.decideToRefresh()) {
      requestAnimationFrame((time1 => this.refresh(time1)));
    }
  }

  animate(time) {
    TWEEN.update(time);
  }

  decideToRefresh() {
    return true;
  }

  initGame() {
    this.ballsPerTime = 3;
    this.inARowToVanish = 5;
    this.fieldHeight = 8;
    this.fieldWidth = 8;
    this.score = 0;
    this.earnedScore = 0;
    this.multiplier = 1;
    this.level = 1;
    this.levelToExpand = 5;
    this.levelToContract = 3;
    this.scoreToLevelUp = 100;
    this.levelToAddColor = 3;
    this.isGameOver = false;
    this.isColorWaveModeOn = false;
    this.possibleBallTypes = [regular, regular, regular, doubleBall, regular, regular, regular, regular, regular, regular];
    this.forcedBallTypes = [colorWave, colorWave];
    this.ballsRemoved = 0;
    this.colorWaveIdx = null;

    if (this.height) {
      this.cellHeight = this.height / this.fieldHeight;
      this.cellWidth = this.width / this.fieldWidth;
      this.cellHeight2 = this.cellHeight / 2;
      this.cellWidth2 = this.cellWidth / 2;
    }
    this.newColorIdx = 2;
    this.field = [];
    this.oldField = [];
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

    this.gameHeight = this.canvas.offsetHeight;
    this.width = this.canvas.offsetWidth;
    this.hudHeight = this.gameHeight-this.width;
    this.height = this.gameHeight - this.hudHeight;
    this.cellHeight = this.height / this.fieldHeight;
    this.cellWidth = this.width / this.fieldWidth;
    this.cellHeight2 = this.cellHeight / 2;
    this.cellWidth2 = this.cellWidth / 2;
    this.canvas.width = this.width;
    this.canvas.height = this.gameHeight;


    console.log('canvas size is ', this.gameHeight, ':', this.width);
    this.generateBalls();
  }

  addColorOnLvlUp() {
    if (this.level % this.levelToAddColor === 0) {
      if (this.newColorIdx < this.possibleBallColors.length - 1) {
        this.newColorIdx++;
      }
    }
  }


  levelUpIfNeeded() {
    if (this.score + this.earnedScore >= this.scoreToLevelUp) {
      this.level++;
      this.multiplier = this.multiplier * 1.2;
      this.scoreToLevelUp = Math.ceil(this.scoreToLevelUp + 100 * this.multiplier);
      this.addColorOnLvlUp();
      this.expandOnLvlUp();
      this.contractOnLvlUp();
    }
  }

  changeScore(multiplier, ball) {
    let score = ball.getScore()
    this.earnedScore = Math.floor(this.earnedScore + score * multiplier);
  }

  addBlockedCell (cell) {
    this.blockedCells.push(cell);
  }

  removeBlockedCell(cell) {
    for (let idx in this.blockedCells) {
      if (cell === this.blockedCells[idx]) {
        this.blockedCells.splice(idx, 1);
        break;
      }
    }
  }

  checkForBlockedCell (x,y) {
    for (let cell of this.blockedCells) {
      if (cell.x === x && cell.y === y) {
        return true;
      }
    }
    return false;
  }

  addOverallObject(object) {
    this.drawOverAll.push(object);
  }

  removeOverallObject(object) {
    for (let idx in this.drawOverAll) {
      if (object === this.drawOverAll[idx]) {
        this.drawOverAll.splice(idx, 1);
        break;
      }
    }

  }

  checkAll(x, y, cell) {
    if (cell.ball !== null) {
      this.earnedScore = 0;
      let state = false;
      let ballsToRemove = [];
      let ball = cell.ball;
      let selected = this.field[y][x];

      let state1 = this.check(x, y, 1, 0, ball);
      let state4 = this.check(x, y, -1, 0, ball, state1.colorSet);
      state1.inARow.push(selected);
      state1.inARow.push(...state4.inARow);
      if (this.isLineComplete(state1.inARow)) {
        state = true;
        ballsToRemove.push(...state1.inARow);
      }

      let state2 = this.check(x, y, 0, 1, ball);
      let state5 = this.check(x, y, 0, -1, ball, state2.colorSet);
      state2.inARow.push(selected);
      state2.inARow.push(...state5.inARow);
      if (this.isLineComplete(state2.inARow)) {
        state = true;
        ballsToRemove.push(...state2.inARow);
      }

      let state3 = this.check(x, y, 1, 1, ball);
      let state6 = this.check(x, y, -1, -1, ball, state3.colorSet);
      state3.inARow.push(selected);
      state3.inARow.push(...state6.inARow);
      if (this.isLineComplete(state3.inARow)) {
        state = true;
        ballsToRemove.push(...state3.inARow);
      }

      let state7 = this.check(x, y, 1, -1, ball);
      let state8 = this.check(x, y, -1, 1, ball, state7.colorSet);
      state7.inARow.push(selected);
      state7.inARow.push(...state8.inARow);
      if (this.isLineComplete(state7.inARow)) {
        state = true;
        ballsToRemove.push(...state7.inARow);
      }

      if (state) {
        this.removeBalls(ballsToRemove);
        let pixel = xy2screen(x, y, this);
        let floating = new ScoreFloat(this.earnedScore, pixel.pX, pixel.pY);
        floating.animate(this);
        this.scoreAnimation();
      }
      return state;
    }
  }

  prepareNextMove(x, y, cell) {
    if (!this.checkAll(x, y, cell)) {
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
    if (!this.blockClick) {
      if (!this.isColorWaveModeOn) {
        this.regularClick(x, y);
      } else {
        this.colorWaveClick(x, y);
      }
    }
  }

  colorWaveClick(x, y) {
    let cellX = Math.floor(x / this.cellWidth);
    let cellY = Math.floor((y - this.hudHeight) / this.cellHeight);
    if (this.checkForBlockedCell(cellX, cellY)){
      return;
    }

    let cell = this.field[cellY][cellX];
    if (cell.ball && cell.ball.getType() === colorWave && cell.ball.colorIdx === this.colorWaveIdx) {
      this.removeBalls([cell]);
    }
  }

  regularClick(x, y) {
    this.operateGameOver();
    let cellX = Math.floor(x / this.cellWidth);
    let cellY = Math.floor((y - this.hudHeight) / this.cellHeight);
    if (this.checkForBlockedCell(cellX, cellY)) {
      return;
    }

    let cellPressed = this.field[cellY][cellX];
    if (cellPressed.ball !== null) {
      if (this.from) {
        this.from.handleSelect(false, this);
      }
      this.from = cellPressed;
      cellPressed.handleSelect(true, this);
    } else {
      if (this.from) {
        this.from.handleSelect(false, this);
        cellPressed.setBall(this.from.ball);
        let from = this.from;
        this.addBlockedCell(from);
        this.addBlockedCell(cellPressed);
        cellPressed.ball.hoover(this.from.x, this.from.y, () => {
          this.removeBlockedCell(from);
          this.removeBlockedCell(cellPressed);
        });
        this.from.ball = null;
        this.from = null;
        this.prepareNextMove(cellX, cellY, cellPressed);
      }
    }
  }

  setBlock () {
    this.blockClick = true;
  }

  removeBlock () {
    this.blockClick = false;
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

  addBallToField (selectedCell) {
    selectedCell.ball = this.createBall(selectedCell.x, selectedCell.y);
    selectedCell.ball.appear(this.delay, () => {
      this.removeBlockedCell(selectedCell);
    });
    this.delay = this.delay + 100;
  }

  initRandomCell(emptyCells) {
    let idx;
    if (emptyCells.length === 0) {
      return null;
    }
    idx = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[idx];
  }

  checkBalls(state) {
    for (let cell of state) {
      if (cell !== null) {
        this.checkAll(cell.x, cell.y, cell);
      } else {
        alert('Error!!!');
      }
    }
  }

  expandOnLvlUp() {
    if (this.level % this.levelToExpand === 0) {
      this.possibleBallTypes.push(expansionBall);
    }
  }

  expandAnimation () {
    let scaleFactor = this.fieldWidth/(this.fieldWidth+2);
    this.setBlock();
    let animation = new TWEEN.Tween(this).to({scaleX:scaleFactor, scaleY:scaleFactor},1000)
      .easing(TWEEN.Easing.Back.In).onComplete(() => {this.expandField(); this.removeBlock()}).start();
  }

  expandField() {
    this.scaleY = 1;
    this.scaleX = 1;
    this.oldField = this.field;
    this.fieldHeight += 2;
    this.fieldWidth += 2;
    this.field = [];
    this.cellHeight = this.height / this.fieldHeight;
    this.cellWidth = this.width / this.fieldWidth;
    this.cellHeight2 = this.cellHeight / 2;
    this.cellWidth2 = this.cellWidth / 2;
    this.initField();
    for (let row of this.oldField) {
      for (let cell of row) {
        cell.x++;
        cell.y++;
        let x = cell.x;
        let y = cell.y;
        if (cell.ball) {
          cell.ball.cellHeight = this.cellHeight;
          cell.ball.cellWidth = this.cellWidth;
          this.field[y][x].setBall(cell.ball);
        }
      }
    }
  }

  contractAnimation () {
    let scaleFactor = this.fieldWidth/(this.fieldWidth+2);
    this.setBlock();
    this.scaleX = scaleFactor;
    this.scaleY = scaleFactor;
    let animation = new TWEEN.Tween(this).to({scaleX:1, scaleY:1}, 1000).easing(TWEEN.Easing.Back.Out)
                    .onComplete(() => {this.removeBlock()}).start();
  }

  contractOnLvlUp () {
    if (this.level%this.levelToContract === 0) {
      this.possibleBallTypes.push(contractionBall);
    }
  }

  colorWaveMode(colorIdx) {
    if (!this.isColorWaveModeOn) {
      let color = this.possibleBallColors[colorIdx];
      this.colorWaveIdx = colorIdx;
      let counter = 0;
      for (let row of this.field) {
        for (let cell of row) {
          if (cell.ball && cell.ball.colorIdx === colorIdx && !cell.ball.isVanishing) {
            cell.setBall(new ColorWave(cell.x, cell.y, this.cellWidth, this.cellHeight, colorIdx, color));
            cell.ball.appear(counter*50, () => {cell.ball.dribble()});
            counter++;
          }
        }
      }
      if (counter === 0) {
        return;
      }
      this.colorWaveTimer = new ColorWaveTimer(5000);
      this.addOverallObject(this.colorWaveTimer);
      this.colorWaveTimer.animate(() => {
        this.turnOffColorWaveMode(colorIdx);
      });
      this.isColorWaveModeOn = true;
    } else {
      if (!this.checkForColorWave()) {
        this.turnOffColorWaveMode(colorIdx);
      }
    }
  }

  checkForColorWave() {
    for (let row of this.field) {
      for (let cell of row) {
        if (cell.ball && cell.ball.getType() === colorWave &&
          !cell.ball.isVanishing && cell.ball.colorIdx === this.colorWaveIdx) {
          return true;
        }
      }
    }
    return false;
  }

  turnOffColorWaveMode (colorIdx) {
    this.removeOverallObject(this.colorWaveTimer);
    this.colorWaveTimer = null;
    this.colorWaveIdx = null;
    this.isColorWaveModeOn = false;
    let color = this.possibleBallColors[colorIdx];
    for (let row of this.field) {
      for (let cell of row) {
        if (cell.ball && cell.ball.getType() === colorWave &&
          cell.ball.colorIdx === colorIdx && !cell.ball.isVanishing) {
          cell.setBall(new RegularBall(cell.x, cell.y, colorIdx, color, this.cellWidth, this.cellHeight));
          cell.ball.appear();
        }
      }
    }
  }

  contractRemoveBalls () {
    let balls = [];
    this.setBlock();
    for (let xidx = 0; xidx < this.fieldWidth; xidx++) {
      let row1 = this.field[0];
      let row2 = this.field[this.fieldHeight - 1];
      let cell1 = row1[xidx];
      let cell2 = row2[xidx];
      if (cell1.ball) {
        balls.push(cell1);
      }
      if (cell2.ball) {
        balls.push(cell2);
      }
    }
    for (let yidx = 1; yidx < this.fieldHeight - 1; yidx++) {
      let cell1 = this.field[yidx][0];
      let cell2 = this.field[yidx][this.fieldWidth - 1];
      if (cell1.ball) {
        cell1.ball.setDisabled(true);
        balls.push(cell1);
      }
      if (cell2.ball) {
        cell2.ball.setDisabled(true);
        balls.push(cell2);
      }
    }
    this.removeBalls(balls, (_cell,isLast) => {if (isLast){this.contractField(); this.removeBlock()}});
  }

  contractField () {
    if (this.fieldWidth > 6) {
      this.scaleY = 1;
      this.scaleX = 1;
      this.oldField = this.field;
      this.fieldHeight -= 2;
      this.fieldWidth -= 2;
      this.field = [];
      this.cellHeight = this.height / this.fieldHeight;
      this.cellWidth = this.width / this.fieldWidth;
      this.cellHeight2 = this.cellHeight / 2;
      this.cellWidth2 = this.cellWidth / 2;
      this.initField();
      for (let idx = 1; idx < this.oldField.length - 1; idx++) {
        let row = this.oldField[idx];
        for (let cellIdx = 1; cellIdx < row.length - 1; cellIdx++) {
          let cell = row[cellIdx];
          cell.x--;
          cell.y--;
          let x = cell.x;
          let y = cell.y;
          if (cell.ball) {
            cell.ball.cellHeight = this.cellHeight;
            cell.ball.cellWidth = this.cellWidth;
            this.field[y][x].setBall(cell.ball);
          }
        }
      }
      this.contractAnimation();
    }
  }

  superBombRemoveBalls () {
    this.setBlock();
    this.earnedScore = -Math.floor(this.score*0.25);
    this.scoreAnimation();
    let balls = [];
    for (let rowIdx = 0; rowIdx < this.field.length; rowIdx++) {
      let row = this.field[rowIdx];

      for (let cell of row) {
        cell.handleSelect(false, this);
        if (cell.ball) {
          cell.ball.setDisabled(true);
          balls.push(cell);
        }
      }
    }
    this.removeBalls(balls, (cell, isLast) => {
      if (isLast) {
        this.generateBalls();
      }
    });
  }

  vanishCallBack(cell, isLast) {
    if (!cell.ball.isDisabled) {
      if (cell.ball instanceof ExpansionBall) {
        this.expandAnimation();
      }
      if (cell.ball instanceof ContractionBall) {
        this.contractRemoveBalls()
      }
      if (cell.ball instanceof SuperBomb) {
        this.superBombRemoveBalls();
      }
      if (cell.ball instanceof ColorWave) {
        this.colorWaveMode(cell.ball.colorIdx);
      }
    }
    cell.ball = null;
    cell.handleSelect(false, this);
    if (isLast) {
      this.levelUpIfNeeded();
      this.removeBlock();
    }
  }

  isLineComplete (array) {
    return array.length>=this.inARowToVanish;
  }

  removeBalls (cellArray, onComplete) {
    let delay = 0;
    if (cellArray.length >= this.inARowToVanish+1) {
      this.possibleBallTypes.push(rainbow);
    }
    for (let index in cellArray) {
      let cell = cellArray[index];
      this.addBlockedCell(cell);
      this.changeScore(this.multiplier, cell.ball);
      this.incrementRemovedBalls();
      cell.ball.vanish(() => {
        let isLast = parseInt(index) === cellArray.length-1;
        this.removeBlockedCell(cell);
        if (onComplete) {
          cell.ball = null;
          cell.handleSelect(false, this);
          onComplete(cell, isLast)
        } else {
          this.vanishCallBack(cell, isLast)
        }
      }, delay);
      delay += 100;
    }
  }

  incrementRemovedBalls() {
    this.ballsRemoved ++;
    if (this.ballsRemoved%29 === 0) {
      this.forcedBallTypes.push(colorWave);
    }
  }

  generateBalls () {
    let state = [];
    for (let idx = 0; idx < this.ballsPerTime; idx++) {
      let element = this.initRandomCell(this.findEmptyCells());
      if (element !== null) {
        this.addBallToField(element);
        state.push(element);
        this.addBlockedCell(element);
      }
    }
    let empty = this.findEmptyCells();
    if (empty.length === 0) {
      this.delay = 0;
      return false;
    }
     else {
       if (empty.length <= 0.33*this.fieldHeight*this.fieldWidth && !this.checkForSuperBombs()) {
         this.forcedBallTypes.push(superBomb);
       }
      this.checkBalls(state);
      this.delay = 0;
      return true;
    }
  }

  /**
   * check field for super bomb, returns true if found
   * @returns {boolean}
   */
  checkForSuperBombs () {
    for (let row of this.field) {
      for (let cell of row) {
        if (cell.ball && cell.ball.getType() === superBomb) {
          return true;
        }
      }
    }
    return false;
  }

  removeBallType (type) {
    let index = this.possibleBallTypes.findIndex((item) => {return item === type});
    this.possibleBallTypes.splice(index, 1);
  }

  createBall(x, y) {
    let ballType;
    if (this.forcedBallTypes.length === 0) {
      ballType = this.possibleBallTypes [Math.floor(Math.random() * this.possibleBallTypes.length)];
    } else {
      ballType = this.forcedBallTypes.shift();
    }
    switch (ballType) {
      case regular: {
        let colorIdx = this.getRandomColorIdx();
        let color = this.possibleBallColors[colorIdx];
        return new RegularBall(x, y, colorIdx, color, this.cellWidth, this.cellHeight);
      }
      case rainbow: {
        this.removeBallType(rainbow);
        return new RainbowBall(x, y, this.cellHeight, this.cellWidth, this.possibleBallColors);
      }
      case doubleBall: {
        let colorIdx1 = this.getRandomColorIdx();
        let colorIdx2 = this.getRandomColorIdx();
        while (colorIdx1 === colorIdx2) {
          colorIdx2 = this.getRandomColorIdx();
        }
        return new DoubleBall(x, y, this.cellWidth, this.cellHeight, colorIdx1, colorIdx2, this.possibleBallColors);
      }
      case expansionBall: {
        this.removeBallType(expansionBall);
        let colorIdx = this.getRandomColorIdx();
        let color = this.possibleBallColors[colorIdx];
        return new ExpansionBall(x, y, colorIdx, color, this.cellWidth, this.cellHeight);
      }
      case contractionBall: {
        this.removeBallType(contractionBall);
        let colorIdx = this.getRandomColorIdx();
        let color = this.possibleBallColors[colorIdx];
        return new ContractionBall(x, y, colorIdx, color, this.cellWidth, this.cellHeight);
      }
      case superBomb: {
        this.removeBallType(superBomb);
        return new SuperBomb(x, y, this.cellWidth, this.cellHeight, this.possibleBallColors);
      }
      case colorWave: {
        this.removeBallType(colorWave);
        let colorIdx = this.getRandomColorIdx();
        let color = this.possibleBallColors[colorIdx];
        return new ColorWave(x, y, this.cellWidth, this.cellHeight, colorIdx, color);
      }
    }
  }

  getRandomColorIdx () {
    return Math.floor(Math.random() * (this.newColorIdx + 1));
  }

  check(x, y, deltaY, deltaX, ball, colors) {
    let originalDY = deltaY;
    let originalDX = deltaX;
    let inARow = [];

    let colorSet = colors ? colors : ball.colors;
    let prevColorSet = colorSet;

    while (y+deltaY < this.fieldHeight && x+deltaX < this.fieldWidth
          && y+deltaY >= 0 && x+deltaX >= 0) {

      let element = this.field[y + deltaY][x + deltaX];
      if (element.ball !== null) {
        prevColorSet = colorSet;
        colorSet = intersection(colorSet, element.ball.colors);
        if (colorSet.size !== 0) {
          inARow.push(element);
          deltaX += originalDX;
          deltaY += originalDY;
        } else {
          return  {inARow: inARow, colorSet: prevColorSet};
        }
      } else {
        break;
      }
    }
    return {inARow:inARow, colorSet:colorSet};
  }



  scoreAnimation() {
    let animation = new TWEEN.Tween(this).to({score:this.score+this.earnedScore}, 1000).easing(TWEEN.Easing.Quadratic.Out).start();
  }

  drawHUD () {
    let offsetY = this.hudHeight*0.36;
    let offsetX = this.hudHeight*0.2;
    let textHeight = this.hudHeight*0.44;
    this.ctx.font = `bold ${textHeight}px MainFont`;
    this.ctx.textBaseline = 'top';
    this.ctx.textAlign = 'start';
    this.ctx.fillStyle = 'rgb(98,98,98)';
    this.ctx.fillText(`Score: ${Math.floor(this.score)}`, offsetX, offsetY);
    this.ctx.textAlign = 'end';
    this.ctx.fillText(`Lvl Up: ${Math.floor(this.scoreToLevelUp-this.score)}`, this.width - offsetX, offsetY);
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Lvl: ${this.level}`, this.width/2, offsetY);
  }


  drawFieldContent () {
    this.ctx.save();
    this.ctx.translate(0, this.hudHeight);
    if (this.scaleX<1) {
      this.ctx.translate(this.width/2, this.gameHeight/2);
      this.ctx.scale(this.scaleX, this.scaleY);
      this.ctx.translate(-this.width/2, -this.gameHeight/2);
    }
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
    this.drawFieldContent();
    this.drawLast();
    if (this.isGameOver) {
      this.drawGameOver();
    }
  }

  drawLast () {
    for (let index in this.drawOverAll) {
      let object = this.drawOverAll[index];
      object.draw(this);
    }
  }

  drawGameOver () {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    let fontHeight = this.gameHeight*0.098;
    this.ctx.fillRect(0, 0, this.width, this.gameHeight);
    this.ctx.font = `bold ${fontHeight}px MainFont`;
    this.ctx.fillStyle = 'rgb(180,0,46)';
    this.ctx.strokeStyle = 'rgb(255, 255, 255)';
    this.ctx.strokeWidth = 3;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.width/2, this.height/2);
    this.ctx.strokeText('GAME OVER', this.width/2, this.height/2);
  }

}

class ScoreFloat {
  constructor(score, px, py) {
    this.score = score;
    this.px = px;
    this.py = py;
    this.opacity = 1;
  }

  animate (game) {
    game.addOverallObject(this);
    let animation = new TWEEN.Tween(this).to({py:this.py-3*game.cellHeight, opacity:0}, 500)
      .easing(TWEEN.Easing.Quadratic.In).onComplete(()=>{game.removeOverallObject(this)}).start();

  }

  draw (game) {
      game.ctx.save();
      game.ctx.translate(this.px, this.py);
      game.ctx.fillStyle = `rgba(14,109,0, ${this.opacity})`;
      game.ctx.strokeStyle = `rgba(255,255,255, ${this.opacity})`;
      game.ctx.strokeWidth = 1;
      game.ctx.font = 'bold 32px MainFont';
      game.ctx.textAlign = 'center';
      game.ctx.fillText(`${this.score}`, 0, 0);
      game.ctx.strokeText(`${this.score}`, 0, 0);
      game.ctx.restore();
  }
}

class Ball {
  constructor(x, y, cellWidth, cellHeight) {
    this.px = 0;
    this.py = 0;
    this.x = x;
    this.y = y;
    this.scaleX = 0;
    this.scaleY = 0;
    this.angle = 0;
    this.isVanishing = false;
    this.isDisabled = false;
    this.colors = new Set();
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.selectedTween = null;
  }

  setDisabled(state) {
    this.isDisabled = state;
  }

  getScore () {
    return 0;
  }

  getType () {
    return 'ball';
  }

  drawBall (game) {
    game.ctx.translate (this.px, this.py);
    game.ctx.scale(this.scaleX, this.scaleY);
    game.ctx.rotate(this.angle);
  }

  vanish (onComplete,delay = 0) {
    this.isVanishing = true;
    let rescale = new TWEEN.Tween(this).to({scaleX: 5, scaleY: 5}, 300).easing(TWEEN.Easing.Quadratic.In)
      .delay(delay).onComplete(onComplete).start();
  }

  hoover (oldx, oldy, onComplete) {
    let oldP = xy2screen(oldx, oldy, this);
    let p = xy2screen(this.x, this.y, this);
    let mx = p.pX-oldP.pX;
    let my = p.pY-oldP.pY;

    this.px = -mx;
    this.py = -my;

    let scaling = new TWEEN.Tween(this).to({scaleX:1.5, scaleY:1.5}, 250)
      .easing(TWEEN.Easing.Quadratic.Out)
      .chain(new TWEEN.Tween(this).to({scaleX:1, scaleY:1}, 250)
        .easing(TWEEN.Easing.Quadratic.In)).start();
    let animation = new TWEEN.Tween(this).to({px:0, py:0}, 500).easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete(onComplete)
      .start();

  }

  appear (delay= 0, callback) {
    let animation = new TWEEN.Tween(this).to({scaleX:1, scaleY:1}, 400)
      .easing(TWEEN.Easing.Quadratic.In).delay(delay);
    if (callback) {
      animation.onComplete(callback)
    }
    animation.start();
  }

  selected (game) {
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

  deselect () {
    if (this.selectedTween) {
      if (Array.isArray(this.selectedTween)) {
        for (let animation of this.selectedTween) {
          animation.stop();
        }
      } else {
        this.selectedTween.stop();
      }
      this.selectedTween = null;
    }
    this.py = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.angle = 0;
  }
}

class RegularBall extends Ball {
  constructor(x, y, colorIdx, color, cellWidth, cellHeight) {
    super(x,y,cellWidth, cellHeight);
    this.colors.add(colorIdx);
    this.color = color.clone();
    this.colorIdx = colorIdx;
  }

  getScore() {
    return 5;
  }

  getType() {
    return regular;
  }

  vanish (onComplete,delay = 0) {
    super.vanish(onComplete, delay);
    let alphaChange = new TWEEN.Tween(this.color).to({alpha:0},300).easing(TWEEN.Easing.Quadratic.In)
      .delay(delay).start();
  }

  drawBall (game) {
    super.drawBall(game);
    let x = -game.cellWidth2;
    let y = -game.cellHeight2;
    let color = this.color.iRequestNormalColor();
    let xy0 = Math.floor(this.cellHeight*0.15);
    let radius = Math.floor(this.cellWidth*0.3125);

    let gradient = game.ctx.createRadialGradient(-xy0, -xy0, 0, 0, 0, radius);

    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.7, color);
    gradient.addColorStop(0.9, color);
    gradient.addColorStop(1, 'transparent');

    game.ctx.fillStyle = gradient;
    game.ctx.fillRect(x, y, game.cellWidth, game.cellHeight);
  }
}

class RainbowBall extends Ball {
  constructor(x, y, cellHeight, cellWidth, possibleColors) {
    super(x, y, cellWidth, cellHeight);
    this.actualColors = [];
    for (let idx in possibleColors) {
      let color = possibleColors[idx];
      this.colors.add(parseInt(idx));
      this.actualColors.push(new Color(color.red, color.green, color.blue));
    }
  }

  getScore() {
    return 25;
  }

  getType() {
    return rainbow;
  }

  drawBall(game) {
    super.drawBall(game);
    let x = -game.cellWidth2;
    let y = -game.cellHeight2;
    let xy0 = Math.floor(this.cellHeight * 0.15);
    let xy1 = Math.floor(this.cellHeight * 0.16);
    let radius = Math.floor(this.cellWidth * 0.3125);
    let gradient = game.ctx.createRadialGradient(-xy0, -xy0, 0, 0, 0, radius);
    let gradient2 = game.ctx.createRadialGradient(xy1, xy1, 0, 0, 0, radius);
    let rainbowGradient = game.ctx.createRadialGradient(0, 0, 0, 0, 0, radius);

    gradient.addColorStop(0, 'white');
    gradient2.addColorStop(0, 'rgba(255,255,255,0.7)');
    gradient.addColorStop(0.8, 'rgba(255,255,255,0)');
    gradient2.addColorStop(0.7, 'rgba(255,255,255,0)');
    let gidx = 0;
    for (let color of this.actualColors) {
      rainbowGradient.addColorStop(gidx, color.iRequestNormalColor());
      gidx += 0.15;
    }
    rainbowGradient.addColorStop(1, 'transparent');
    gradient.addColorStop(1, 'transparent');
    gradient2.addColorStop(1, 'transparent');

    game.ctx.fillStyle = rainbowGradient;
    game.ctx.fillRect(x, y, game.cellWidth, game.cellHeight);
    game.ctx.fillStyle = gradient;
    game.ctx.fillRect(x, y, game.cellWidth, game.cellHeight);
    game.ctx.fillStyle = gradient2;
    game.ctx.fillRect(x, y, game.cellWidth, game.cellHeight);
  }
}

class DoubleBall extends Ball{
  constructor(x, y, cellWidth, cellHeight, colorIdx1, colorIdx2, possibleColors) {
    super(x,y,cellWidth, cellHeight);
    let fakeColor1 = possibleColors[colorIdx1];
    let fakeColor2 = possibleColors[colorIdx2];
    this.color1 = fakeColor1.clone();
    this.color2 = fakeColor2.clone();
    this.colors.add(colorIdx1);
    this.colors.add(colorIdx2);
  }

  getScore() {
    return 10;
  }

  getType() {
    return doubleBall;
  }

  drawBall(game) {
    super.drawBall(game);
    let x = -game.cellWidth2;
    let y = -game.cellHeight2;
    let xy0 = Math.floor(this.cellHeight * 0.15);
    let xy1 = Math.floor(this.cellHeight * 0.16);
    let radius = Math.floor(this.cellWidth * 0.3125);
    let gradient = game.ctx.createRadialGradient(-xy0, -xy0, 0, 0, 0, radius);
    let gradient2 = game.ctx.createRadialGradient(xy1, xy1, 0, 0, 0, radius);
    let rainbowGradient = game.ctx.createLinearGradient(radius, radius, -radius, -radius);

    gradient.addColorStop(0, 'white');
    gradient2.addColorStop(0, 'rgba(255,255,255,0.7)');
    gradient.addColorStop(0.8, 'rgba(255,255,255,0)');
    gradient2.addColorStop(0.7, 'rgba(255,255,255,0)');

    rainbowGradient.addColorStop(0, this.color1.iRequestNormalColor());
    rainbowGradient.addColorStop(0.49, this.color1.iRequestNormalColor());
    rainbowGradient.addColorStop(0.51, this.color2.iRequestNormalColor());
    rainbowGradient.addColorStop(1, this.color2.iRequestNormalColor());

    rainbowGradient.addColorStop(1, 'transparent');
    gradient.addColorStop(1, 'transparent');
    gradient2.addColorStop(1, 'transparent');

    game.ctx.fillStyle = rainbowGradient;
    game.ctx.beginPath();
    game.ctx.arc(0.5, 0.5, radius, 0, Math.PI*2);
    game.ctx.fill();
    game.ctx.strokeStyle = 'rgba(68,68,68,0.5)';
    game.ctx.strokeWidth = 1;
    game.ctx.stroke();
    game.ctx.fillStyle = gradient;
    game.ctx.fillRect(x, y, game.cellWidth, game.cellHeight);
    // game.ctx.fillStyle = gradient2;
    // game.ctx.fillRect(x, y, game.cellWidth, game.cellHeight);
  }
}

class ExpansionBall extends RegularBall {
    drawBall(game) {
      super.drawBall(game);
      let radius = Math.floor(this.cellWidth*0.3125);
      game.ctx.strokeStyle = 'black';
      game.ctx.save();
      game.ctx.lineWidth = 3;
      game.ctx.rotate(Math.PI/180*(-45));
      game.ctx.beginPath();
      game.ctx.moveTo(0,this.cellHeight*0.025);
      game.ctx.lineTo(0, Math.floor(radius-this.cellHeight*0.075));
      game.ctx.moveTo(0,this.cellHeight*0.025);
      game.ctx.lineTo(this.cellWidth*0.05, this.cellHeight*0.1);
      game.ctx.moveTo(0,this.cellHeight*0.025);
      game.ctx.lineTo(-this.cellWidth*0.05, this.cellHeight*0.1);

      game.ctx.moveTo(0, -this.cellHeight*0.025);
      game.ctx.lineTo(0, -Math.floor(radius-this.cellHeight*0.075));
      game.ctx.moveTo(0, -this.cellHeight*0.025);
      game.ctx.lineTo(this.cellWidth*0.05, -this.cellHeight*0.1);
      game.ctx.moveTo(0, -this.cellHeight*0.025);
      game.ctx.lineTo(-this.cellWidth*0.05, -this.cellHeight*0.1);
      game.ctx.stroke();
      game.ctx.restore();
    }

    getType() {
      return expansionBall;
    }
}

class ContractionBall extends RegularBall {
  drawBall(game) {
    super.drawBall(game);
    let radius = Math.floor(this.cellWidth*0.3125);
    game.ctx.strokeStyle = 'black';
    game.ctx.save();
    game.ctx.lineWidth = 3;
    game.ctx.rotate(Math.PI/180*45);
    game.ctx.beginPath();
    game.ctx.moveTo(0,this.cellHeight*0.025);
    game.ctx.lineTo(0, Math.floor(radius-this.cellHeight*0.075));
    game.ctx.lineTo(this.cellWidth*0.05, this.cellHeight*0.1);
    game.ctx.moveTo(0, Math.floor(radius-this.cellHeight*0.075));
    game.ctx.lineTo(-this.cellWidth*0.05, this.cellHeight*0.1);

    game.ctx.moveTo(0, -this.cellHeight*0.025);
    game.ctx.lineTo(0, -Math.floor(radius-this.cellHeight*0.075));
    game.ctx.lineTo(this.cellWidth*0.05, -this.cellHeight*0.1);
    game.ctx.moveTo(0, -Math.floor(radius-this.cellHeight*0.075));
    game.ctx.lineTo(-this.cellWidth*0.05, -this.cellHeight*0.1);
    game.ctx.stroke();
    game.ctx.restore();
  }
  getType() {
    return contractionBall;
  }
}

class SuperBomb extends RainbowBall {
  drawBall(game) {
    let x = -game.cellWidth2;
    let y = -game.cellHeight2;
    let xy0 = Math.floor(this.cellHeight*0.15);
    let radius = Math.floor(this.cellHeight*0.3125);
    game.ctx.translate (this.px, this.py);
    game.ctx.scale(this.scaleX, this.scaleY);

    let ballGradient = game.ctx.createRadialGradient(-xy0, -xy0, 0, 0, 0, radius);

    ballGradient.addColorStop(0, 'white');
    ballGradient.addColorStop(0.7, 'black');
    ballGradient.addColorStop(0.9, 'black');
    ballGradient.addColorStop(1, 'transparent');

    game.ctx.fillStyle = ballGradient;
    game.ctx.fillRect(x, y, this.cellWidth, this.cellHeight);

    game.ctx.font = `bold ${radius*0.5}px SmallPixel`;
    game.ctx.fillStyle = 'red';
    game.ctx.textAlign = 'center';
    game.ctx.textBaseline = 'middle';
    game.ctx.strokeStyle = 'white';
    game.ctx.strokeWidth = 1;

    game.ctx.fillText('-25%',0, 0);
  }

  getType() {
    return superBomb;
  }

}

class ColorWave extends Ball {
  constructor(x, y, cellWidth, cellHeight, colorIdx, color) {
    super(x, y, cellWidth, cellHeight);
    this.colors.add(colorIdx);
    this.colorIdx = colorIdx;
    this.color = color.clone();
  }
  getType() {
    return colorWave;
  }
  getScore() {
    return 100;
  }

  drawBall(game) {
    super.drawBall(game);
    let radius = Math.floor(this.cellHeight*0.3125);
    let halfSide = radius/2.5;

    game.ctx.beginPath();
    game.ctx.moveTo(radius, halfSide);
    game.ctx.lineTo(radius, -halfSide);
    game.ctx.lineTo(halfSide, -radius);
    game.ctx.lineTo(-halfSide, -radius);
    game.ctx.lineTo(-radius, -halfSide);
    game.ctx.lineTo(-radius, halfSide);
    game.ctx.lineTo(-halfSide, radius);
    game.ctx.lineTo(halfSide, radius);
    game.ctx.closePath();

    let color = this.color.iRequestNormalColor();
    let darker = this.color.darkenColor(0.8);
    let lighter = this.color.lightenColor(0.5);
    let outerGradient = game.ctx.createLinearGradient(-radius, -radius, radius, radius);
    outerGradient.addColorStop(0, lighter);
    outerGradient.addColorStop(1, darker);

    game.ctx.fillStyle = outerGradient;
    game.ctx.fill();
    game.ctx.strokeStyle = 'rgba(68,68,68,0.5)';
    game.ctx.strokeWidth = 1;
    game.ctx.stroke();

    radius *= 0.7;
    halfSide *= 0.7;

    game.ctx.beginPath();
    game.ctx.moveTo(radius, halfSide);
    game.ctx.lineTo(radius, -halfSide);
    game.ctx.lineTo(halfSide, -radius);
    game.ctx.lineTo(-halfSide, -radius);
    game.ctx.lineTo(-radius, -halfSide);
    game.ctx.lineTo(-radius, halfSide);
    game.ctx.lineTo(-halfSide, radius);
    game.ctx.lineTo(halfSide, radius);
    game.ctx.closePath();

    let innerGradient = game.ctx.createLinearGradient(radius, radius, -radius, -radius);
    innerGradient.addColorStop(0, lighter);
    innerGradient.addColorStop(1, darker);

    game.ctx.fillStyle = innerGradient;
    game.ctx.fill();
  }

  selected(game) {
    let rotation = new TWEEN.Tween(this).to({angle:Math.PI*2}, 3000).repeat(Infinity).start();
    let scaling = new TWEEN.Tween(this).to({scaleY:0.9, scaleX:0.9}, 500).repeat(Infinity)
      .yoyo(true).easing(TWEEN.Easing.Elastic.In).start();
    this.selectedTween = [rotation, scaling];
  }

  vanish(onComplete, delay = 0) {
    this.isVanishing = true;
    if (this.dribbleTween) {
      this.dribbleTween.stop();
      this.dribbleTween = null;
    }
    let rescale = new TWEEN.Tween(this).to({scaleX:0, scaleY:0}, 300).easing(TWEEN.Easing.Quadratic.In)
      .delay(delay).start();
    let rotation = new TWEEN.Tween(this).to({angle:Math.PI*2}, 300).easing(TWEEN.Easing.Quadratic.In)
      .delay(delay).onComplete(onComplete).start();
  }

  dribble () {
    let angle = Math.PI/180*15;
    this.angle = -angle;

    let animation = new TWEEN.Tween(this).to({angle:angle}, 200);

    let goBack = new TWEEN.Tween(this).to({angle:-angle}, 200);

    animation.chain(goBack);
    goBack.chain(animation);
    animation.start();

    this.dribbleTween = animation;
  }

}

class ColorWaveTimer {
  constructor(timeMS) {
    this.timeLeft = timeMS;
    this. animationTime = timeMS;
  }
  draw(game) {
    let fontSize = game.hudHeight*0.56;
    game.ctx.save();
    game.ctx.clearRect(0, 0, game.width, game.hudHeight);
    game.ctx.translate(game.width*0.5, game.hudHeight*0.25);
    game.ctx.fillStyle = 'rgb(98,98,98)';
    game.ctx.textAlign = 'center';
    game.ctx.textBaseline = 'hanging';
    game.ctx.font = `bold ${fontSize}px MainFont`;
    game.ctx.fillText(`${Math.ceil(this.timeLeft/100)/10}`, 0, 0);
    game.ctx.restore();
  }

  animate (callBack) {
    let animation = new TWEEN.Tween(this).to({timeLeft:0}, this.animationTime).onComplete(callBack).start();
  }
}

let game = new Game();
