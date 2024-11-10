import { Event } from '../events.js';  // 假设有一个事件基类
import { BurnOutEvent } from './fire.js';

export class Firefighter {
    constructor(grid, x, y, extinguishTime = 1) {
        this.grid = grid;               // 网格引用
        this.x = x;                     // 消防员初始 x 坐标
        this.y = y;                     // 消防员初始 y 坐标
        this.extinguishTime = extinguishTime;  // 每个单元的灭火时间
        this.remainingTime = extinguishTime;   // 剩余灭火时间计数器

        // 消防员的体力和水量
        this.stamina = 200;
        this.water = 100;

        // move direction // N, NE, E, SE, S, SW, W, NW
        this.direction = null;

        this.target = null;
    }

    // 移动到目标单元格（如果不是燃烧单元格）
    move(targetX, targetY) {
        const targetCell = this.grid.getCell(targetX, targetY);
        if (targetCell) {
            this.x = targetX;
            this.y = targetY;
        }
    }

    // 执行消防员的行为
    act() {
        const cell = this.grid.getCell(this.x, this.y);

        if (cell && cell.status === "burning") {
            
            // 判断是否有足够的体力和水量
            if (this.stamina <= 0 || this.water <= 0) {
                return;  // 无法继续灭火
            }else{
                // 消防员灭火
                this.extinguish(cell);
            }

        } else {
            this.remainingTime = this.extinguishTime;  // 重置灭火计时器
            // this.moveTowardsFire();  // 移动到下一个着火区域

            if (this.stamina <= 0) {
                return;  // 无法继续移动
            }else{
                this.moveTowardsFire();  // 移动到下一个着火区域
            }
        }
    }

    // 执行灭火动作
    extinguish(cell) {
        if (this.remainingTime > 0) {
            this.remainingTime--;
        } else {
            if (cell.remainingTime > 0) {
                cell.remainingTime--;
            } else {
                // overrideEvent
                this.grid.overrideEvent(this.x, this.y, BurnOutEvent, new BurnOutEvent(this.grid.eventQueue.currentTime + 1, this.grid, this.x, this.y));
                cell.status = "burned";
                this.remainingTime = this.extinguishTime;  // 重置灭火计时器
            }

            // 消耗体力和水量
            this.stamina -= 10;
            this.water -= 10;
        }
    }

    // 搜索离消防员最近的燃烧单元格，并每次朝该方向移动一步
    moveTowardsFire() {
        if (this.stamina <= 0) {
            return;  // 无法继续移动
        }

        if (!this.target || this.grid.getCell(this.target.x, this.target.y).status !== "burning") {
            // this.target = this.findNearestBurningCell();
            // 从候选列表中随机选择一个
            const candidates = this.findNearestBurningCells();
            this.target = candidates ? candidates[Math.floor(Math.random() * candidates.length)] : null;
        }

        const target = this.target;

        if (!target) {
            this.stamina = 0;  // 停止行动
            return;
        }

        // 计算下一个移动的方向
        const dx = target.x - this.x;
        const dy = target.y - this.y;

        const nextX = this.x + (dx > 0 ? 1 : dx < 0 ? -1 : 0);
        const nextY = this.y + (dy > 0 ? 1 : dy < 0 ? -1 : 0);

        this.move(nextX, nextY);

        this.direction = dx > 0 ? (dy > 0 ? "SE" : dy < 0 ? "NE" : "E") : dx < 0 ? (dy > 0 ? "SW" : dy < 0 ? "NW" : "W") : dy > 0 ? "S" : "N";

        // 消耗体力
        this.stamina -= 10;
    }

    findNearestBurningCells(maxResults = 3) {
        const queue = [{ x: this.x, y: this.y }];
        const visited = new Set([`${this.x},${this.y}`]);
        const results = [];
    
        while (queue.length > 0) {
            const { x, y } = queue.shift();  // 若使用双端队列，改用 queue.pop() 提升效率
            const cell = this.grid.getCell(x, y);
    
            if (cell && cell.status === "burning") {
                results.push({ x, y });
                if (results.length >= maxResults) {
                    return results;  // 找到足够的燃烧单元格则立即返回
                }
            }
    
            // 遍历相邻单元格
            for (const neighbor of this.grid.getNeighbors(x, y)) {
                const key = `${neighbor.x},${neighbor.y}`;
                if (!visited.has(key) && neighbor.status !== "burned") {
                    queue.push({ x: neighbor.x, y: neighbor.y });
                    visited.add(key);
                }
            }
        }
    
        return results.length > 0 ? results : null;  // 返回所有找到的燃烧单元格，若无则返回 null
    }
    
}

// FirefighterEvent 事件，用于管理消防员行为
export class FirefighterEvent extends Event {
    constructor(time, firefighter) {
        super(time);
        this.firefighter = firefighter;
    }

    execute() {
        this.firefighter.act();
        // 继续安排下一个消防员事件
        // this.firefighter.grid.addEvent(new FirefighterEvent(this.time + 1, this.firefighter));
        if (this.firefighter.stamina > 0 && this.firefighter.water > 0) {
            this.firefighter.grid.addEvent(new FirefighterEvent(this.time + 1, this.firefighter));
        }
    }
}
