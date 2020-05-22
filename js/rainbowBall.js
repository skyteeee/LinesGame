import {Ball} from "./ball";
import {Color} from "./color";
import * as PIXI from "pixi.js";

export const rainbow = 'rainbow';

export class RainbowBall extends Ball {
  constructor(x, y, cellHeight, cellWidth, game) {
    super(x, y, cellWidth, cellHeight, game);
    this.sprite = new PIXI.Sprite(this.game.tex.ballOverlay.rainbow);
    this.ballCont.addChild(this.sprite);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(this.cellWidth / this.sprite.width * Ball.defaultScaleMultiplier);
    for (let idx in this.game.possibleBallColors) {
      this.colors.add(parseInt(idx));
    }
  }

  reinit() {
    super.reinit();
    this.sprite.scale.set(this.cellWidth / (this.sprite.width / this.sprite.scale.x) * Ball.defaultScaleMultiplier);
  }

  getScore() {
    if (this.game.mode === 'easy') {
      return 20;
    } else {
      return 25;
    }
  }

  getType() {
    return rainbow;
  }
}
