import * as PIXI from 'pixi.js';
import TWEEN from "@tweenjs/tween.js";
import * as particles from "pixi-particles";

export class ScoreFloat {
  constructor(score, px, py, game) {
    this.score = score;
    this.px = px;
    this.py = py;
    this.game = game;
    this.cellWidth = game.cellWidth;
    this.cellHeight = game.cellHeight;
    this.opacity = 1;
    this.text = new PIXI.BitmapText(`${score}`,
      {font: `${this.game.cellHeight*0.5}px MainFont`, tint: 0x0e6d00});
    this.text.x = px-this.text.textWidth/2;
    this.text.y = py-this.text.textHeight/2;
    this.text.zIndex = 1234567;
    this.initParticles();
    this.game.app.stage.addChild(this.text);
  }

  initParticles() {
    this.particleCont = new PIXI.ParticleContainer(100, {position: true, rotation: false, uvs: true, tint: true});
    this.particleCont.zIndex = 1234562;
    this.emitter = new particles.Emitter(this.particleCont, [this.game.tex.ballOverlay.particleBall],
      {
        "alpha": {
          "start": 0,
          "end": 1
        },
        "scale": {
          "start": 0.75,
          "end": 0.075,
          "minimumScaleMultiplier": 1
        },
        "color": {
          "start": "#14a800",
          "end": "#0e6d00"
        },
        "speed": {
          "start": 100,
          "end": 50,
          "minimumSpeedMultiplier": 1
        },
        "acceleration": {
          "x": 0,
          "y": 0
        },
        "maxSpeed": 0,
        "startRotation": {
          "min": 0,
          "max": 360
        },
        "noRotation": true,
        "rotationSpeed": {
          "min": 0,
          "max": 0
        },
        "lifetime": {
          "min": 0.0001 * this.cellWidth,
          "max": 0.005 * this.cellWidth,
        },
        "blendMode": "normal",
        "frequency": 0.001,
        "emitterLifetime": -1,
        "maxParticles": 100,
        "pos": {
          "x": 0,
          "y": 0
        },
        "addAtBack": false,
        "spawnType": "point"
      });
    this.particleCont.x = 0;
    this.particleCont.y = 0;
    this.emitter.updateOwnerPos(this.px, this.py);
    this.game.app.stage.addChild(this.particleCont);
  }

  animate () {
    this.game.addAnimatedObject(this.emitter);
    let animation = new TWEEN.Tween(this.text).to({y: this.game.hudHeight * 0.5, x:this.game.cellWidth, alpha:0.5}, 500)
      .easing(TWEEN.Easing.Quadratic.In)
      .onComplete(()=>{this.game.app.stage.removeChild(this.text)}).start();

    let coords = {x: this.px, y: this.py};
    let particleAnimation = new TWEEN.Tween(coords).to({y:this.game.hudHeight * 0.5, x:this.game.cellWidth}, 500)
      .easing(TWEEN.Easing.Quadratic.In)
      .onUpdate((object) => {
        this.emitter.updateOwnerPos(object.x, object.y);
      })
      .onComplete(()=>{
        this.emitter.emit = false;
        setTimeout(() => {
          this.game.removeAnimatedObject(this.emitter);
          this.game.app.stage.removeChild(this.particleCont);
          }, 500);
      }).start();
  }
}
