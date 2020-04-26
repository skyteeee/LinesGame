import {Ball} from "./ball";
import TWEEN from "@tweenjs/tween.js";
import * as PIXI from 'pixi.js';

export const colorWave = 'colorWave';

export class ColorWave extends Ball {
  constructor(x, y, cellWidth, cellHeight, colorIdx, color, game) {
    super(x, y, cellWidth, cellHeight, game);
    this.colors.add(colorIdx);
    this.colorIdx = colorIdx;
    this.sprite = new PIXI.Sprite(this.game.tex.colorWaveTex[colorIdx]);
    this.ballCont.addChild(this.sprite);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(this.cellWidth / this.sprite.width * Ball.defaultScaleMultiplier);
    this.color = color.clone();
  }
  getType() {
    return colorWave;
  }
  getScore() {
    return 100;
  }

  drawBall() {
    super.drawBall();
    let radius = Math.floor(this.cellHeight*0.3125);
    let halfSide = radius/2.5;

    this.game.ctx.beginPath();
    this.game.ctx.moveTo(radius, halfSide);
    this.game.ctx.lineTo(radius, -halfSide);
    this.game.ctx.lineTo(halfSide, -radius);
    this.game.ctx.lineTo(-halfSide, -radius);
    this.game.ctx.lineTo(-radius, -halfSide);
    this.game.ctx.lineTo(-radius, halfSide);
    this.game.ctx.lineTo(-halfSide, radius);
    this.game.ctx.lineTo(halfSide, radius);
    this.game.ctx.closePath();

    let color = this.color.iRequestNormalColor();
    let darker = this.color.darkenColor(0.8);
    let lighter = this.color.lightenColor(0.5);
    let outerGradient = this.game.ctx.createLinearGradient(-radius, -radius, radius, radius);
    outerGradient.addColorStop(0, lighter);
    outerGradient.addColorStop(1, darker);

    this.game.ctx.fillStyle = outerGradient;
    this.game.ctx.fill();
    this.game.ctx.strokeStyle = 'rgba(68,68,68,0.5)';
    this.game.ctx.strokeWidth = 1;
    this.game.ctx.stroke();

    radius *= 0.7;
    halfSide *= 0.7;

    this.game.ctx.beginPath();
    this.game.ctx.moveTo(radius, halfSide);
    this.game.ctx.lineTo(radius, -halfSide);
    this.game.ctx.lineTo(halfSide, -radius);
    this.game.ctx.lineTo(-halfSide, -radius);
    this.game.ctx.lineTo(-radius, -halfSide);
    this.game.ctx.lineTo(-radius, halfSide);
    this.game.ctx.lineTo(-halfSide, radius);
    this.game.ctx.lineTo(halfSide, radius);
    this.game.ctx.closePath();

    let innerGradient = this.game.ctx.createLinearGradient(radius, radius, -radius, -radius);
    innerGradient.addColorStop(0, lighter);
    innerGradient.addColorStop(1, darker);

    this.game.ctx.fillStyle = innerGradient;
    this.game.ctx.fill();
  }

  selected() {
    let rotation = new TWEEN.Tween(this.ballCont).to({angle:360}, 3000).repeat(Infinity).start();
    let scaling = new TWEEN.Tween(this.ballCont.scale).to({y:0.75, x:0.75}, 500).repeat(Infinity)
      .yoyo(true).easing(TWEEN.Easing.Elastic.In).start();
    this.selectedTween = [rotation, scaling];
  }

  reinit() {
    super.reinit();
    this.sprite.scale.set(this.cellWidth / (this.sprite.width / this.sprite.scale.x) * Ball.defaultScaleMultiplier);
  }

  vanish(onComplete, delay = 0) {
    this.isVanishing = true;
    if (this.dribbleTween) {
      this.dribbleTween.stop();
      this.dribbleTween = null;
    }
    let rescale = new TWEEN.Tween(this.ballCont.scale).to({x:0, y:0}, 300).easing(TWEEN.Easing.Quadratic.In)
      .delay(delay).start();
    let rotation = new TWEEN.Tween(this.ballCont).to({angle:360}, 300).easing(TWEEN.Easing.Quadratic.In)
      .delay(delay).onComplete(onComplete).start();
  }

  dribble () {
    let angle = 15;
    this.ballCont.angle = -angle;

    let animation = new TWEEN.Tween(this.ballCont).to({angle:angle}, 200);

    let goBack = new TWEEN.Tween(this.ballCont).to({angle:-angle}, 200);

    animation.chain(goBack);
    goBack.chain(animation);
    animation.start();

    this.dribbleTween = animation;
  }

}
