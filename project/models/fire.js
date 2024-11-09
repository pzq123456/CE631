import { Event } from "../events.js";

export class FireSpreadEvent extends Event {
    constructor(time, grid, environment, x, y) {
        super(time);
        this.grid = grid;
        this.environment = environment;
        this.x = x;
        this.y = y;
    }

    execute() {
        const cell = this.grid.getCell(this.x, this.y);
        if (cell && cell.status === "unburned") {
            cell.status = "burning";

            // 获取环境条件
            const windDirection = this.environment.getWindDirection();
            const windSpeed = this.environment.getWindSpeed();

            // 记录于当前 cell
            cell.windDirection = windDirection;
            cell.windSpeed = windSpeed;

            // 遍历邻居并传入火焰传播逻辑
            this.forEachNeighbor(this.x, this.y, (neighbor) => {
                if (neighbor.status === "unburned") {
                    const spreadProbability = this.calculateSpreadProbability(neighbor, windDirection);
                    if (Math.random() < spreadProbability) {
                        this.grid.addEvent(new FireSpreadEvent(this.time + 1, this.grid, this.environment, neighbor.x, neighbor.y));
                    }
                }
            });

            // 计算燃烧时间
            const burningTime = Math.floor(Math.random() * 5) + 1 + Math.floor(5 / windSpeed);
            this.grid.addEvent(new BurnOutEvent(this.time + burningTime, this.grid, this.x, this.y));
        }
    }

    // 遍历指定单元格的邻居，并执行传入的操作
    forEachNeighbor(x, y, action) {
        const neighbors = this.grid.getNeighbors(x, y);
        for (let neighbor of neighbors) {
            action(neighbor);
        }
    }

    // 计算火焰传播概率
    calculateSpreadProbability(neighbor, windDirection) {
        const directionFactor = this.getDirectionFactor(neighbor, windDirection);
        const spreadResistance = neighbor.getSpreadResistance();
        return 0.8 * directionFactor * spreadResistance;
    }

    // 计算邻居方向与风向的相关性
    getDirectionFactor(neighbor, windDirection) {
        const neighborDirection = this.getNeighborDirection(neighbor);
        const angleDiff = Math.abs(neighborDirection - this.directionToAngle(windDirection));
        const angleDiffNormalized = Math.min(angleDiff, 2 * Math.PI - angleDiff);
        return Math.cos(angleDiffNormalized);
    }

    // 获取邻居方向
    getNeighborDirection(neighbor) {
        const dx = neighbor.x - this.x;
        const dy = neighbor.y - this.y;
        return Math.atan2(dy, dx);
    }

    directionToAngle(direction) {
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
        const cell = this.grid.getCell(this.x, this.y);
        if (cell) {
            cell.status = "burned";
        }
    }
}
