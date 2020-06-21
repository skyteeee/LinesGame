import TWEEN from "@tweenjs/tween.js";
import * as PIXI from 'pixi.js';
import {xy2screen} from "./tools";
import {GlowFilter} from '@pixi/filter-glow';


export class Ball {

  static defaultScaleMultiplier = 0.625;
  static outerGlowFilter = null;
  static innerGlowFilter = null;

  static initFilters (cellWidth) {
    Ball.outerGlowFilter = new GlowFilter({
      innerStrength: 0,
      outerStrength:0,
      distance: cellWidth*0.1,
      color: 0xff0000
    });
    Ball.innerGlowFilter = new GlowFilter({
      innerStrength: 0,
      outerStrength: 0,
      distance: cellWidth*0.075
    });
  }

  constructor(x, y, cellWidth, cellHeight, game) {
    this.px = 0;
    this.py = 0;
    this.game = game;
    this.curentAnimations = [];
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
    this.ballCont = new PIXI.Container();
    let pxy = xy2screen(x, y, this);
    this.ballCont.x = pxy.pX;
    this.ballCont.y = pxy.pY;
    this.ballCont.width = this.cellWidth;
    this.ballCont.height = this.cellHeight;
    this.isInPreviewMode = false;
    this.previewSprite = null;
  }

  setDisabled(state) {
    this.isDisabled = state;
  }

  getScore () {
    return 5;
  }

  getType () {
    return 'ball';
  }

  reinit () {
    let p = xy2screen(this.x, this.y, this);
    this.ballCont.x = p.pX;
    this.ballCont.y = p.pY;
  }

  superBombVanish (onComplete,delay = 0) {
    this.isVanishing = true;
    this.ballCont.zIndex = 101;
    let xWay = this.cellWidth*0.05;
    let randomDirection = Math.round(Math.random());
    if (randomDirection === 1) {
      xWay *= -1;
    }
    let originalP = {x: this.ballCont.x, y: this.ballCont.y};
    let rescale = new TWEEN.Tween(this.ballCont.scale).to({x: 0, y: 0}, 300).easing(TWEEN.Easing.Quadratic.In)
      .onComplete(() => {
        this.ballCont.zIndex = 0;
        if (onComplete) {
          onComplete();
        }
        this.removeFromScene();
      });
    let shiver = new TWEEN.Tween(this.ballCont).to({x: originalP.x + xWay}, 50)
      .onComplete(() => {
        this.ballCont.x = originalP.x;
        rescale.start();
      })
      .repeat(10).yoyo(true)
      .delay(delay).repeatDelay(0).easing(TWEEN.Easing.Back.In).start();

  }

  vanish (onComplete,delay = 0) {
    this.isVanishing = true;
    this.ballCont.zIndex = 101;
    let rescale = new TWEEN.Tween(this.ballCont.scale).to({x: 5, y: 5}, 300).easing(TWEEN.Easing.Quadratic.In)
      .delay(delay).onComplete(() => {
        this.ballCont.zIndex = 0;
        if (onComplete) {
          onComplete();
        }
        this.removeFromScene();
        }).start();
  }

  hoover (oldx, oldy, onComplete) {
    let oldP = xy2screen(oldx, oldy, this);
    let p = xy2screen(this.x, this.y, this);

    this.ballCont.x = oldP.pX;
    this.ballCont.y = oldP.pY;
    this.ballCont.zIndex = 100;

    let scaling = new TWEEN.Tween(this.ballCont.scale).to({x:1.5, y:1.5}, 250)
      .easing(TWEEN.Easing.Quadratic.Out)
      .chain(new TWEEN.Tween(this.ballCont.scale).to({x:1, y:1}, 250)
        .easing(TWEEN.Easing.Quadratic.In)).start();
    let animation = new TWEEN.Tween(this.ballCont).to({x:p.pX, y:p.pY}, 500).easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete(() => {
        this.ballCont.zIndex = 0;
        if (onComplete) {
          onComplete();
        }
      })
      .start();

  }

  glow (callback) {
    this.ballCont.filters = [Ball.innerGlowFilter, Ball.outerGlowFilter];
    let fadeIn = new TWEEN.Tween(Ball.innerGlowFilter).to({innerStrength: this.cellWidth*0.0075, outerStrength: this.cellWidth*0.075}, 300)
      .yoyo(true).repeat(3).onComplete(() => {
        this.ballCont.filters = [];
        if (callback) {
          callback();
        }
      }).start();
    let outerGlow = new TWEEN.Tween(Ball.outerGlowFilter).to({outerStrength: this.cellWidth*0.025}, 300)
      .yoyo(true).repeat(3).onComplete(() => {
        this.ballCont.filters = [];
      }).start();
  }

  appear (delay= 0, callback) {
    if (!this.isInPreviewMode) {
    this.ballCont.scale.set(0);
    } else {
      this.ballCont.scale.set(0.3);
    }
    this.game.cnt.game.addChild(this.ballCont);
    let animation = new TWEEN.Tween(this.ballCont.scale).to({x:1, y:1}, 400)
      .easing(TWEEN.Easing.Quadratic.In).delay(delay);
    if (callback) {
      animation.onComplete(callback)
    }
    animation.start();
  }

  selected () {
    let scale = {py: xy2screen(this.x, this.y, this).pY, scaleY:1, scaleX:1};
    let goDown = new TWEEN.Tween(scale).to({py: scale.py, scaleY:1, scaleX:1}, 300)
      .easing(TWEEN.Easing.Quadratic.In)
        .onUpdate((obj) => {
        this.ballCont.y = obj.py;
        this.ballCont.scale.set(obj.scaleX, obj.scaleY);
      });
    let squeeze = new TWEEN.Tween(scale).to({scaleX: 1.25, scaleY:0.75, py:scale.py + this.game.cellHeight/8}, 300)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate((obj) => {
        this.ballCont.y = obj.py;
        this.ballCont.scale.set(obj.scaleX, obj.scaleY);
      });
    let unsqueeze = new TWEEN.Tween(scale).to({scaleX: 1, scaleY:1, py: scale.py}, 200)
      .easing(TWEEN.Easing.Quadratic.In)
      .onUpdate((obj) => {
        this.ballCont.y = obj.py;
        this.ballCont.scale.set(obj.scaleX, obj.scaleY);
      });

    let selectedStart = new TWEEN.Tween(scale)
      .to({py: scale.py-this.game.cellHeight/4, scaleY: 1.05, scaleX: 0.95}, 500)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate((obj) => {
        this.ballCont.y = obj.py;
        this.ballCont.scale.set(obj.scaleX, obj.scaleY);
      })
      .chain(goDown);
    goDown.chain(squeeze);
    squeeze.chain(unsqueeze);
    unsqueeze.chain(selectedStart);
    selectedStart.start();
    this.curentAnimations.push(...[selectedStart, goDown, squeeze, unsqueeze])
  }

  deselect () {
    for (let animation of this.curentAnimations) {
      animation.stop();
    }
    this.curentAnimations = [];
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
    this.reset();
  }

  reset () {
    let pCoord = xy2screen(this.x, this.y, this);
    this.ballCont.y = pCoord.pY;
    this.ballCont.x = pCoord.pX;
    this.ballCont.scale.set(1);
    this.ballCont.angle = 0;
  }

  removeFromScene () {
    this.game.addDelayed(this.ballCont, true);
    if (this.y < this.game.fieldHeight && this.x < this.game.fieldWidth
      && this.game.field[this.y][this.x].ball === this) {
      this.game.field[this.y][this.x].ball = null;
    }
  }

  showPreview () {
    this.isInPreviewMode = true;
    this.ballCont.scale.set(0);
    this.game.cnt.game.addChild(this.ballCont);
    let appearTween = new TWEEN.Tween(this.ballCont.scale).to({x:0.3, y:0.3}, 400).start();
  }

  hidePreview () {
    this.game.cnt.game.removeChild(this.ballCont);
  }

}
