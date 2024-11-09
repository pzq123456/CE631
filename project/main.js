import { Grid } from "./grid.js";
import { Renderer, CellRenderer, WindRenderer } from "./render.js";
import { FireSpreadEvent } from "./models/fire.js";

import { FireSpreadAnalysis } from "./models/analysis.js";

import { GaussianDistribution, DiscreteDistribution } from "./distributions.js";

import { Environment } from "./models/environment.js";


// Initialize canvas, renderer, and grid
const canvas = document.getElementById("canvas");

const gridSize = 100;
const cellSize = 10;

const renderer = new Renderer(canvas, cellSize);

const grid = new Grid(gridSize);
// 添加渲染策略
renderer.addStrategy(new CellRenderer(renderer.context, cellSize));

renderer.addStrategy(new WindRenderer(renderer.context, cellSize));


renderer.render(grid);

const windDirectionDist = new DiscreteDistribution({ "NE": 0.6, "E": 0.2, "SE": 0.1, "N": 0.1 , "S": 0.0, "W": 0.0, "NW": 0.0, "SW": 0.0 });
const windSpeedDist = new GaussianDistribution(10, 2);  // 例如：平均风速 10，方差 2

const environment = new Environment(windDirectionDist, windSpeedDist);

// add initial fire event
grid.addEvent(new FireSpreadEvent(0, grid, environment, Math.floor(gridSize / 2), Math.floor(gridSize / 2)));

// 模拟循环
// while (grid.hasPendingEvents()) {
//     grid.step();
// }
const timeStep = 100; // 1s

setInterval(() => {
    grid.step();
    renderer.render(grid);
}, timeStep);

function renderLoop() {
    renderer.render(grid);
    requestAnimationFrame(renderLoop);  // Render at the browser's frame rate
}

renderLoop();

const analysis = new FireSpreadAnalysis(grid);

// 定期调用 update 方法进行增量统计
setInterval(() => {
    analysis.update();
    console.log("当前总蔓延区域:", analysis.getTotalSpreadArea());
    console.log("火灾最大蔓延时间步:", analysis.getMaxSpreadTime());
    console.log("平均燃烧时间:", analysis.getAverageBurnTime());
}, 1000);  // 每秒更新一次

