import {Ball} from "./ball";
import TWEEN from "@tweenjs/tween.js";
import * as PIXI from 'pixi.js';

export const regular = 'regular';

export class RegularBall extends Ball {
  constructor(x, y, colorIdx, color, cellWidth, cellHeight, game) {
    super(x,y,cellWidth, cellHeight, game);
    this.colors.add(colorIdx);
    this.color = color.clone();
    this.colorIdx = colorIdx;
    this.sprite = new PIXI.Sprite(this.game.tex.ballImg[colorIdx]);
    this.ballCont.addChild(this.sprite);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(this.cellWidth / this.sprite.width * Ball.defaultScaleMultiplier);
  }

  getScore() {
    return 5;
  }

  reinit() {
    super.reinit();
    this.sprite.scale.set(this.cellWidth / (this.sprite.width / this.sprite.scale.x) * Ball.defaultScaleMultiplier);
  }

  getType() {
    return regular;
  }

  vanish (onComplete,delay = 0) {
    super.vanish(onComplete, delay);
    let alphaChange = new TWEEN.Tween(this.sprite).to({alpha:0},300).easing(TWEEN.Easing.Quadratic.In)
      .delay(delay).start();
  }
}
