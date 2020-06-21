import * as PIXI from 'pixi.js';
import TWEEN from "@tweenjs/tween.js";
import {Ball} from "./ball";
import {xy2screen} from "./tools";

export class AccessDENIED {
  constructor (x, y, game) {
    this.x = x;
    this.y = y;
    this.game = game;
    this.sprite = new PIXI.Sprite(this.game.tex.ballOverlay.denied);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(this.game.cellWidth / this.sprite.width * Ball.defaultScaleMultiplier);
  }

  appear () {
    let pixel = xy2screen(this.x, this.y, this.game);
    this.sprite.x = pixel.pX;
    this.sprite.y = pixel.pY;
    this.game.cnt.game.addChild(this.sprite);
    this.fade();
  }

  fade () {
    let tween = new TWEEN.Tween(this.sprite).to({alpha: 0}, 400).onComplete(() => {
      this.sprite.destroy();
    }).delay(100).start();
  }

}
