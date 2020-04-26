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
import {superBomb, SuperBomb} from "./superBomb";
import {rainbow, RainbowBall} from "./rainbowBall";
import {X3Ball, x3Ball} from "./x3Ball";
import {Base} from "./base";
import {HUD} from "./HUD";
import {GameOver} from "./gameOver";

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
    this.HUD = null;
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

  refresh(time) {
    this.animate(time);
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
    this.possibleBallTypes = [regular, regular, regular, regular, regular, doubleBall, regular, regular, regular, regular];
    this.forcedBallTypes = [contractionBall];
    this.ballsRemoved = 0;
    this.colorWaveIdx = null;

    if (this.height) {
      this.cellHeight = (this.height-this.hudHeight) / this.fieldHeight;
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
    this.initEngine();
  }

  setupResources() {
    super.setupResources();
    this.generateBalls();
    this.createHUD();
    this.gameOver = new GameOver(this);
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

  checkForWholeLine (state1, state2, ballsToRemove, selectedCell) {
    let state = false;
    if (state1.colorSet.size !== 0 && state2.colorSet.size !== 0) {
      let set3 = intersection(state1.colorSet, state2.colorSet);
      if (set3.size !== 0) {
        let inARow = [selectedCell];
        inARow.push(...state1.inARow);
        inARow.push(...state2.inARow);
        if (this.isLineComplete(inARow)) {
          ballsToRemove.push(...inARow);
          return true;
        }
      }
    }
    if (state1.colorSet.size !== 0) {
      let inARow = [selectedCell];
      inARow.push(...state1.inARow);
      if (this.isLineComplete(inARow)) {
        ballsToRemove.push(...inARow);
        state = true;
      }
    }
    if (state2.colorSet.size !== 0) {
      let inARow = [selectedCell];
      inARow.push(...state2.inARow);
      if (this.isLineComplete(inARow)) {
        ballsToRemove.push(...inARow);
        state = true;
      }
    }
    return state;
  }

  checkAll(x, y, cell) {
    if (cell.ball !== null) {
      this.earnedScore = 0;
      let state = false;
      let ballsToRemove = [];
      let ball = cell.ball;
      let selected = this.field[y][x];

      let state1 = this.check(x, y, 1, 0, ball);
      let state4 = this.check(x, y, -1, 0, ball);
      state = this.checkForWholeLine(state1, state4, ballsToRemove, selected);

      let state2 = this.check(x, y, 0, 1, ball);
      let state5 = this.check(x, y, 0, -1, ball);
      state |= this.checkForWholeLine(state2, state5, ballsToRemove, selected);

      let state3 = this.check(x, y, 1, 1, ball);
      let state6 = this.check(x, y, -1, -1, ball);
      state |= this.checkForWholeLine(state3, state6, ballsToRemove, selected);

      let state7 = this.check(x, y, 1, -1, ball);
      let state8 = this.check(x, y, -1, 1, ball);
      state |= this.checkForWholeLine(state7, state8, ballsToRemove, selected);

      if (state) {
        this.removeBalls(ballsToRemove);
        let pixel = xy2screen(x, y, this);
        let floating = new ScoreFloat(this.earnedScore, pixel.pX, pixel.pY, this);
        floating.animate(this);
        this.scoreAnimation(ballsToRemove.length*300-ballsToRemove.length*110);
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
      for (let row of this.field) {
        for (let cell of row) {
          if (cell.ball) {
            cell.ball.removeFromScene();
          }
        }
      }
      this.initGame();
      this.generateBalls();
      this.gameOver.hide();
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
      this.changeScore(this.multiplier, cell.ball.getScore());
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
      this.turnOnGameOver();
    }

    return emptyCells;

  }

  turnOnGameOver() {
    this.isGameOver = true;
    this.gameOver.show();
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
    let delta = (this.width-this.width*scaleFactor)/2;
    this.setBlock();
    let animation = new TWEEN.Tween(this.cnt.field.scale)
      .to({x:scaleFactor, y:scaleFactor},1000)
      .easing(TWEEN.Easing.Back.In).onComplete(() => {this.expandField(); this.removeBlock()}).start();
    let animation2 = new TWEEN.Tween(this.cnt.field)
      .to({x:delta, y:delta+this.hudHeight},1000)
      .easing(TWEEN.Easing.Back.In).onComplete(() => {
        this.cnt.field.x = 0;
        this.cnt.field.y = this.hudHeight;
      }).start();
  }

  expandField() {
    this.cnt.field.scale.set(1);
    this.scaleY = 1;
    this.scaleX = 1;
    this.oldField = this.field;
    this.fieldHeight += 2;
    this.fieldWidth += 2;
    this.field = [];
    this.cellHeight = (this.height-this.hudHeight) / this.fieldHeight;
    this.cellWidth = this.width / this.fieldWidth;
    this.cellHeight2 = this.cellHeight / 2;
    this.cellWidth2 = this.cellWidth / 2;
    this.initField();
    this.createFieldGraphics(this.graphics);
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
          cell.ball.reinit();
        }
      }
    }
  }

  contractAnimation () {
    let scaleFactor = this.fieldWidth/(this.fieldWidth+2);
    let delta = (this.width-this.width*scaleFactor)/2;
    this.setBlock();
    this.cnt.field.scale.set(scaleFactor);
    this.cnt.field.x = delta;
    this.cnt.field.y = delta+this.hudHeight;
    let animation = new TWEEN.Tween(this.cnt.field.scale).to({x:1, y:1}, 1000).easing(TWEEN.Easing.Back.Out)
      .onComplete(() => {this.removeBlock()}).start();
    let animation2 = new TWEEN.Tween(this.cnt.field).to({x:0, y:this.hudHeight}, 1000).easing(TWEEN.Easing.Back.Out)
      .start();
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
            cell.ball.removeFromScene();
            cell.setBall(new ColorWave(cell.x, cell.y, this.cellWidth, this.cellHeight, colorIdx, color, this));
            cell.ball.appear(counter*50, () => {cell.ball.dribble()});
            counter++;
          }
        }
      }
      if (counter === 0) {
        return;
      }
      this.HUD.turnOnColorWaveTimer(colorIdx);
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
    this.HUD.turnOffColorWaveTimer();
    this.colorWaveTimer = null;
    this.colorWaveIdx = null;
    this.isColorWaveModeOn = false;
    let color = this.possibleBallColors[colorIdx];
    for (let row of this.field) {
      for (let cell of row) {
        if (cell.ball && cell.ball.getType() === colorWave &&
          cell.ball.colorIdx === colorIdx && !cell.ball.isVanishing) {
          this.cnt.game.removeChild(cell.ball.ballCont);
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
      this.cnt.field.scale.set(1);
      this.oldField = this.field;
      this.fieldHeight -= 2;
      this.fieldWidth -= 2;
      this.field = [];
      this.cellHeight = (this.height-this.hudHeight) / this.fieldHeight;
      this.cellWidth = this.width / this.fieldWidth;
      this.cellHeight2 = this.cellHeight / 2;
      this.cellWidth2 = this.cellWidth / 2;
      this.initField();
      this.createFieldGraphics(this.graphics);
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
            cell.ball.reinit();
          }
        }
      }
      this.contractAnimation();
    }
  }

  superBombRemoveBalls () {
    this.setBlock();
    this.earnedScore = -Math.floor(this.score*0.25);
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
    this.scoreAnimation(balls.length*125);
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

  scoreAnimation(duration = 1000) {
    let animation = new TWEEN.Tween(this).to({score:this.score+this.earnedScore}, duration)
      .onUpdate(() => {this.HUD.update()}).start();
  }

  createHUD () {
    this.HUD = new HUD(this);
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
