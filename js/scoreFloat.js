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

  draw () {
    this.game.ctx.save();
    this.game.ctx.translate(this.px, this.py);
    this.game.ctx.fillStyle = `rgba(14,109,0, ${this.opacity})`;
    this.game.ctx.strokeStyle = `rgba(255,255,255, ${this.opacity})`;
    this.game.ctx.strokeWidth = 1;
    this.game.ctx.font = 'bold 32px MainFont';
    this.game.ctx.textAlign = 'center';
    this.game.ctx.fillText(`${this.score}`, 0, 0);
    this.game.ctx.strokeText(`${this.score}`, 0, 0);
    this.game.ctx.restore();
  }
}
