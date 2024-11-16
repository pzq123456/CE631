import { Grid } from "./grid.js";
import { FireSpreadEvent } from "./models/fire.js";

import { Renderer, CellRenderer, WindRenderer, FirefighterRenderer } from "./render.js";

import { GaussianDistribution, DiscreteDistribution } from "./distributions.js";
import { Environment } from "./models/environment.js";

import { FireSpreadAnalysis } from "./models/analysis.js";

import { FirefighterEvent, Firefighter } from "./models/people.js";

// visualization

import { barChart, radarChart } from "./chart.js";

import { tableRender } from "./table.js";

const canvas = document.getElementById("canvas");

const chartCanvas1 = document.getElementById("myChart1");
const chartCanvas2 = document.getElementById("myChart2");
const chartCanvas3 = document.getElementById("myChart3");

const tableParentDiv = document.getElementById('table-container');



const gridSize = 10;

// 渲染器及对应的渲染策略
const renderer = new Renderer(canvas, gridSize);

const grid = new Grid(gridSize);

renderer.render(grid);

// 环境参数的概率分布（风向和风速） 用于蒙特卡洛模拟
// N     0.296650
// E     0.290949
// SE    0.171591
// S     0.119358
// SW    0.100163
// NW    0.015123
// NE    0.005700
// W     0.000465

const windDirectionDist = new DiscreteDistribution({ 'N': 0.296650, 'E': 0.290949, 'SE': 0.171591, 'S': 0.119358, 'SW': 0.100163, 'NW': 0.015123, 'NE': 0.005700, 'W': 0.000465 });
// const windSpeedDist = new GaussianDistribution(10, 2);  // 例如：平均风速 10，方差 2

// Mean wind speed: 17.842082606166375
// Standard deviation of wind speed: 6.709404241331985
const windSpeedDist = new GaussianDistribution(17.842082606166375, 6.709404241331985);  // real data

const environment = new Environment(windDirectionDist, windSpeedDist);

// 初始化 火势蔓延分析
const analysis = new FireSpreadAnalysis(grid);

// 模拟火灾蔓延 S-I-M-U-L-A-T-I-O-N

grid.addEvent(new FireSpreadEvent(0, grid, environment, Math.floor(gridSize / 2), Math.floor(gridSize / 2)));

// 创建消防员并添加到事件队列
const firefighters = [];
const numFirefighters = 30;

for (let i = 0; i < numFirefighters; i++) {
    const firefighter = new Firefighter(grid, gridSize - 1, gridSize - 1);
    firefighters.push(firefighter);
    grid.addEvent(new FirefighterEvent(0, firefighter));
}

const timeStep = 0; // 1 秒

renderer.addStrategy(new CellRenderer(renderer.canvas, gridSize));
renderer.addStrategy(new WindRenderer(renderer.canvas, gridSize));
renderer.addStrategy(new FirefighterRenderer(canvas, gridSize, firefighters));

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
        setTimeout(analysisLoop, 1000);
    }else{
        console.log("当前总蔓延区域:", analysis.getTotalSpreadArea());
        console.log("火灾最大蔓延时间步:", analysis.getMaxSpreadTime());
        console.log("平均燃烧时间:", analysis.getAverageBurnTime());
        // getFirefighterExtinguishInfo
        console.log("消防员灭火信息:", analysis.getFirefighterExtinguishInfo());

        const spreadAreaOverTime = analysis.getSpreadAreaOverTime();
        // 打印风向和风速
        console.log("风向:", analysis.getWindDirectionDistributionArray());
        console.log("风速:", analysis.getWindSpeedDistribution());

        barChart(chartCanvas1.getContext('2d'), Object.keys(spreadAreaOverTime),[{
            data: Object.values(spreadAreaOverTime),
            label: 'Spread Area',
            color: 'red'
        },
        {
            data: Object.values(analysis.getFirefighterExtinguishInfo()),
            label: 'Firefighter Extinguish',
            color: 'blue'
        }
        ]);

        radarChart(chartCanvas2.getContext('2d'), analysis.getWindDirectionDistributionArray());
        barChart(chartCanvas3.getContext('2d'), Array.from(analysis.getWindSpeedDistribution().keys()),[{
            data: Array.from(analysis.getWindSpeedDistribution().values()),
            label: 'Wind Speed Distribution'
        }]);

        console.log(analysis.getEvents());
            // Table
        const rowHeight = 20;
        const data = analysis.getEvents();
        const tabrender = new tableRender(tableParentDiv, rowHeight, data, renderRow);

    }
}


function renderRow(event, colorMapFn = colorMap) {
    // return `<td>${event.time}</td><td>${event.constructor.name}</td><td>${event.x}</td><td>${event.y}</td>`;
    // return `<td>${event.time}</td><td style="color:${colorMapFn(event.constructor.name)}">${event.constructor.name}</td><td>${event.x}</td><td>${event.y}</td>`;

    // 所有的数组都是绿色
    // 若没有X，Y坐标，则不显示

    // 若是消防员事件，显示消防员的体力和水量
    if (event instanceof FirefighterEvent) {
        return `<td>${event.time}</td><td style="color:${colorMapFn(event.constructor.name)}">${event.constructor.name}</td><td>${event.x}</td><td>${event.y}</td><td>${event.stamina}</td><td>${event.water}</td>`;
    } else {
        return `<td>${event.time}</td><td style="color:${colorMapFn(event.constructor.name)}">${event.constructor.name}</td><td>${event.x}</td><td>${event.y}</td>`;
    }
}

// 对于每一个事件名给出一个颜色
function colorMap(eventname) {
    switch (eventname) {
        case 'FireSpreadEvent':
            return 'red';
        case 'BurnOutEvent':
            return 'gray';
        case 'FirefighterEvent':
            return 'blue';
        case 'ExtinguishedEvent':
            return 'green';
        case 'ExtinguishStart':
            return 'pink';
        case 'FirefighterFailureEvent':
            return 'purple';
        case 'SetFireBreakEvent':
            return 'orange';
        default:
            return 'black';
    }
}


// Table
// table-container

// const render = new tableRender(parentDiv, rowHeight, totalRows);

