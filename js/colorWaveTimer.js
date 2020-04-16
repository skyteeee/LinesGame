import TWEEN from "@tweenjs/tween.js";

export class ColorWaveTimer {
  constructor(timeMS) {
    this.timeLeft = timeMS;
    this. animationTime = timeMS;
  }
  draw(game) {
    let fontSize = game.hudHeight*0.56;
    game.ctx.save();
    game.ctx.clearRect(0, 0, game.width, game.hudHeight);
    game.ctx.translate(game.width*0.5, game.hudHeight*0.25);
    game.ctx.fillStyle = 'rgb(98,98,98)';
    game.ctx.textAlign = 'center';
    game.ctx.textBaseline = 'hanging';
    game.ctx.font = `bold ${fontSize}px MainFont`;
    game.ctx.fillText(`${Math.ceil(this.timeLeft/100)/10}`, 0, 0);
    game.ctx.restore();
  }

  animate (callBack) {
    let animation = new TWEEN.Tween(this).to({timeLeft:0}, this.animationTime).onComplete(callBack).start();
  }
}
