import * as PIXI from 'pixi.js';
import TWEEN from "@tweenjs/tween.js";

export class HUD {
  constructor(game) {
    this.game = game;
    let fontSize = Math.floor(this.game.hudHeight * 0.6);
    let offsetY = this.game.hudHeight * 0.25;
    let offsetX = this.game.hudHeight * 0.2;
    this.scoreText = new PIXI.BitmapText(`Score: ${this.game.score}`,
      {font: `${fontSize}px MainFont`, align: 'left', tint: 0x626262});
    this.scoreText.x = offsetX;
    this.scoreText.y = offsetY;
    this.game.cnt.HUD.addChild(this.scoreText);

    this.lvlText = new PIXI.BitmapText(`Level: ${this.game.level}`,
      {font: `${fontSize}px MainFont`, align: 'center', tint: 0x626262});
    this.lvlText.x = this.game.width / 2 - this.lvlText.textWidth / 2;
    this.lvlText.y = offsetY;
    this.lvlText.maxWidth = this.game.width / 4;
    this.game.cnt.HUD.addChild(this.lvlText);

    this.lvlUpText = new PIXI.BitmapText(`Lvl up: +${this.game.scoreToLevelUp - this.game.score}`,
      {font: `${fontSize}px MainFont`, align: 'center', tint: 0x626262});
    this.lvlUpText.x = this.game.width - offsetX - this.lvlUpText.textWidth;
    this.lvlUpText.y = offsetY;
    this.lvlUpText.maxWidth = this.game.width / 4;
    this.game.cnt.HUD.addChild(this.lvlUpText);

    this.colorWaveText = new PIXI.BitmapText(`${5.0}`,
      {font: `${fontSize * 1.25}px MainFont`, tint: 0xca5a5a});
    this.colorWaveText.x = this.game.width / 2 - this.colorWaveText.textWidth / 2;
    this.colorWaveText.y = offsetY;
    this.colorWaveText.maxWidth = this.game.width / 4;
    this.colorWaveText.anchor.set(0.5, 0);

    this.animationTime = 5000;
  }

  update() {
    let offsetX = this.game.hudHeight * 0.2;
    if (this.game.isColorWaveModeOn) {
      this.colorWaveText.text = `${Math.floor(this.animationTime / 100) / 10}`;
    } else {
      this.scoreText.text = `Score: ${Math.floor(this.game.score)}`;

      this.lvlText.text = `Level: ${this.game.level}`;
      this.lvlText.x = this.game.width / 2 - this.lvlText.textWidth / 2;

      this.lvlUpText.text = `Lvl up: +${Math.floor(this.game.scoreToLevelUp - this.game.score)}`;
      this.lvlUpText.x = this.game.width - offsetX - this.lvlUpText.textWidth;
    }
  }

  turnOffColorWaveTimer() {
    this.game.app.stage.removeChild(this.colorWaveText);
    this.game.cnt.HUD.addChild(this.lvlText);
    this.colorWaveText.text = '5';
  }

  animateTimer(onComplete, onUpdate) {
    this.colorWaveText.scale.set(1);
    let animation = new TWEEN.Tween(this).to({animationTime: 0}, 5000)
      .onComplete(onComplete).onUpdate(onUpdate).start();
    let yoAnim = new TWEEN.Tween(this.colorWaveText.scale).to({x: 2, y: 2}, 500)
      .repeat(8).yoyo(true).start();
  }

  turnOnColorWaveTimer(colorIdx) {
    this.animationTime = 5000;
    this.game.cnt.HUD.removeChild(this.lvlText);
    this.game.app.stage.addChild(this.colorWaveText);
    this.animateTimer(() => {
      this.game.turnOffColorWaveMode(colorIdx);
    }, () => {
      this.update();
    });
  }

}
