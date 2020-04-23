import * as PIXI from 'pixi.js';

export class HUD {
  constructor(game) {
    this.game = game;
    let fontSize = Math.floor(this.game.hudHeight * 0.6);
    let offsetY = this.game.hudHeight*0.25;
    let offsetX = this.game.hudHeight*0.2;
    this.scoreText = new PIXI.BitmapText(`Score: ${this.game.score}`,
      {font: `${fontSize}px MainFont`, align: 'left', tint: 0x626262});
    this.scoreText.x = offsetX;
    this.scoreText.y = offsetY;
    this.game.cnt.HUD.addChild(this.scoreText);

    this.lvlText = new PIXI.BitmapText(`Level: ${this.game.level}`,
      {font: `${fontSize}px MainFont`, align: 'center', tint: 0x626262});
    this.lvlText.x = this.game.width/2-this.lvlText.textWidth/2;
    this.lvlText.y = offsetY;
    this.lvlText.maxWidth = this.game.width/4;
    this.game.cnt.HUD.addChild(this.lvlText);

    this.lvlUpText = new PIXI.BitmapText(`Lvl up: +${this.game.scoreToLevelUp-this.game.score}`,
      {font: `${fontSize}px MainFont`, align: 'center', tint: 0x626262});
    this.lvlUpText.x = this.game.width-offsetX-this.lvlUpText.textWidth;
    this.lvlUpText.y = offsetY;
    this.lvlUpText.maxWidth = this.game.width/4;
    this.game.cnt.HUD.addChild(this.lvlUpText);
  }

  update () {
    let offsetX = this.game.hudHeight*0.2;

    this.scoreText.text = `Score: ${Math.floor(this.game.score)}`;

    this.lvlText.text = `Level: ${this.game.level}`;
    this.lvlText.x = this.game.width/2-this.lvlText.textWidth/2;

    this.lvlUpText.text = `Lvl up: +${Math.floor(this.game.scoreToLevelUp-this.game.score)}`;
    this.lvlUpText.x = this.game.width-offsetX-this.lvlUpText.textWidth;
  }

}
