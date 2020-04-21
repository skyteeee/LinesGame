import {Game} from "./game";

function init () {
  game.init();
  game.refresh(performance.now());
}

function onResize() {
  game.resize();
}

window.onload = init;

let game = new Game();
window.game = game;
