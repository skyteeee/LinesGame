import * as PIXI from 'pixi.js';
import TWEEN from "@tweenjs/tween.js";

export class GameOver {
  constructor(game) {
    this.game = game;
    this.cont = new PIXI.Container();
    this.gameOverText = new PIXI.Text('Game Over',
      new PIXI.TextStyle({
        fontFamily: 'MainFont',
        fontSize: Math.ceil(game.width*0.098),
        fontWeight: 'bold',
        fill: ['#FF0031','#B4002E'],
        stroke: '#ffffff',
        strokeThickness: 2
      }));
    this.gameOverText.x = this.game.width/2-this.gameOverText.width/2;
    this.gameOverText.y = this.game.height/4-this.gameOverText.height/2;

    this.gfx = new PIXI.Graphics();
    this.gfx.beginFill(0, 0.5);
    this.gfx.drawRect(0, 0, this.game.width, this.game.height);
    this.gfx.endFill();

    this.gfx.on('pointerdown', () => {this.game.operateGameOver()});

    this.smallTextStyle = new PIXI.TextStyle({
      fontFamily: 'MainFont',
      fontSize: Math.ceil(game.width*0.05),
      fontWeight: 'bold',
      fill: ['#ff00ff', '#640064'],
      stroke: '#ffffff',
      strokeThickness: 1,
    });

    this.smallText = new PIXI.Text(`Your score: ${this.game.score}.`, this.smallTextStyle);
    this.smallText.x = this.game.width/2-this.smallText.width/2;
    this.smallText.y = this.game.height/4-this.smallText.height/2+this.gameOverText.height-this.game.hudHeight;

    this.rankText = new PIXI.Text(`Rank: ${this.game.rank}`, this.smallTextStyle);
    this.rankText.x = this.game.width/2-this.rankText.width/2;
    this.rankText.y = this.game.height/4-this.rankText.height/2+this.gameOverText.height+this.smallText.height-this.game.hudHeight;


    this.cont.addChild(this.gfx, this.gameOverText, this.smallText, this.rankText);
  }

  updateSmallText() {
    this.smallText.text = `Your score: ${this.game.score}`;
    this.smallText.x = this.game.width/2-this.smallText.width/2;
    this.rankText.text = `Rank: ${this.game.rank}`;
    this.rankText.x = this.game.width/2-this.rankText.width/2;
  }

  show() {
    this.updateSmallText();
    this.gfx.alpha = 0;
    this.gameOverText.alpha = 0;
    this.smallText.alpha = 0;
    this.game.app.stage.addChild(this.cont);

    let smallTextAnimation = new TWEEN.Tween(this.smallText).to({alpha:1}, 500);
    let animation = new TWEEN.Tween(this.gfx).to({alpha:1}, 300).start();
    let animation2 = new TWEEN.Tween(this.gameOverText).to({alpha:1}, 300)
      .onComplete(() => {smallTextAnimation.start()}).start();
  }

  hide() {
    let animation = new TWEEN.Tween(this.cont).to({alpha:0}, 300)
      .onComplete(() => {this.game.app.stage.removeChild(this.cont)}).start();
  }

}
