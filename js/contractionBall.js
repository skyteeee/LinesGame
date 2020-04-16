import {RegularBall} from "./regularBall";

export const contractionBall = 'contraction';

export class ContractionBall extends RegularBall {
  drawBall(game) {
    super.drawBall(game);
    let radius = Math.floor(this.cellWidth*0.3125);
    game.ctx.strokeStyle = 'black';
    game.ctx.save();
    game.ctx.lineWidth = 3;
    game.ctx.rotate(Math.PI/180*45);
    game.ctx.beginPath();
    game.ctx.moveTo(0,this.cellHeight*0.025);
    game.ctx.lineTo(0, Math.floor(radius-this.cellHeight*0.075));
    game.ctx.lineTo(this.cellWidth*0.05, this.cellHeight*0.1);
    game.ctx.moveTo(0, Math.floor(radius-this.cellHeight*0.075));
    game.ctx.lineTo(-this.cellWidth*0.05, this.cellHeight*0.1);

    game.ctx.moveTo(0, -this.cellHeight*0.025);
    game.ctx.lineTo(0, -Math.floor(radius-this.cellHeight*0.075));
    game.ctx.lineTo(this.cellWidth*0.05, -this.cellHeight*0.1);
    game.ctx.moveTo(0, -Math.floor(radius-this.cellHeight*0.075));
    game.ctx.lineTo(-this.cellWidth*0.05, -this.cellHeight*0.1);
    game.ctx.stroke();
    game.ctx.restore();
  }
  getType() {
    return contractionBall;
  }
}
