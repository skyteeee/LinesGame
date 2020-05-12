import {Game} from "./game";
import css from '../css/lines.css'


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
