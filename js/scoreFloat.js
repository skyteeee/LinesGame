import * as PIXI from 'pixi.js';
import TWEEN from "@tweenjs/tween.js";

export class ScoreFloat {
  constructor(score, px, py, game) {
    this.score = score;
    this.px = px;
    this.py = py;
    this.game = game;
    this.opacity = 1;
    this.text = new PIXI.BitmapText(`${score}`,
      {font: `${this.game.cellHeight*0.5}px MainFont`, tint: 0x0e6d00});
    this.text.x = px-this.text.textWidth/2;
    this.text.y = py-this.text.textHeight/2;
    this.text.zIndex = 1234567;
    this.game.cnt.game.addChild(this.text);
  }

  animate () {
    let animation = new TWEEN.Tween(this.text).to({y:0, x:this.game.cellWidth, alpha:0}, 500)
      .easing(TWEEN.Easing.Quadratic.In)
      .onComplete(()=>{this.game.cnt.game.removeChild(this.text)}).start();
  }
}
