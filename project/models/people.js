import { Event } from '../events.js';  
// import { BurnOutEvent } from './fire.js';

export class Firefighter {
    constructor(grid, x, y, extinguishTime = 3) {
        this.grid = grid;               // 网格引用
        this.x = x;                     // 消防员初始 x 坐标
        this.y = y;                     // 消防员初始 y 坐标
        this.extinguishTime = extinguishTime;  // 每个单元的灭火时间

        this.isFreezed = false;  // 消防员是否被冻结

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

        if(this.isFreezed){
            return;  // 消防员被冻结，无法行动
        }

        const cell = this.grid.getCell(this.x, this.y);

        if (cell && cell.status === "burning" && this.water > 0 && this.stamina > 0) {
            if(!cell.occupant){
                this.grid.addEvent(new ExtinguishStart(this.grid.eventQueue.currentTime + 1, this.grid, this.x, this.y, this));
                this.grid.addEvent(new ExtinguishedEvent(this.grid.eventQueue.currentTime + this.extinguishTime, this.grid, this.x, this.y, this));
            }else{
                this.moveTowardsFire();  // 移动到下一个着火区域
            }
        } else if (cell && cell.status === "unburned") {
            // 有一定概率铺设隔离带
            if (Math.random() < 0.5) {
                this.setFireBreak(cell);
            }
        }else {
            this.moveTowardsFire();  // 移动到下一个着火区域
        }
    }

    //铺设隔离带 将当前单元格 标记为燃尽状态
    setFireBreak() {
        // 检查体力
        if (this.stamina <= 0) {
            return;  // 无法继续行动
        }else{
            this.stamina -= 20;
            // cell.status = "burned";
            this.grid.addEvent(new SetFireBreakEvent(this.grid.eventQueue.currentTime + 1, this.grid, this.x, this.y));
        }
    }

    // 搜索离消防员最近的燃烧单元格，并每次朝该方向移动一步
    moveTowardsFire() {
        if (this.stamina <= 0) {
            return;  // 无法继续移动
        }

        // const target = this.findNearestBurningCells(1)[0];
        
        // 在多个目标间选择一个
        const targets = this.findNearestBurningCells(3);
        // 将四个角的目标单元格添加到目标列表中
        targets.push({x: 0, y: 0});
        targets.push({x: 0, y: this.grid.size - 1});
        targets.push({x: this.grid.size - 1, y: 0});
        targets.push({x: this.grid.size - 1, y: this.grid.size - 1});
        const target = targets[Math.floor(Math.random() * targets.length)];

        // 计算下一个移动的方向
        const dx = target.x - this.x;
        const dy = target.y - this.y;


        const dxOffset = Math.floor(Math.random() * 1 - 1);
        const dyOffset = Math.floor(Math.random() * 1 - 1);


        const nextX = this.x + (dx > 0 ? 1 : dx < 0 ? -1 : 0);
        const nextY = this.y + (dy > 0 ? 1 : dy < 0 ? -1 : 0);

        this.move(nextX + dxOffset, nextY + dyOffset);

        this.direction = dx > 0 ? (dy > 0 ? "SE" : dy < 0 ? "NE" : "E") : dx < 0 ? (dy > 0 ? "SW" : dy < 0 ? "NW" : "W") : dy > 0 ? "S" : "N";

        // 消耗体力
        this.stamina -= 5;
    }

    findNearestBurningCells(maxResults = 3) {
        const burningCells = this.grid.getBurningCells();
        const results = [];
        for (let cell of burningCells) {
            results.push(cell);
            if (results.length >= maxResults) {
                return results;
            }
        }

        return results.length > 0 ? results : null;

    }
    
}

// FirefighterEvent 事件，用于管理消防员行为
export class FirefighterEvent extends Event {
    constructor(time, firefighter) {
        super(time);
        this.firefighter = firefighter;
        this.x = firefighter.x;
        this.y = firefighter.y;
        this.extinguishTime = firefighter.extinguishTime;  // 每个单元的灭火时间
        this.remainingTime = firefighter.extinguishTime;   // 剩余

        // 消防员的体力和水量
        this.stamina = firefighter.stamina;
        this.water = firefighter.water;
    }

    execute() {
        this.firefighter.act();
        // 继续安排下一个消防员事件
        // this.firefighter.grid.addEvent(new FirefighterEvent(this.time + 1, this.firefighter));
        if (this.firefighter.stamina > 0 && this.firefighter.water > 0) {
            this.firefighter.grid.addEvent(new FirefighterEvent(this.time + 1, this.firefighter));
        }else{
            // 消防员失效事件
            this.firefighter.grid.addEvent(new FirefighterFailureEvent(this.time + 1, this.firefighter));
        }
    }
}

// 消防员失效事件 用于处理消防员体力和水量耗尽的情况
export class FirefighterFailureEvent extends Event {
    constructor(time, firefighter) {
        super(time);
        this.firefighter = firefighter;
        this.x = firefighter.x;
        this.y = firefighter.y;

        // 消防员的体力和水量
        this.stamina = firefighter.stamina;
        this.water = firefighter.water;
    }

    execute() {
        // 消防员失效
        this.firefighter.stamina = 0;
        this.firefighter.water = 0;
    }
}

// 铺设隔离带事件
export class SetFireBreakEvent extends Event {
    constructor(time, grid, x, y) {
        super(time);
        this.grid = grid;
        this.x = x;
        this.y = y;
    }

    execute() {
        const cell = this.grid.getCell(this.x, this.y);
        if (cell && cell.status === "unburned") {
            cell.status = "burned";
        }
    }
}

export class ExtinguishStart extends Event {
    constructor(time, grid, x, y, firefighter) {
        super(time);
        this.grid = grid;
        this.x = x;
        this.y = y;
        this.firefighter = firefighter;
    }

    execute() {
        const cell = this.grid.getCell(this.x, this.y);
        cell.occupant = this.firefighter;
        this.firefighter.isFreezed = true;
    }
}

// 消防员灭火事件
export class ExtinguishedEvent extends Event {
    constructor(time, grid, x, y, firefighter) {
        super(time);
        this.grid = grid;
        this.x = x;
        this.y = y;
        this.firefighter = firefighter;
    }

    execute() {
        const cell = this.grid.getCell(this.x, this.y);
        if (cell && cell.status === "burning") {
            cell.status = "burned";
        }
        cell.occupant = null;
        this.firefighter.isFreezed = false;

        // 一次性消耗水量
        this.firefighter.water -= 10;
        // 一次性消耗体力
        this.firefighter.stamina -= 10;
    }
}
