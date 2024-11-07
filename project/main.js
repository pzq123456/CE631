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
    columns: 10,
    rows: 10,
};

const pane = new Pane();
pane.addBinding(PARAMS, 'color1');
pane.addBinding(PARAMS, 'color2');
pane.addBinding(PARAMS, 'columns', {
    min: 1,
    max: 100,
    step: 1,
});
pane.addBinding(PARAMS, 'rows', {
    min: 1,
    max: 100,
    step: 1,
});

function PaneUpdate() {
    const colors = interpolateColors(PARAMS.color1, PARAMS.color2, 100);
    renderer.setColors(colors);
    grid = new Grid(PARAMS.rows, PARAMS.columns);
    controller.setGrid(grid);
    renderer.setGrid(grid);
}

pane.on('change', PaneUpdate);

let grid = new Grid(10, 10);

console.log(grid.description);

let renderer = new Renderer(canvas.getLayer('game'), grid);

let controller = new Controller(canvas.getLayer('control'), grid);

// grid.test();
function update(){
    renderer.update();
    grid.update();
    controller.update();
}


function Loop() {
    update();
    requestAnimationFrame(Loop);
}

requestAnimationFrame(Loop);

