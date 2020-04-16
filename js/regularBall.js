import {Ball} from "./ball";
import TWEEN from "@tweenjs/tween.js";

export const regular = 'regular';

export class RegularBall extends Ball {
  constructor(x, y, colorIdx, color, cellWidth, cellHeight) {
    super(x,y,cellWidth, cellHeight);
    this.colors.add(colorIdx);
    this.color = color.clone();
    this.colorIdx = colorIdx;
  }

  getScore() {
    return 5;
  }

  getType() {
    return regular;
  }

  vanish (onComplete,delay = 0) {
    super.vanish(onComplete, delay);
    let alphaChange = new TWEEN.Tween(this.color).to({alpha:0},300).easing(TWEEN.Easing.Quadratic.In)
      .delay(delay).start();
  }

  drawBall (game) {
    super.drawBall(game);
    let x = -game.cellWidth2;
    let y = -game.cellHeight2;
    let color = this.color.iRequestNormalColor();
    let xy0 = Math.floor(this.cellHeight*0.15);
    let radius = Math.floor(this.cellWidth*0.3125);

    let gradient = game.ctx.createRadialGradient(-xy0, -xy0, 0, 0, 0, radius);

    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.7, color);
    gradient.addColorStop(0.9, color);
    gradient.addColorStop(1, 'transparent');

    game.ctx.fillStyle = gradient;
    game.ctx.fillRect(x, y, game.cellWidth, game.cellHeight);
  }
}
