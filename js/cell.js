
export class Cell {
  constructor(x, y, game) {
    this.x = x;
    this.y = y;
    this.game = game;
    this.ball = null;
    this.selected = false;
  }


  setBall (ball) {
    this.ball = ball;
    this.ball.x = this.x;
    this.ball.y = this.y;
  }

  handleSelect (state) {
    this.selected = state;
    if (state && this.ball) {
      this.ball.selected();
    } else {
      if (this.ball) {
        this.ball.deselect();
      }
    }
  }

  innerDraw () {
    let x = -this.game.cellWidth2;
    let y = -this.game.cellHeight2;
    let x2 = x + this.game.cellWidth - 1;
    let y2 = y + this.game.cellHeight - 1;

    if (this.selected) {
      this.game.ctx.fillStyle = '#cbcbcb';
      this.game.ctx.fillRect(x+1, y+1, this.game.cellWidth-2, this.game.cellHeight-2);
    } else {
      this.game.ctx.clearRect(x+1, y+1, this.game.cellWidth - 2, this.game.cellHeight - 2);
    }

    this.game.ctx.strokeStyle = '#fafffb';
    this.game.ctx.beginPath();
    this.game.ctx.moveTo(x2, y);
    this.game.ctx.lineTo(x, y);
    this.game.ctx.lineTo(x, y2);
    this.game.ctx.stroke();

    this.game.ctx.strokeStyle = '#c8cdc9';
    this.game.ctx.beginPath();
    this.game.ctx.moveTo(x2, y);
    this.game.ctx.lineTo(x2, y2);
    this.game.ctx.lineTo(x, y2);
    this.game.ctx.stroke();

  }


  drawCell () {
    this.game.ctx.save();
    this.game.ctx.translate(this.game.cellWidth * this.x + this.game.cellWidth2, this.game.cellHeight * this.y + this.game.cellHeight2);
    this.innerDraw();
    this.game.ctx.restore();
  }

  drawBall () {
    if (this.ball) {
      this.game.ctx.save();
      this.game.ctx.translate(this.game.cellWidth * this.x + this.game.cellWidth2, this.game.cellHeight * this.y + this.game.cellHeight2);
      this.ball.drawBall();
      this.game.ctx.restore();
    }
  }

}
