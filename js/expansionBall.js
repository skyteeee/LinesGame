import {RegularBall} from "./regularBall";
import * as PIXI from "pixi.js";
import {Ball} from "./ball";

export const expansionBall = 'expansion';

export class ExpansionBall extends RegularBall {
  constructor(x, y, colorIdx, color, cellWidth, cellHeight, game) {
    super(x, y, colorIdx, color, cellWidth, cellHeight, game);
    this.opacity = 1;
    this.overlaySprite = new PIXI.Sprite(this.game.tex.ballOverlay.expand);
    this.overlaySprite.anchor.set(0.5);
    this.overlaySprite.scale.set(this.cellWidth / this.overlaySprite.width * Ball.defaultScaleMultiplier);
    this.ballCont.addChild(this.overlaySprite);
  }

  reinit() {
    super.reinit();
    this.overlaySprite.scale.set(this.cellWidth / (this.overlaySprite.width / this.overlaySprite.scale.x) * Ball.defaultScaleMultiplier);
  }

  getType() {
    return expansionBall;
  }
}
