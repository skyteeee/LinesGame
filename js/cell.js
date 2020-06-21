import {xy2screen} from "./tools";

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

  fillBackground () {
    let gfx = this.game.cellGraphics;
    gfx.beginFill(0xd8dfd8);
    let p = xy2screen(this.x, this.y, this.game);
    gfx.drawRect(p.pX-this.game.cellWidth*0.4, p.pY - this.game.cellHeight*0.4, this.game.cellWidth*0.8, this.game.cellHeight*0.8);
    gfx.endFill();
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
}
