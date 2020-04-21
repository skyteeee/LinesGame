import {RegularBall} from "./regularBall";
import {Ball} from "./ball";
import TWEEN from "@tweenjs/tween.js";
import * as PIXI from 'pixi.js';

export const x3Ball = 'x3';

export class X3Ball extends RegularBall {
  constructor(x, y, colorIdx, color, cellWidth, cellHeight, game) {
    super(x, y, colorIdx, color, cellWidth, cellHeight, game);
    this.opacity = 1;
    this.overlaySprite = new PIXI.Sprite(this.game.tex.ballOverlay.x3);
    this.overlaySprite.anchor.set(0.5);
    this.overlaySprite.scale.set(this.cellWidth / this.sprite.width * Ball.defaultScaleMultiplier / 1.5);
    this.ballCont.addChild(this.overlaySprite);
  }

  getType() {
    return x3Ball;
  }

  drawBall() {
    super.drawBall();
    let radius = Math.floor(this.cellHeight * 0.3125);

  }

  vanish(onComplete, delay = 0) {
    super.vanish(onComplete, delay);
    let textVanish = new TWEEN.Tween(this).to({opacity:0}, 300).easing(TWEEN.Easing.Quadratic.In)
      .delay(delay).start();
  }
}
