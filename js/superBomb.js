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

  drawBall() {
    let x = -this.game.cellWidth2;
    let y = -this.game.cellHeight2;
    let xy0 = Math.floor(this.cellHeight*0.15);
    let radius = Math.floor(this.cellHeight*0.3125);
    this.game.ctx.translate (this.px, this.py);
    this.game.ctx.scale(this.scaleX, this.scaleY);

    let ballGradient = this.game.ctx.createRadialGradient(-xy0, -xy0, 0, 0, 0, radius);

    ballGradient.addColorStop(0, 'white');
    ballGradient.addColorStop(0.7, 'black');
    ballGradient.addColorStop(0.9, 'black');
    ballGradient.addColorStop(1, 'transparent');

    this.game.ctx.fillStyle = ballGradient;
    this.game.ctx.fillRect(x, y, this.cellWidth, this.cellHeight);

    this.game.ctx.font = `bold ${radius*0.5}px SmallPixel`;
    this.game.ctx.fillStyle = 'red';
    this.game.ctx.textAlign = 'center';
    this.game.ctx.textBaseline = 'middle';
    this.game.ctx.strokeStyle = 'white';
    this.game.ctx.strokeWidth = 1;

    this.game.ctx.fillText('-25%',0, 0);
  }

  getType() {
    return superBomb;
  }

}
