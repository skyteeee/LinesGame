import TWEEN from "@tweenjs/tween.js";

export class ColorWaveTimer {
  constructor(timeMS, game) {
    this.timeLeft = timeMS;
    this.game = game;
    this. animationTime = timeMS;
  }
  draw() {
    let fontSize = this.game.hudHeight*0.56;
    this.game.ctx.save();
    this.game.ctx.clearRect(0, 0, this.game.width, this.game.hudHeight);
    this.game.ctx.translate(this.game.width*0.5, this.game.hudHeight*0.25);
    this.game.ctx.fillStyle = 'rgb(98,98,98)';
    this.game.ctx.textAlign = 'center';
    this.game.ctx.textBaseline = 'hanging';
    this.game.ctx.font = `bold ${fontSize}px MainFont`;
    this.game.ctx.fillText(`${Math.ceil(this.timeLeft/100)/10}`, 0, 0);
    this.game.ctx.restore();
  }

  animate (callBack) {
    let animation = new TWEEN.Tween(this).to({timeLeft:0}, this.animationTime).onComplete(callBack).start();
  }
}
