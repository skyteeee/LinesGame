import {Ball} from "./ball";
import {Color} from "./color";

export const rainbow = 'rainbow';

export class RainbowBall extends Ball {
  constructor(x, y, cellHeight, cellWidth, possibleColors) {
    super(x, y, cellWidth, cellHeight);
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

  drawBall(game) {
    super.drawBall(game);
    let x = -game.cellWidth2;
    let y = -game.cellHeight2;
    let xy0 = Math.floor(this.cellHeight * 0.15);
    let xy1 = Math.floor(this.cellHeight * 0.16);
    let radius = Math.floor(this.cellWidth * 0.3125);
    let gradient = game.ctx.createRadialGradient(-xy0, -xy0, 0, 0, 0, radius);
    let gradient2 = game.ctx.createRadialGradient(xy1, xy1, 0, 0, 0, radius);
    let rainbowGradient = game.ctx.createRadialGradient(0, 0, 0, 0, 0, radius);

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

    game.ctx.fillStyle = rainbowGradient;
    game.ctx.fillRect(x, y, game.cellWidth, game.cellHeight);
    game.ctx.fillStyle = gradient;
    game.ctx.fillRect(x, y, game.cellWidth, game.cellHeight);
    game.ctx.fillStyle = gradient2;
    game.ctx.fillRect(x, y, game.cellWidth, game.cellHeight);
  }
}
