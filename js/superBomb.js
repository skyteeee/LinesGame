import {RainbowBall} from "./rainbowBall";

export const superBomb = 'superBomb';

export class SuperBomb extends RainbowBall {
  drawBall(game) {
    let x = -game.cellWidth2;
    let y = -game.cellHeight2;
    let xy0 = Math.floor(this.cellHeight*0.15);
    let radius = Math.floor(this.cellHeight*0.3125);
    game.ctx.translate (this.px, this.py);
    game.ctx.scale(this.scaleX, this.scaleY);

    let ballGradient = game.ctx.createRadialGradient(-xy0, -xy0, 0, 0, 0, radius);

    ballGradient.addColorStop(0, 'white');
    ballGradient.addColorStop(0.7, 'black');
    ballGradient.addColorStop(0.9, 'black');
    ballGradient.addColorStop(1, 'transparent');

    game.ctx.fillStyle = ballGradient;
    game.ctx.fillRect(x, y, this.cellWidth, this.cellHeight);

    game.ctx.font = `bold ${radius*0.5}px SmallPixel`;
    game.ctx.fillStyle = 'red';
    game.ctx.textAlign = 'center';
    game.ctx.textBaseline = 'middle';
    game.ctx.strokeStyle = 'white';
    game.ctx.strokeWidth = 1;

    game.ctx.fillText('-25%',0, 0);
  }

  getType() {
    return superBomb;
  }

}
