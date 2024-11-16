import { FireSpreadEvent, BurnOutEvent } from './fire.js';
import { ExtinguishedEvent } from './people.js';

export class FireSpreadAnalysis {
    constructor(grid) {
        this.grid = grid;
        this.events = [];
        this.timeEventMap = {};
        this.spreadMap = new Map();
        this.lastProcessedIndex = 0;
        
        // 新增：记录每个格子的燃烧开始时间和结束时间
        this.burnTimes = new Map();  // { "x,y": { startTime, endTime } }

        // 记录风向和风速
        this.windInfo = new Map();

        // 记录消防员的行为
        this.firefighterEvents = [];
    }

    // 增量更新事件列表和统计信息
    update() {
        const newEvents = this.grid.getRecord().slice(this.lastProcessedIndex);
        this.lastProcessedIndex += newEvents.length;

        newEvents.forEach(event => {
            const key = `${event.x},${event.y}`;

            // 若是 FireSpreadEvent，记录格子燃烧的开始时间
            if (event instanceof FireSpreadEvent) {
                if (!this.spreadMap.has(key)) {
                    this.spreadMap.set(key, event.time);
                }
                if (!this.burnTimes.has(key)) {
                    this.burnTimes.set(key, { startTime: event.time, endTime: null });
                }

                if (!this.timeEventMap[event.time]) {
                    this.timeEventMap[event.time] = [];
                }
                this.timeEventMap[event.time].push(event);

                this.windInfo.set(key, {
                    windDirection: event.grid.getCell(event.x, event.y).windDirection, 
                    windSpeed: event.grid.getCell(event.x, event.y).windSpeed 
                });

            // 若是 BurnOutEvent，记录格子的燃烧结束时间
            } else if (event instanceof BurnOutEvent && this.burnTimes.has(key)) {
                const burnRecord = this.burnTimes.get(key);
                if (burnRecord.endTime === null) {
                    burnRecord.endTime = event.time;
                }
            } else if (event instanceof ExtinguishedEvent) {
                this.firefighterEvents.push(event);
            }
        });

        this.events.push(...newEvents);
    }

    // 计算消防员每个时间步的扑灭火情况
    getFirefighterExtinguishInfo() {
        // 计算每个时间步的扑灭火情况
        const extinguishInfo = {};
        this.firefighterEvents.forEach(event => {
            if (!extinguishInfo[event.time]) {
                extinguishInfo[event.time] = 0;
            }
            extinguishInfo[event.time] += 1;
        });

        return extinguishInfo;
    }

    // 获取火势蔓延的总区域面积
    getTotalSpreadArea() {
        return this.spreadMap.size;
    }

    // 获取指定时间步中燃烧的格子
    getBurningCellsAtTime(time) {
        return this.timeEventMap[time] || [];
    }

    // 获取每个时间步中火势蔓延的格子数
    getSpreadAreaOverTime() {
        const spreadOverTime = {};
        for (let time in this.timeEventMap) {
            spreadOverTime[time] = this.timeEventMap[time].length;
        }
        return spreadOverTime;
    }

    // 获取火灾的最大蔓延时间步
    getMaxSpreadTime() {
        return Math.max(...Object.keys(this.timeEventMap).map(Number));
    }

    // 计算从起火点到指定格子的最短时间
    getShortestSpreadTime(x, y) {
        const key = `${x},${y}`;
        return this.spreadMap.get(key) || null;
    }

    // 计算平均燃烧时间
    getAverageBurnTime() {
        let totalBurnTime = 0;
        let burnCount = 0;

        this.burnTimes.forEach(burnRecord => {
            if (burnRecord.endTime !== null) {
                totalBurnTime += burnRecord.endTime - burnRecord.startTime;
                burnCount += 1;
            }
        });

        return burnCount > 0 ? totalBurnTime / burnCount : 0;
    }

    // 获取风的分布情况以便绘制雷达图
    getWindDirectionDistribution() {
        // const windDirectionCounts = new Map();
        // this.windInfo.forEach(info => {
        //     const key = `${info.windDirection}`;
        //     windDirectionCounts.set(key, (windDirectionCounts.get(key) || 0) + 1);
        // });
        // return windDirectionCounts;

        // 首先创建一个包含了所有可能风向的数组
        // { "NE": 0.3, "E": 0.3, "SE": 0.1, "N": 0.1 , "S": 0.1, "W": 0.1, "NW": 0.0, "SW": 0.0 }

        const windDirectionCounts = new Map();
        // 将所有方向初始化为 0
        const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        directions.forEach(direction => windDirectionCounts.set(direction, 0));

        this.windInfo.forEach(info => {
            const key = `${info.windDirection}`;
            windDirectionCounts.set(key, windDirectionCounts.get(key) + 1);
        });

        return windDirectionCounts;
    }

    getWindDirectionDistributionArray() {
        const windDirectionCounts = this.getWindDirectionDistribution();

        // 将风向按照 N, NE, E, SE, S, SW, W, NW 的顺序排列
        const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        return directions.map(direction => windDirectionCounts.get(direction) || 0);

        // return Array.from(windDirectionCounts.values());
    }

    // 获取每个风向的累计风速
    getWindSpeedDistribution() {
        const windSpeedCounts = new Map();
        this.windInfo.forEach(info => {
            const key = `${info.windDirection}`;
            windSpeedCounts.set(key, (windSpeedCounts.get(key) || 0) + info.windSpeed);
        });

        return windSpeedCounts;
    }

    getWindSpeedDistributionArray() {
        const windSpeedCounts = this.getWindSpeedDistribution();

        // 将风向按照 N, NE, E, SE, S, SW, W, NW 的顺序排列
        const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        return directions.map(direction => windSpeedCounts.get(direction) || 0);
    }

    // 输出事件列表以便可视化为表格
    getEvents() {
        return this.events;
    }
}
