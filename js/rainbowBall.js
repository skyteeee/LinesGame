import {Ball} from "./ball";
import {Color} from "./color";
import * as PIXI from "pixi.js";

export const rainbow = 'rainbow';

export class RainbowBall extends Ball {
  constructor(x, y, cellHeight, cellWidth, possibleColors, game) {
    super(x, y, cellWidth, cellHeight, game);
    this.actualColors = [];
    for (let idx in possibleColors) {
      let color = possibleColors[idx];
      this.colors.add(parseInt(idx));
      this.sprite = new PIXI.Sprite(this.game.tex.ballOverlay.rainbow);
      this.ballCont.addChild(this.sprite);
      this.sprite.anchor.set(0.5);
      this.sprite.scale.set(this.cellWidth / this.sprite.width * Ball.defaultScaleMultiplier);
      this.actualColors.push(new Color(color.red, color.green, color.blue));
    }
  }

  reinit() {
    super.reinit();
    this.sprite.scale.set(this.cellWidth / (this.sprite.width / this.sprite.scale.x) * Ball.defaultScaleMultiplier);
  }

  getScore() {
    return 25;
  }

  getType() {
    return rainbow;
  }
}
