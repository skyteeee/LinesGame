import TWEEN from "@tweenjs/tween.js";

export class ScoreFloat {
  constructor(score, px, py, game) {
    this.score = score;
    this.px = px;
    this.py = py;
    this.game = game;
    this.opacity = 1;
  }

  animate () {
    this.game.addOverallObject(this);
    let animation = new TWEEN.Tween(this).to({py:this.py-3*this.game.cellHeight, opacity:0}, 500)
      .easing(TWEEN.Easing.Quadratic.In).onComplete(()=>{this.game.removeOverallObject(this)}).start();

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
