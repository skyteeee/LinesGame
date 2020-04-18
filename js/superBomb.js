import {RainbowBall} from "./rainbowBall";

export const superBomb = 'superBomb';

export class SuperBomb extends RainbowBall {
  drawBall() {
    let x = -this.game.cellWidth2;
    let y = -this.game.cellHeight2;
    let xy0 = Math.floor(this.cellHeight*0.15);
    let radius = Math.floor(this.cellHeight*0.3125);
    this.game.ctx.translate (this.px, this.py);
    this.game.ctx.scale(this.scaleX, this.scaleY);

    let ballGradient = this.game.ctx.createRadialGradient(-xy0, -xy0, 0, 0, 0, radius);

    ballGradient.addColorStop(0, 'white');
    ballGradient.addColorStop(0.7, 'black');
    ballGradient.addColorStop(0.9, 'black');
    ballGradient.addColorStop(1, 'transparent');

    this.game.ctx.fillStyle = ballGradient;
    this.game.ctx.fillRect(x, y, this.cellWidth, this.cellHeight);

    this.game.ctx.font = `bold ${radius*0.5}px SmallPixel`;
    this.game.ctx.fillStyle = 'red';
    this.game.ctx.textAlign = 'center';
    this.game.ctx.textBaseline = 'middle';
    this.game.ctx.strokeStyle = 'white';
    this.game.ctx.strokeWidth = 1;

    this.game.ctx.fillText('-25%',0, 0);
  }

  getType() {
    return superBomb;
  }

}
