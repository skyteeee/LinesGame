import {RegularBall} from "./regularBall";
import TWEEN from "@tweenjs/tween.js";

export const x3Ball = 'x3';

export class X3Ball extends RegularBall {
  constructor(x, y, colorIdx, color, cellWidth, cellHeight, game) {
    super(x, y, colorIdx, color, cellWidth, cellHeight, game);
    this.opacity = 1;
  }

  getType() {
    return x3Ball;
  }

  drawBall() {
    super.drawBall();
    let radius = Math.floor(this.cellHeight * 0.3125);
    this.game.ctx.font = `bold ${radius * 0.55}px SmallPixel`;
    this.game.ctx.textAlign = 'center';
    this.game.ctx.textBaseline = 'middle';
    this.game.ctx.fillStyle = `rgba(0,0,0,${this.opacity})`;
    this.game.ctx.fillText('x3', 0, 0);
  }

  vanish(onComplete, delay = 0) {
    super.vanish(onComplete, delay);
    let textVanish = new TWEEN.Tween(this).to({opacity:0}, 300).easing(TWEEN.Easing.Quadratic.In)
      .delay(delay).start();
  }
}
