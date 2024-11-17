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
        if (!cell) return;
    
        if (cell.status === "unburned") {
            cell.status = "burning";
            cell.remainingBurnTime = Math.floor(Math.random() * 30) + 1 + Math.floor(5 / this.environment.getWindSpeed());
            cell.windDirection = this.environment.getWindDirection();
            cell.windSpeed = this.environment.getWindSpeed();

            cell.humidity = this.environment.getHumidity();

            this.grid.addBurningCell(this.x, this.y);

        }else if (cell.status === "burned") {
            return;
        }else{
            cell.remainingBurnTime--;
        }
    
    
        // 遍历相邻单元格并标记它们用于扩散
        this.forEachNeighbor(this.x, this.y, (neighbor) => {
            if (neighbor.status === "unburned") {
                const spreadProbability = this.calculateSpreadProbability(neighbor, cell.windDirection, cell.windSpeed, cell.humidity);
                if (Math.random() < spreadProbability) {
                    this.grid.addEvent(new FireSpreadEvent(this.time + 1, this.grid, this.environment, neighbor.x, neighbor.y));
                }
            }
        });
    
        if (cell.remainingBurnTime <= 0) {
            this.grid.addEvent(new BurnOutEvent(this.time + 1, this.grid, this.x, this.y));
        } else {
            this.grid.addEvent(new FireSpreadEvent(this.time + 1, this.grid, this.environment, this.x, this.y));
        }
    }
    calculateSpreadProbability(neighbor, windDirection, windSpeed, humidity) {
        const directionFactor = this.getDirectionFactor(neighbor, windDirection);
        const spreadResistance = neighbor.getSpreadResistance();
        const humidityFactor = this.getHumidityFactor(humidity);
    
        // 加入湿度因子的传播概率公式
        const probability = 0.8 * directionFactor * spreadResistance * (1 - Math.exp(-0.25 * windSpeed)) * humidityFactor;
        return probability;
    }
    
    getHumidityFactor(humidity) {
        return Math.max(0.5, 1 - humidity / 100);
    }
    
    getDirectionFactor(neighbor, windDirection) {
        const neighborDirection = this.getNeighborDirection(neighbor);
        const angleDiff = Math.abs(neighborDirection - this.directionToAngle(windDirection));
        const angleDiffNormalized = Math.min(angleDiff, 2 * Math.PI - angleDiff);
        return Math.cos(angleDiffNormalized);
    }
    
    getNeighborDirection(neighbor) {
        const dx = neighbor.x - this.x;
        const dy = neighbor.y - this.y;
        return Math.atan2(dy, dx);
    }
    
    directionToAngle(direction) {
        const directions = {
            "N": -Math.PI / 2,
            "NE": -Math.PI / 4,
            "E": 0,
            "SE": Math.PI / 4,
            "S": Math.PI / 2,
            "SW": 3 * Math.PI / 4,
            "W": Math.PI,
            "NW": -3 * Math.PI / 4
        };
        return directions[direction] || 0;
    }
    // calculateSpreadProbability(neighbor, windDirection, windSpeed, humidity) {
    //     const directionFactor = this.getDirectionFactor(neighbor, windDirection);
    //     const spreadResistance = neighbor.getSpreadResistance();
    //     const probability = 0.8 * directionFactor * spreadResistance * (1 - Math.exp(-0.25 * windSpeed));
    //     return probability;
    // }

    // getDirectionFactor(neighbor, windDirection) {
    //     const neighborDirection = this.getNeighborDirection(neighbor);
    //     const angleDiff = Math.abs(neighborDirection - this.directionToAngle(windDirection));
    //     const angleDiffNormalized = Math.min(angleDiff, 2 * Math.PI - angleDiff);
    //     return Math.cos(angleDiffNormalized);
    // }

    // getNeighborDirection(neighbor) {
    //     const dx = neighbor.x - this.x;
    //     const dy = neighbor.y - this.y;
    //     return Math.atan2(dy, dx);
    // }

    // directionToAngle(direction) {
    //     const directions = { "N": -Math.PI / 2, "NE": -Math.PI / 4, "E": 0, "SE": Math.PI / 4, "S": Math.PI / 2, "SW": 3 * Math.PI / 4, "W": Math.PI, "NW": -3 * Math.PI / 4 };
    //     return directions[direction] || 0;
    // }

    forEachNeighbor(x, y, action) {
        const neighbors = this.grid.getNeighbors(x, y);
        for (let neighbor of neighbors) {
            action(neighbor);
        }
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
            this.grid.removeBurningCell(this.x, this.y);
        }
    }
}

