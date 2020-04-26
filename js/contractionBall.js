import {RegularBall} from "./regularBall";
import * as PIXI from "pixi.js";
import {Ball} from "./ball";

export const contractionBall = 'contraction';

export class ContractionBall extends RegularBall {
  constructor(x, y, colorIdx, color, cellWidth, cellHeight, game) {
    super(x, y, colorIdx, color, cellWidth, cellHeight, game);
    this.opacity = 1;
    this.overlaySprite = new PIXI.Sprite(this.game.tex.ballOverlay.contract);
    this.overlaySprite.anchor.set(0.5);
    this.overlaySprite.scale.set(this.cellWidth / this.sprite.width * Ball.defaultScaleMultiplier / 1.75);
    this.ballCont.addChild(this.overlaySprite);
  }

  reinit() {
    super.reinit();
    this.overlaySprite.scale.set(this.cellWidth / (this.overlaySprite.width / this.overlaySprite.scale.x) * Ball.defaultScaleMultiplier / 1.75);
  }

  drawBall() {
    super.drawBall();
    let radius = Math.floor(this.cellWidth*0.3125);
    this.game.ctx.strokeStyle = 'black';
    this.game.ctx.save();
    this.game.ctx.lineWidth = 3;
    this.game.ctx.rotate(Math.PI/180*45);
    this.game.ctx.beginPath();
    this.game.ctx.moveTo(0,this.cellHeight*0.025);
    this.game.ctx.lineTo(0, Math.floor(radius-this.cellHeight*0.075));
    this.game.ctx.lineTo(this.cellWidth*0.05, this.cellHeight*0.1);
    this.game.ctx.moveTo(0, Math.floor(radius-this.cellHeight*0.075));
    this.game.ctx.lineTo(-this.cellWidth*0.05, this.cellHeight*0.1);

    this.game.ctx.moveTo(0, -this.cellHeight*0.025);
    this.game.ctx.lineTo(0, -Math.floor(radius-this.cellHeight*0.075));
    this.game.ctx.lineTo(this.cellWidth*0.05, -this.cellHeight*0.1);
    this.game.ctx.moveTo(0, -Math.floor(radius-this.cellHeight*0.075));
    this.game.ctx.lineTo(-this.cellWidth*0.05, -this.cellHeight*0.1);
    this.game.ctx.stroke();
    this.game.ctx.restore();
  }
  getType() {
    return contractionBall;
  }
}
