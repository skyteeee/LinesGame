import {Ball} from "./ball";
import * as PIXI from "pixi.js";
import {Color} from "./color";

export const superBomb = 'superBomb';

export class SuperBomb extends Ball {

  constructor(x, y, cellHeight, cellWidth, possibleColors, game) {
    super(x, y, cellWidth, cellHeight, game);
    this.actualColors = [];
    for (let idx in possibleColors) {
      let color = possibleColors[idx];
      this.colors.add(parseInt(idx));
      this.sprite = new PIXI.Sprite(this.game.tex.ballOverlay.superBomb);
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

  getType() {
    return superBomb;
  }

}
