import TWEEN from "@tweenjs/tween.js";
import {xy2screen} from "./tools";

export class Ball {
  constructor(x, y, cellWidth, cellHeight, game) {
    this.px = 0;
    this.py = 0;
    this.game = game;
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

  drawBall () {
    this.game.ctx.translate (this.px, this.py);
    this.game.ctx.scale(this.scaleX, this.scaleY);
    this.game.ctx.rotate(this.angle);
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

  selected () {
    let goDown = new TWEEN.Tween(this).to({py: 0, scaleY:1, scaleX:1}, 300)
      .easing(TWEEN.Easing.Quadratic.In);
    let squeeze = new TWEEN.Tween(this).to({scaleX: 1.25, scaleY:0.75, py:this.game.cellHeight/8}, 300)
      .easing(TWEEN.Easing.Quadratic.Out);
    let unsqueeze = new TWEEN.Tween(this).to({scaleX: 1, scaleY:1, py: 0}, 200)
      .easing(TWEEN.Easing.Quadratic.In);

    this.selectedTween = new TWEEN.Tween(this)
      .to({py: -this.game.cellHeight/4, scaleY: 1.05, scaleX: 0.95}, 500)
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
