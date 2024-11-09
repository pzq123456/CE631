import { Event } from "../events.js";
import { log } from "../logger.js";

export class FireSpreadEvent extends Event {
    constructor(time, grid, environment, x, y) {
        super(time);
        this.grid = grid;
        this.environment = environment;
        this.x = x;
        this.y = y;
    }

    execute() {
        log(`Executing FireSpreadEvent at (${this.x}, ${this.y}) on ${this.time}`);
        const cell = this.grid.getCell(this.x, this.y);
        if (cell && cell.status === "unburned") {
            cell.status = "burning";

            const neighbors = this.grid.getNeighbors(this.x, this.y);
            const windDirection = this.environment.getWindDirection();
            const windSpeed = this.environment.getWindSpeed();

            // 记录于当前 cell
            cell.windDirection = windDirection;
            cell.windSpeed = windSpeed;

            for (let neighbor of neighbors) {
                if (neighbor.status === "unburned") {
                    // 计算邻居方向与风向的相关性
                    const directionFactor = this._getDirectionFactor(neighbor, windDirection);
                    const spreadResistance = neighbor.getSpreadResistance();
                    const spreadProbability = 0.8 * directionFactor * spreadResistance;

                    if (Math.random() < spreadProbability) {
                        this.grid.addEvent(new FireSpreadEvent(this.time + 1, this.grid, this.environment, neighbor.x, neighbor.y));
                    }
                }
            }

            // const burningTime = Math.floor(Math.random() * 5) + 1;
            // 风速越大，燃烧时间越短
            const burningTime = Math.floor(Math.random() * 5) + 1 + Math.floor(5 / windSpeed);
            
            log(`Burning time for (${this.x}, ${this.y}) is ${burningTime}`, "error");
            this.grid.addEvent(new BurnOutEvent(this.time + burningTime, this.grid, this.x, this.y));
        }
    }

    // 计算邻居方向与风向的相关性
    _getDirectionFactor(neighbor, windDirection) {
        const neighborDirection = this._getNeighborDirection(neighbor);
        const angleDiff = Math.abs(neighborDirection - this._directionToAngle(windDirection));
        const angleDiffNormalized = Math.min(angleDiff, 2 * Math.PI - angleDiff);
        const directionFactor = Math.cos(angleDiffNormalized);
        return directionFactor;
    }

    // 获取邻居方向
    _getNeighborDirection(neighbor) {
        const dx = neighbor.x - this.x;
        const dy = neighbor.y - this.y;
        return Math.atan2(dy, dx);
    }

    _directionToAngle(direction) {
        const directions = { "N": -Math.PI / 2, "NE": -Math.PI / 4, "E": 0, "SE": Math.PI / 4, "S": Math.PI / 2, "SW": 3 * Math.PI / 4, "W": Math.PI, "NW": -3 * Math.PI / 4 };
        return directions[direction] || 0;
    }
}


export class BurnOutEvent extends Event {
    constructor(time, grid, x, y) {
        super(time);
        this.grid = grid;
        this.x = x;
        this.y = y;
    }

    execute() {
        log(`Executing BurnOutEvent at (${this.x}, ${this.y}) on ${this.time}`,"warn");

        const cell = this.grid.getCell(this.x, this.y);
        if (cell) {
            cell.status = "burned";
        }
    }
}