import {Ball} from "./ball";
import * as PIXI from "pixi.js";

export const superBomb = 'superBomb';

export class SuperBomb extends Ball {

  constructor(x, y, cellHeight, cellWidth, game) {
    super(x, y, cellWidth, cellHeight, game);
    this.sprite = new PIXI.Sprite(this.game.tex.ballOverlay.superBomb);
    this.ballCont.addChild(this.sprite);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(this.cellWidth / this.sprite.width * Ball.defaultScaleMultiplier);
    for (let idx in this.game.possibleBallColors) {
      this.colors.add(parseInt(idx));
    }
  }

  getScore() {
    return 10;
  }

  reinit() {
    super.reinit();
    this.sprite.scale.set(this.cellWidth / (this.sprite.width / this.sprite.scale.x) * Ball.defaultScaleMultiplier);
  }

  getType() {
    return superBomb;
  }

}
