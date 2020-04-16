
export class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.ball = null;
    this.selected = false;
  }


  setBall (ball) {
    this.ball = ball;
    this.ball.x = this.x;
    this.ball.y = this.y;
  }

  handleSelect (state, game) {
    this.selected = state;
    if (state && this.ball) {
      this.ball.selected(game);
    } else {
      if (this.ball) {
        this.ball.deselect();
      }
    }
  }

  innerDraw (game) {
    let x = -game.cellWidth2;
    let y = -game.cellHeight2;
    let x2 = x + game.cellWidth - 1;
    let y2 = y + game.cellHeight - 1;

    if (this.selected) {
      game.ctx.fillStyle = '#cbcbcb';
      game.ctx.fillRect(x+1, y+1, game.cellWidth-2, game.cellHeight-2);
    } else {
      game.ctx.clearRect(x+1, y+1, game.cellWidth - 2, game.cellHeight - 2);
    }

    game.ctx.strokeStyle = '#fafffb';
    game.ctx.beginPath();
    game.ctx.moveTo(x2, y);
    game.ctx.lineTo(x, y);
    game.ctx.lineTo(x, y2);
    game.ctx.stroke();

    game.ctx.strokeStyle = '#c8cdc9';
    game.ctx.beginPath();
    game.ctx.moveTo(x2, y);
    game.ctx.lineTo(x2, y2);
    game.ctx.lineTo(x, y2);
    game.ctx.stroke();

  }


  drawCell (game) {
    game.ctx.save();
    game.ctx.translate(game.cellWidth * this.x + game.cellWidth2, game.cellHeight * this.y + game.cellHeight2);
    this.innerDraw(game);
    game.ctx.restore();
  }

  drawBall (game) {
    if (this.ball) {
      game.ctx.save();
      game.ctx.translate(game.cellWidth * this.x + game.cellWidth2, game.cellHeight * this.y + game.cellHeight2);
      this.ball.drawBall(game);
      game.ctx.restore();
    }
  }

}
