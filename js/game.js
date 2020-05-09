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
    this.animateObjects = [];
    this.blockClick = false;
    this.colorWaveTimer = null;
    this.lastClickTime = 0;
    this.HUD = null;
    this.bonusQueue = [];
    this.lastTime = null;
      this.currentBonus = null;
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
    if (this.lastTime === null) {
      this.lastTime = time;
    }
    let elapsed = (time - this.lastTime) * 0.001;
    this.lastTime = time;
    TWEEN.update(time);
    for (let object of this.animateObjects) {
      object.update(elapsed);
    }
  }

  addAnimatedObject(object) {
    this.animateObjects.push(object);
  }

  removeAnimatedObject(object) {
    for (let index in this.animateObjects) {
      let element = this.animateObjects[index];
      if (element === object) {
        this.animateObjects.splice(index, 1);
        break;
      }
    }
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
    this.forcedBallTypes = [];
    this.nextBalls = [];
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
    this.generateBalls(true);
    this.generateBalls(false);
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
      this.multiplier = this.multiplier * 1.1;
      this.scoreToLevelUp = Math.ceil(this.scoreToLevelUp + 100 * this.multiplier);
      this.addColorOnLvlUp();
      this.expandOnLvlUp();
      this.contractOnLvlUp();
      this.levelUpIfNeeded();
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

  checkAll(x, y, cell, animationType = 'normal') {
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
        this.removeBalls(ballsToRemove, null, animationType);
        this.animateScoreOnRemove(x, y, ballsToRemove.length);
      }
      return state;
    }
  }

  animateScoreOnRemove(x, y, ballAmount) {
    let pixel = xy2screen(x, y, this);
    let floating = new ScoreFloat(this.earnedScore, pixel.pX, pixel.pY + this.hudHeight, this);
    floating.animate(this);
    this.HUD.scoreAnimation(ballAmount*50);
  }

  prepareNextMove(x, y, cell) {
    if (!this.checkAll(x, y, cell)) {
      if (this.generateBalls(true) !== true) {
        this.isGameOver = true;
      } else {
        this.generateBalls(false);
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
      this.createFieldGraphics(this.graphics);
      this.generateBalls(true);
      this.gameOver.hide();
    }
  }

  onClick(x, y) {
    let currentClickTime = performance.now();
    if (currentClickTime - this.lastClickTime > 75) {
      this.lastClickTime = currentClickTime;
      if (!this.blockClick) {
        if (!this.isColorWaveModeOn) {
          this.regularClick(x, y);
        } else {
          this.colorWaveClick(x, y);
        }
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
      this.removeBalls([cell], null);
      this.animateScoreOnRemove(cellX, cellY, 1);
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
          this.prepareNextMove(cellX, cellY, cellPressed);
        });
        this.from.ball = null;
        this.from = null;
      }
    }
  }

  setBlock () {
    this.blockClick = true;
  }

  removeBlock () {
    this.blockClick = false;
  }

  findEmptyCells(callback = () => {return true}) {
    let emptyCells = [];

    for (let row of this.field) {
      for (let cell of row) {
        if (!cell.ball && callback(cell)) {
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
    this.score = Math.floor(this.score);
    this.gameOver.show();
  }

  addBallToField (selectedCell, ball = null) {
    if (!ball) {
      selectedCell.setBall(this.createBall(selectedCell.x, selectedCell.y));
    } else {
      selectedCell.setBall(ball);
      ball.reset();
    }
    if (selectedCell.ball) {
      selectedCell.ball.appear(this.delay, () => {
        this.removeBlockedCell(selectedCell);
      });
      this.delay = this.delay + 100;
    }
  }

  initRandomCell(emptyCells) {
    let idx;
    if (emptyCells.length === 0) {
      return null;
    }
    idx = Math.floor(Math.random() * emptyCells.length);
    return emptyCells.splice(idx, 1).pop();
  }

  checkBalls(cellArray) {
    console.log ('Entered checkBalls. Cell array: ', cellArray);
    for (let cell of cellArray) {
      if (cell !== null) {
        this.checkAll(cell.x, cell.y, cell, 'glow');
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
    if (this.fieldWidth < 12) {
      let scaleFactor = this.fieldWidth / (this.fieldWidth + 2);
      let delta = (this.width - this.width * scaleFactor) / 2;
      this.setBlock();
      let animation = new TWEEN.Tween(this.cnt.field.scale)
        .to({x: scaleFactor, y: scaleFactor}, 1000)
        .easing(TWEEN.Easing.Back.In).onComplete(() => {
          this.expandField();
          this.removeBlock()
        }).start();
      let animation2 = new TWEEN.Tween(this.cnt.field)
        .to({x: delta, y: delta + this.hudHeight}, 1000)
        .easing(TWEEN.Easing.Back.In).onComplete(() => {
          this.cnt.field.x = 0;
          this.cnt.field.y = this.hudHeight;
        }).start();
    } else {
      this.changeScore(this.multiplier, 100);
      this.currentBonus = null;
      this.doBonus();
    }
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
    for (let previewedBall of this.nextBalls) {
      previewedBall.x++;
      previewedBall.y++;
      previewedBall.cellHeight = this.cellHeight;
      previewedBall.cellWidth = this.cellWidth;
      previewedBall.reinit();
    }
    this.currentBonus = null;
    this.doBonus();
  }

  contractAnimation () {
    let scaleFactor = this.fieldWidth / (this.fieldWidth + 2);
    let delta = (this.width - this.width * scaleFactor) / 2;
    this.setBlock();
    this.cnt.field.scale.set(scaleFactor);
    this.cnt.field.x = delta;
    this.cnt.field.y = delta + this.hudHeight;
    let animation = new TWEEN.Tween(this.cnt.field.scale).to({x: 1, y: 1}, 1000)
      .easing(TWEEN.Easing.Back.Out).start();
    let animation2 = new TWEEN.Tween(this.cnt.field).to({x: 0, y: this.hudHeight}, 1000)
      .easing(TWEEN.Easing.Back.Out).onComplete(() => {
        this.finishContraction();
      })
      .start();
  }

  finishContraction() {
    this.removeBlock();
    this.findEmptyCells();
    this.currentBonus = null;
    this.doBonus();
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
            cell.ball.appear(counter*50, () => {if (cell.ball) {cell.ball.dribble()}});
            counter++;
          }
        }
      }
      if (counter === 0) {
        this.currentBonus = null;
        this.doBonus();
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
    this.HUD.turnOffColorWaveTimer();
    this.colorWaveTimer = null;
    this.colorWaveIdx = null;
    this.isColorWaveModeOn = false;
    let color = this.possibleBallColors[colorIdx];
    for (let row of this.field) {
      for (let cell of row) {
        if (cell.ball && cell.ball.getType() === colorWave &&
          cell.ball.colorIdx === colorIdx && !cell.ball.isVanishing) {
          cell.ball.removeFromScene();
          cell.setBall(new RegularBall(cell.x, cell.y, colorIdx, color, this.cellWidth, this.cellHeight, this));
          cell.ball.appear();
        }
      }
    }
    this.currentBonus = null;
    this.doBonus();
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
        cell1.ball.setDisabled(true);
        balls.push(cell1);
      }
      if (cell2.ball) {
        cell2.ball.setDisabled(true);
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
    for (let ball of this.nextBalls) {
      if (ball.y === 0 || ball.y === this.fieldHeight - 1 || ball.x === 0 || ball.x === this.fieldWidth - 1) {
        let newCell = this.initRandomCell(this.findEmptyCells((cell) => {
          for (let otherBall of this.nextBalls) {
            if (otherBall.x === cell.x && otherBall.y === cell.y) {
              return false;
            }
          }
          return cell.x !== 0 && cell.x !== this.fieldWidth - 1 && cell.y !== 0 && cell.y !== this.fieldHeight - 1;
        }));
        if (!newCell) {
          for (let previewedBall of this.nextBalls) {
            previewedBall.hidePreview();
          }
          this.nextBalls = [];
          break;
        }
        ball.x = newCell.x;
        ball.y = newCell.y;
        ball.reinit();
      }
    }
    if (balls.length > 0) {
      this.removeBalls(balls, (_cell, isLast) => {
        if (isLast) {
          this.contractField();
        }
      });
    } else {
      this.contractField();
    }
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
      for (let ball of this.nextBalls) {
        ball.x--;
        ball.y--;
        ball.cellWidth = this.cellWidth;
        ball.cellHeight = this.cellHeight;
        ball.reinit();
      }
      this.contractAnimation();
    } else {
      this.finishContraction();
    }
  }

  superBombRemoveBalls (x, y) {
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
    this.removeBalls(balls, (cell, isLast) => {
      if (isLast) {
        this.currentBonus = null;
        this.doBonus();
        for (let ball of this.nextBalls) {
          ball.hidePreview();
        }
        this.nextBalls = [];
        this.generateBalls(true);
        this.generateBalls(false);
      }
    }, 'superBomb');
    this.animateScoreOnRemove(x, y, balls.length);
  }

  addToBonusQueue(ball) {
    if (ball instanceof ExpansionBall) {
      this.bonusQueue.push(ball);
    }
    if (ball instanceof ContractionBall) {
      this.bonusQueue.splice(0, 0, ball);
    }
    if (ball instanceof SuperBomb) {
      this.bonusQueue.push(ball);
    }
    if (ball instanceof ColorWave) {
      this.bonusQueue.splice(0, 0, ball);
    }
  }

  vanishCallBack(cell, isLast) {
    if (cell.ball && !cell.ball.isDisabled) {
      if (cell.ball instanceof ExpansionBall) {
        this.addToBonusQueue(cell.ball);
      }
      if (cell.ball instanceof ContractionBall) {
        this.addToBonusQueue(cell.ball);
      }
      if (cell.ball instanceof SuperBomb) {
        this.addToBonusQueue(cell.ball);
      }
      if (cell.ball instanceof ColorWave) {
        if (!this.isColorWaveModeOn) {
          this.addToBonusQueue(cell.ball);
        } else {
          this.colorWaveMode(cell.ball.colorIdx);
        }
      }
    }
    cell.ball = null;
    cell.handleSelect(false);
    if (isLast) {
      this.doBonus();
      this.levelUpIfNeeded();
      this.removeBlock();
    }
  }

  doBonus () {
    if (!this.isGameOver && !this.currentBonus && this.bonusQueue.length !== 0) {
      let bonusBall = this.bonusQueue.shift();
      this.currentBonus = bonusBall;
      if (bonusBall instanceof ExpansionBall) {
        this.expandAnimation();
      }
      if (bonusBall instanceof ContractionBall) {
        this.contractRemoveBalls();
      }
      if (bonusBall instanceof SuperBomb) {
        this.superBombRemoveBalls(bonusBall.x, bonusBall.y);
      }
      if (bonusBall instanceof ColorWave) {
        this.colorWaveMode(bonusBall.colorIdx);
      }
    }
  }

  isLineComplete (array) {
    return array.length>=this.inARowToVanish;
  }

  removeBalls (cellArray, onComplete, animationType = 'normal') {
    let score = 0;
    let secondMultiplier = 1;
    if (cellArray.length >= this.inARowToVanish + 1) {
      this.possibleBallTypes.push(rainbow);
    }
    for (let index in cellArray) {
      let cell = cellArray[index];
      score += cell.ball.getScore();
      this.addBlockedCell(cell);
      if (cell.ball.getType() === x3Ball) {
        secondMultiplier *= 3;
      }
      let isLast = parseInt(index) === cellArray.length - 1;
      this.incrementRemovedBalls();
      switch (animationType) {
        case "glow":
          cell.ball.glow(() => {
            cell.ball.vanish(() => {
              this.removeBlockedCell(cell);
              if (onComplete) {
                cell.ball = null;
                cell.handleSelect(false);
                onComplete(cell, isLast)
              } else {
                this.vanishCallBack(cell, isLast);
              }
            }, index * 100);
          });
          break;

        case "superBomb":
          cell.ball.superBombVanish(() => {
            this.removeBlockedCell(cell);
            if (onComplete) {
              cell.ball = null;
              cell.handleSelect(false);
              onComplete(cell, isLast)
            } else {
              this.vanishCallBack(cell, isLast);
            }
          }, index * 15);
          break;

        default:
          cell.ball.vanish(() => {
            this.removeBlockedCell(cell);
            if (onComplete) {
              cell.ball = null;
              cell.handleSelect(false);
              onComplete(cell, isLast)
            } else {
              this.vanishCallBack(cell, isLast);
            }
          }, index * 100);
          break;
      }
    }
    this.changeScore(this.multiplier, score, secondMultiplier);
  }

  getTween () {
    return TWEEN;
  }

  incrementRemovedBalls() {
    this.ballsRemoved ++;
    if (this.ballsRemoved%29 === 0) {
      this.forcedBallTypes.push(colorWave);
    }
  }

  createNewBallsArray (empty) {
    let newBallsArray = [];
    for (let idx = 0; idx < this.ballsPerTime; idx++) {
      let element = this.initRandomCell(empty);
      if (element !== null) {
        let ball = this.createBall(element.x, element.y);
        newBallsArray.push(ball);
      }
    }
    return newBallsArray;
  }

  generateBalls (areBallsReal = true) {
    let empty = this.findEmptyCells((cell) => {
      for (let ball of this.nextBalls) {
        if (cell.x === ball.x && cell.y === ball.y) {
          return false;
        }
      }
      return true;
    });
    
    let newBalls = [];

    if (areBallsReal) {
      if (this.nextBalls.length === 0) {
        newBalls = this.createNewBallsArray(empty);
        for (let ball of newBalls) {
          let element = this.field[ball.y][ball.x];
          this.addBallToField(element, ball);
          this.addBlockedCell(element);
        }
        //adding balls to field.

      } else {
        newBalls = this.nextBalls;
        for (let ball of this.nextBalls) {
          ball.hidePreview();
          let cell = this.field[ball.y][ball.x];
          if (cell.ball) {
            cell = this.initRandomCell(empty);
            if (cell === null) {
              this.delay = 0;
              return false;
            }
          }
          this.addBallToField(cell, ball);
          this.addBlockedCell(cell);
        }
      }

      if (empty.length === 0) {
        this.delay = 0;
        return false;
      } else {

        if (empty.length <= 0.33 * this.fieldHeight * this.fieldWidth && !this.checkForSuperBombs()) {
          this.forcedBallTypes.push(superBomb);
        }
        let cells = [];
        for (let ball of newBalls) {
          let cell = this.field[ball.y][ball.x];
          cells.push(cell);
        }
        this.checkBalls(cells);
        this.delay = 0;
        return true;
      }
    } else {

      newBalls = this.createNewBallsArray(empty);
      this.nextBalls = newBalls;
      for (let ball of newBalls) {
        ball.showPreview();
      }
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
        return new RainbowBall(x, y, this.cellHeight, this.cellWidth, this);
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
        return new SuperBomb(x, y, this.cellWidth, this.cellHeight, this);
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
      default: {
        let colorIdx = this.getRandomColorIdx();
        let color = this.possibleBallColors[colorIdx];
        return new RegularBall(x, y, colorIdx, color, this.cellWidth, this.cellHeight, this);
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

  createHUD () {
    this.HUD = new HUD(this);
  }
}
