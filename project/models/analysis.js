import { FireSpreadEvent, BurnOutEvent } from './fire.js';

export class FireSpreadAnalysis {
    constructor(grid) {
        this.grid = grid;
        this.events = [];
        this.timeEventMap = {};
        this.spreadMap = new Map();
        this.lastProcessedIndex = 0;
        
        // 新增：记录每个格子的燃烧开始时间和结束时间
        this.burnTimes = new Map();  // { "x,y": { startTime, endTime } }
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

            // 若是 BurnOutEvent，记录格子的燃烧结束时间
            } else if (event instanceof BurnOutEvent && this.burnTimes.has(key)) {
                const burnRecord = this.burnTimes.get(key);
                if (burnRecord.endTime === null) {
                    burnRecord.endTime = event.time;
                }
            }
        });

        this.events.push(...newEvents);
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
}
