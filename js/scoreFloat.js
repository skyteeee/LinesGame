import TWEEN from "@tweenjs/tween.js";

export class ScoreFloat {
  constructor(score, px, py) {
    this.score = score;
    this.px = px;
    this.py = py;
    this.opacity = 1;
  }

  animate (game) {
    game.addOverallObject(this);
    let animation = new TWEEN.Tween(this).to({py:this.py-3*game.cellHeight, opacity:0}, 500)
      .easing(TWEEN.Easing.Quadratic.In).onComplete(()=>{game.removeOverallObject(this)}).start();

  }

  draw (game) {
    game.ctx.save();
    game.ctx.translate(this.px, this.py);
    game.ctx.fillStyle = `rgba(14,109,0, ${this.opacity})`;
    game.ctx.strokeStyle = `rgba(255,255,255, ${this.opacity})`;
    game.ctx.strokeWidth = 1;
    game.ctx.font = 'bold 32px MainFont';
    game.ctx.textAlign = 'center';
    game.ctx.fillText(`${this.score}`, 0, 0);
    game.ctx.strokeText(`${this.score}`, 0, 0);
    game.ctx.restore();
  }
}
