import {Ball} from "./ball";
import * as PIXI from 'pixi.js';

export const doubleBall = 'double';

export class DoubleBall extends Ball{
  constructor(x, y, cellWidth, cellHeight, colorIdx1, colorIdx2, possibleColors, game) {
    super(x,y,cellWidth, cellHeight, game);
    let fakeColor1 = possibleColors[colorIdx1];
    let fakeColor2 = possibleColors[colorIdx2];
    this.color1 = fakeColor1.clone();
    this.color2 = fakeColor2.clone();
    this.topSprite = new PIXI.Sprite(this.game.tex.double.top[colorIdx1]);
    this.bottomSprite = new PIXI.Sprite(this.game.tex.double.bottom[colorIdx2]);
    this.topSprite.anchor.set(0.5);
    this.bottomSprite.anchor.set(0.5);
    this.topSprite.scale.set(this.cellWidth / this.topSprite.width * Ball.defaultScaleMultiplier);
    this.bottomSprite.scale.set(this.cellWidth / this.bottomSprite.width * Ball.defaultScaleMultiplier);
    this.ballCont.addChild(this.topSprite);
    this.ballCont.addChild(this.bottomSprite);
    this.colors.add(colorIdx1);
    this.colors.add(colorIdx2);
  }

  reinit() {
    super.reinit();
    this.topSprite.scale.set(this.cellWidth / (this.topSprite.width / this.topSprite.scale.x) * Ball.defaultScaleMultiplier);
    this.bottomSprite.scale.set(this.cellWidth / (this.bottomSprite.width / this.bottomSprite.scale.x) * Ball.defaultScaleMultiplier);
  }

  getScore() {
    return 10;
  }

  getType() {
    return doubleBall;
  }

  drawBall() {
    super.drawBall();
    let x = -this.game.cellWidth2;
    let y = -this.game.cellHeight2;
    let xy0 = Math.floor(this.cellHeight * 0.15);
    let xy1 = Math.floor(this.cellHeight * 0.16);
    let radius = Math.floor(this.cellWidth * 0.3125);
    let gradient = this.game.ctx.createRadialGradient(-xy0, -xy0, 0, 0, 0, radius);
    let gradient2 = this.game.ctx.createRadialGradient(xy1, xy1, 0, 0, 0, radius);
    let rainbowGradient = this.game.ctx.createLinearGradient(radius, radius, -radius, -radius);

    gradient.addColorStop(0, 'white');
    gradient2.addColorStop(0, 'rgba(255,255,255,0.7)');
    gradient.addColorStop(0.8, 'rgba(255,255,255,0)');
    gradient2.addColorStop(0.7, 'rgba(255,255,255,0)');

    rainbowGradient.addColorStop(0, this.color1.iRequestNormalColor());
    rainbowGradient.addColorStop(0.49, this.color1.iRequestNormalColor());
    rainbowGradient.addColorStop(0.51, this.color2.iRequestNormalColor());
    rainbowGradient.addColorStop(1, this.color2.iRequestNormalColor());

    rainbowGradient.addColorStop(1, 'transparent');
    gradient.addColorStop(1, 'transparent');
    gradient2.addColorStop(1, 'transparent');

    this.game.ctx.fillStyle = rainbowGradient;
    this.game.ctx.beginPath();
    this.game.ctx.arc(0.5, 0.5, radius, 0, Math.PI*2);
    this.game.ctx.fill();
    this.game.ctx.strokeStyle = 'rgba(68,68,68,0.5)';
    this.game.ctx.strokeWidth = 1;
    this.game.ctx.stroke();
    this.game.ctx.fillStyle = gradient;
    this.game.ctx.fillRect(x, y, this.game.cellWidth, this.game.cellHeight);
  }
}
