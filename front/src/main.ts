import { GameScene } from './components/gameScene.js';

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    if (canvas) {
        new GameScene(canvas);
    }
});