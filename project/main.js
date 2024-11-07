import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import { Canvas } from './src/canvas.js';

import { Grid } from './src/grid.js';

import { interpolateColors } from './src/colors.js';

import { Renderer } from './src/render.js';

import { Controller } from './src/control.js';

const myCanvas = document.getElementById('myCanvas');

const canvas = new Canvas(myCanvas, ["game", "text", "control"], 1024, 1024, 0);

const PARAMS = {
    color1: '#ff0055',
    color2: '#00ff55',
};

const pane = new Pane();

pane.addBinding(PARAMS, 'color1');
pane.addBinding(PARAMS, 'color2');

function PaneUpdate() {
    const colors = interpolateColors(PARAMS.color1, PARAMS.color2, 100);
    renderer.setColors(colors);
}

pane.on('change', PaneUpdate);

const grid = new Grid(10, 10);

const renderer = new Renderer(canvas.getLayer('game'), grid);

const controller = new Controller(canvas.getLayer('control'), grid);

grid.test();
function update(){
    renderer.update();
}


function Loop() {
    update();
    requestAnimationFrame(Loop);
}

requestAnimationFrame(Loop);

