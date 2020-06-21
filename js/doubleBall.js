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
    if (this.game.mode === 'easy') {
      return 7;
    } else {
      return 10;
    }
  }

  getType() {
    return doubleBall;
  }

}
