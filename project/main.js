import { Grid } from "./grid.js";
import { FireSpreadEvent } from "./models/fire.js";

import { Renderer, CellRenderer, WindRenderer } from "./render.js";

import { GaussianDistribution, DiscreteDistribution } from "./distributions.js";
import { Environment } from "./models/environment.js";

import { FireSpreadAnalysis } from "./models/analysis.js";

const canvas = document.getElementById("canvas");

const gridSize = 10;

// 渲染器及对应的渲染策略
const renderer = new Renderer(canvas, gridSize);

renderer.addStrategy(new CellRenderer(renderer.canvas, gridSize));
renderer.addStrategy(new WindRenderer(renderer.canvas, gridSize));

const grid = new Grid(gridSize);

renderer.render(grid);

// 环境参数的概率分布（风向和风速） 用于蒙特卡洛模拟
const windDirectionDist = new DiscreteDistribution({ "NE": 0.3, "E": 0.3, "SE": 0.1, "N": 0.1 , "S": 0.1, "W": 0.1, "NW": 0.0, "SW": 0.0 });
const windSpeedDist = new GaussianDistribution(10, 2);  // 例如：平均风速 10，方差 2

const environment = new Environment(windDirectionDist, windSpeedDist);

// 初始化 火势蔓延分析
const analysis = new FireSpreadAnalysis(grid);

// 模拟火灾蔓延 S-I-M-U-L-A-T-I-O-N

grid.addEvent(new FireSpreadEvent(0, grid, environment, Math.floor(gridSize / 2), Math.floor(gridSize / 2)));

const timeStep = 100; // 1 秒

simuateLoop();
renderLoop();
analysisLoop();

function renderLoop() {
    renderer.render(grid);
    requestAnimationFrame(renderLoop);  // Render at the browser's frame rate
}

function simuateLoop() {
    grid.step();
    setTimeout(simuateLoop, timeStep);
}

function analysisLoop() {
    analysis.update();

    if(grid.hasPendingEvents()) {
        // 还有未处理的事件
        setTimeout(analysisLoop, 1000);

    }else{
        console.log("当前总蔓延区域:", analysis.getTotalSpreadArea());
        console.log("火灾最大蔓延时间步:", analysis.getMaxSpreadTime());
        console.log("平均燃烧时间:", analysis.getAverageBurnTime());
        console.log("每个时间步燃烧的格子数:", analysis.getSpreadAreaOverTime());
        console.log(
            grid.getRecord().map(event => {
                return {
                    time: event.time,
                    type: event.constructor.name,
                    x: event.x,
                    y: event.y
                };
            })
        )
    }
}