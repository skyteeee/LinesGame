import {Color} from "./color";
import TWEEN from "@tweenjs/tween.js";
import {regular, RegularBall} from "./regularBall";
import {DoubleBall, doubleBall} from "./doubleBall";
import {Cell} from "./cell";
import {intersection, xy2screen} from "./tools";
import {ScoreFloat} from "./scoreFloat";
import {ColorWave, colorWave} from "./colorWaveBall";
import {ExpansionBall, expansionBall} from "./expansionBall";
import {ContractionBall, contractionBall} from "./contractionBall";
import {ColorWaveTimer} from "./colorWaveTimer";
import {superBomb, SuperBomb} from "./superBomb";
import {rainbow, RainbowBall} from "./rainbowBall";
import {X3Ball, x3Ball} from "./x3Ball";
import {Base} from "./base";

export class Game extends Base {
  constructor() {
    super();
    this.canvas = null;
    this.ctx = null;
    this.from = null;
    this.delay = 0;
    this.scaleX = 1;
    this.scaleY = 1;
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
    this.possibleBallTypes = [regular, regular, regular, regular, regular, regular, regular, regular, regular];
    this.forcedBallTypes = [contractionBall, expansionBall, superBomb];
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
        let cell = new Cell(x, y, this);
        row.push(cell);
      }
      this.field.push(row);
    }

  }

  init() {
    this.initGame();
    this.canvas = document.getElementById('field');
    this.canvas.onclick = (event) => {this.onClick(event.offsetX, event.offsetY);};
    this.ctx = this.canvas.getContext('2d');
    this.initEngine();
    this.gameHeight = this.canvas.offsetHeight;
    this.width = this.canvas.offsetWidth;
    this.height = this.gameHeight - this.hudHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.gameHeight;
  }

  setupResources() {
    super.setupResources();
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

  changeScore(multiplier, score, secondMultiplier=1) {
    this.earnedScore = Math.floor(this.earnedScore + score * multiplier * secondMultiplier);
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
        let floating = new ScoreFloat(this.earnedScore, pixel.pX, pixel.pY, this);
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
    console.log('Touch coords are ', x, y, 'cell w/h: ', this.cellWidth, '/', this.cellHeight);
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
    let cellY = Math.floor(y / this.cellHeight);
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
    let cellY = Math.floor(y / this.cellHeight);
    if (this.checkForBlockedCell(cellX, cellY)) {
      return;
    }

    let cellPressed = this.field[cellY][cellX];
    if (cellPressed.ball !== null) {
      if (this.from) {
        this.from.handleSelect(false);
      }
      if (this.from !== cellPressed) {
        this.from = cellPressed;
        cellPressed.handleSelect(true);
      } else {
        this.from = null;
      }
    } else {
      if (this.from) {
        this.from.handleSelect(false);
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
    if (selectedCell.ball) {
      selectedCell.ball.appear(this.delay, () => {
        this.removeBlockedCell(selectedCell);
      });
      this.delay = this.delay + 100;
    } else {
      this.addBallToField(selectedCell);
    }
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
            cell.setBall(new ColorWave(cell.x, cell.y, this.cellWidth, this.cellHeight, colorIdx, color, this));
            cell.ball.appear(counter*50, () => {cell.ball.dribble()});
            counter++;
          }
        }
      }
      if (counter === 0) {
        return;
      }
      this.colorWaveTimer = new ColorWaveTimer(5000, this);
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
          cell.setBall(new RegularBall(cell.x, cell.y, colorIdx, color, this.cellWidth, this.cellHeight, this));
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
        cell.handleSelect(false);
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
    if (cell.ball && !cell.ball.isDisabled) {
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
    cell.handleSelect(false);
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
    let score = 0;
    let secondMultiplier = 1;
    if (cellArray.length >= this.inARowToVanish+1) {
      this.possibleBallTypes.push(rainbow);
    }
    for (let index in cellArray) {
      let cell = cellArray[index];
      score += cell.ball.getScore();
      this.addBlockedCell(cell);
      if (cell.ball.getType() === x3Ball) {
        secondMultiplier *= 3;
      }
      this.incrementRemovedBalls();
      cell.ball.vanish(() => {
        let isLast = parseInt(index) === cellArray.length-1;
        this.removeBlockedCell(cell);
        if (onComplete) {
          cell.ball = null;
          cell.handleSelect(false);
          onComplete(cell, isLast)
        } else {
          this.vanishCallBack(cell, isLast);
        }
      }, delay);
      delay += 100;
    }
    this.changeScore(this.multiplier, score, secondMultiplier);
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
        return new RegularBall(x, y, colorIdx, color, this.cellWidth, this.cellHeight, this);
      }
      case rainbow: {
        this.removeBallType(rainbow);
        return new RainbowBall(x, y, this.cellHeight, this.cellWidth, this.possibleBallColors,this);
      }
      case doubleBall: {
        let colorIdx1 = this.getRandomColorIdx();
        let colorIdx2 = this.getRandomColorIdx();
        while (colorIdx1 === colorIdx2) {
          colorIdx2 = this.getRandomColorIdx();
        }
        return new DoubleBall(x, y, this.cellWidth, this.cellHeight, colorIdx1, colorIdx2, this.possibleBallColors, this);
      }
      case expansionBall: {
        this.removeBallType(expansionBall);
        let colorIdx = this.getRandomColorIdx();
        let color = this.possibleBallColors[colorIdx];
        return new ExpansionBall(x, y, colorIdx, color, this.cellWidth, this.cellHeight, this);
      }
      case contractionBall: {
        this.removeBallType(contractionBall);
        let colorIdx = this.getRandomColorIdx();
        let color = this.possibleBallColors[colorIdx];
        return new ContractionBall(x, y, colorIdx, color, this.cellWidth, this.cellHeight, this);
      }
      case superBomb: {
        this.removeBallType(superBomb);
        return new SuperBomb(x, y, this.cellWidth, this.cellHeight, this.possibleBallColors, this);
      }
      case colorWave: {
        this.removeBallType(colorWave);
        let colorIdx = this.getRandomColorIdx();
        let color = this.possibleBallColors[colorIdx];
        return new ColorWave(x, y, this.cellWidth, this.cellHeight, colorIdx, color, this);
      }
      case x3Ball: {
        let colorIdx = this.getRandomColorIdx();
        let color = this.possibleBallColors[colorIdx];
        return new X3Ball(x, y, colorIdx, color, this.cellWidth, this.cellHeight, this);
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
      object.draw();
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
