import {Ball} from "./ball";

export const doubleBall = 'double';

export class DoubleBall extends Ball{
  constructor(x, y, cellWidth, cellHeight, colorIdx1, colorIdx2, possibleColors) {
    super(x,y,cellWidth, cellHeight);
    let fakeColor1 = possibleColors[colorIdx1];
    let fakeColor2 = possibleColors[colorIdx2];
    this.color1 = fakeColor1.clone();
    this.color2 = fakeColor2.clone();
    this.colors.add(colorIdx1);
    this.colors.add(colorIdx2);
  }

  getScore() {
    return 10;
  }

  getType() {
    return doubleBall;
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
    let rainbowGradient = game.ctx.createLinearGradient(radius, radius, -radius, -radius);

    gradient.addColorStop(0, 'white');
    gradient2.addColorStop(0, 'rgba(255,255,255,0.7)');
    gradient.addColorStop(0.8, 'rgba(255,255,255,0)');
    gradient2.addColorStop(0.7, 'rgba(255,255,255,0)');

    rainbowGradient.addColorStop(0, this.color1.iRequestNormalColor());
    rainbowGradient.addColorStop(0.49, this.color1.iRequestNormalColor());
    rainbowGradient.addColorStop(0.51, this.color2.iRequestNormalColor());
    rainbowGradient.addColorStop(1, this.color2.iRequestNormalColor());

    rainbowGradient.addColorStop(1, 'transparent');
    gradient.addColorStop(1, 'transparent');
    gradient2.addColorStop(1, 'transparent');

    game.ctx.fillStyle = rainbowGradient;
    game.ctx.beginPath();
    game.ctx.arc(0.5, 0.5, radius, 0, Math.PI*2);
    game.ctx.fill();
    game.ctx.strokeStyle = 'rgba(68,68,68,0.5)';
    game.ctx.strokeWidth = 1;
    game.ctx.stroke();
    game.ctx.fillStyle = gradient;
    game.ctx.fillRect(x, y, game.cellWidth, game.cellHeight);
    // game.ctx.fillStyle = gradient2;
    // game.ctx.fillRect(x, y, game.cellWidth, game.cellHeight);
  }
}
