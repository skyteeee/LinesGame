import {RegularBall} from "./regularBall";

export const expansionBall = 'expansion';

export class ExpansionBall extends RegularBall {
  drawBall() {
    super.drawBall();
    let radius = Math.floor(this.cellWidth*0.3125);
    this.game.ctx.strokeStyle = 'black';
    this.game.ctx.save();
    this.game.ctx.lineWidth = 3;
    this.game.ctx.rotate(Math.PI/180*(-45));
    this.game.ctx.beginPath();
    this.game.ctx.moveTo(0,this.cellHeight*0.025);
    this.game.ctx.lineTo(0, Math.floor(radius-this.cellHeight*0.075));
    this.game.ctx.moveTo(0,this.cellHeight*0.025);
    this.game.ctx.lineTo(this.cellWidth*0.05, this.cellHeight*0.1);
    this.game.ctx.moveTo(0,this.cellHeight*0.025);
    this.game.ctx.lineTo(-this.cellWidth*0.05, this.cellHeight*0.1);

    this.game.ctx.moveTo(0, -this.cellHeight*0.025);
    this.game.ctx.lineTo(0, -Math.floor(radius-this.cellHeight*0.075));
    this.game.ctx.moveTo(0, -this.cellHeight*0.025);
    this.game.ctx.lineTo(this.cellWidth*0.05, -this.cellHeight*0.1);
    this.game.ctx.moveTo(0, -this.cellHeight*0.025);
    this.game.ctx.lineTo(-this.cellWidth*0.05, -this.cellHeight*0.1);
    this.game.ctx.stroke();
    this.game.ctx.restore();
  }

  getType() {
    return expansionBall;
  }
}
