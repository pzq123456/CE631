import { EventQueue } from "./events.js";
import { Cell } from "./cell.js";

export class Grid {
    constructor(size) {
        this.size = size;
        this.cells = Array.from({ length: size }, (_, y) =>
            Array.from({ length: size }, (_, x) => new Cell(x, y))
        );
        this.eventQueue = new EventQueue();
        this.burningCells = new Set();  // 用于跟踪所有正在燃烧的单元格
    }

    // Returns the cell at (x, y) if within bounds, otherwise returns null
    getCell(x, y) {
        if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
            return this.cells[y][x];
        }
        return null;  // Return null if out of bounds
    }

    getNeighbors(x, y) {
        // Fetch neighbors while checking bounds
        return [
            this.getCell(x + 1, y),
            this.getCell(x - 1, y),
            this.getCell(x, y + 1),
            this.getCell(x, y - 1),
            this.getCell(x + 1, y + 1),
            this.getCell(x - 1, y - 1),
            this.getCell(x + 1, y - 1),
            this.getCell(x - 1, y + 1)
        ].filter(cell => cell !== null);  // Filter out null values for out-of-bounds cells
    }

    addEvent(event) {
        this.eventQueue.addEvent(event);
    }

    getCurrentTime() {
        return this.eventQueue.getCurrentTime();
    }

    overrideEvent(x,y,type,newEvent){
        this.eventQueue.overrideEvent(x,y,type,newEvent);
    }

    // 添加正在燃烧的单元格到列表中
    addBurningCell(x, y) {
        this.burningCells.add(`${x},${y}`);
    }

    // 从燃烧列表中移除燃尽的单元格
    removeBurningCell(x, y) {
        this.burningCells.delete(`${x},${y}`);
    }
    
    // 获取当前所有正在燃烧的单元格位置
    getBurningCells() {
        return Array.from(this.burningCells).map(pos => {
            const [x, y] = pos.split(",").map(Number);
            return { x, y };
        });
    }

    step() {
        if (!this.eventQueue.isEmpty()) {
            const event = this.eventQueue.getNextEvent();
            event.execute();

            // 优化： 合并相同时间步的事件，但是太快，就不利于观察。
            // this.eventQueue.executeNextTimeStep();
        }
    }

    getRecord() {
        return this.eventQueue.getRecord();
    }

    hasPendingEvents() {
        return !this.eventQueue.isEmpty();
    }
}
