import {Ball} from "./ball";
import {Color} from "./color";

export const rainbow = 'rainbow';

export class RainbowBall extends Ball {
  constructor(x, y, cellHeight, cellWidth, possibleColors, game) {
    super(x, y, cellWidth, cellHeight, game);
    this.actualColors = [];
    for (let idx in possibleColors) {
      let color = possibleColors[idx];
      this.colors.add(parseInt(idx));
      this.actualColors.push(new Color(color.red, color.green, color.blue));
    }
  }

  getScore() {
    return 25;
  }

  getType() {
    return rainbow;
  }

  drawBall() {
    super.drawBall();
    let x = -this.game.cellWidth2;
    let y = -this.game.cellHeight2;
    let xy0 = Math.floor(this.cellHeight * 0.15);
    let xy1 = Math.floor(this.cellHeight * 0.16);
    let radius = Math.floor(this.cellWidth * 0.3125);
    let gradient = this.game.ctx.createRadialGradient(-xy0, -xy0, 0, 0, 0, radius);
    let gradient2 = this.game.ctx.createRadialGradient(xy1, xy1, 0, 0, 0, radius);
    let rainbowGradient = this.game.ctx.createRadialGradient(0, 0, 0, 0, 0, radius);

    gradient.addColorStop(0, 'white');
    gradient2.addColorStop(0, 'rgba(255,255,255,0.7)');
    gradient.addColorStop(0.8, 'rgba(255,255,255,0)');
    gradient2.addColorStop(0.7, 'rgba(255,255,255,0)');
    let gidx = 0;
    for (let color of this.actualColors) {
      rainbowGradient.addColorStop(gidx, color.iRequestNormalColor());
      gidx += 0.15;
    }
    rainbowGradient.addColorStop(1, 'transparent');
    gradient.addColorStop(1, 'transparent');
    gradient2.addColorStop(1, 'transparent');

    this.game.ctx.fillStyle = rainbowGradient;
    this.game.ctx.fillRect(x, y, this.game.cellWidth, this.game.cellHeight);
    this.game.ctx.fillStyle = gradient;
    this.game.ctx.fillRect(x, y, this.game.cellWidth, this.game.cellHeight);
    this.game.ctx.fillStyle = gradient2;
    this.game.ctx.fillRect(x, y, this.game.cellWidth, this.game.cellHeight);
  }
}
