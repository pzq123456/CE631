class RenderStrategy {
    constructor(canvas, gridSize) {
        this.canvas = canvas;
        this.gridSize = gridSize;
        this.width = canvas.width;
        this.height = canvas.height;
        this.context = canvas.getContext("2d");
        this.cellSize = this.width / gridSize;
    }

    render(grid) {
        throw new Error("render() must be implemented in subclass");
    }
}

export class CellRenderer extends RenderStrategy {
    getColor(status) {
        switch (status) {
            case "unburned": return "#9acd32";
            case "burning": return "#ff4500";
            case "burned": return "#555";
            default: return "#ffffff";
        }
    }

    render(grid) {
        for (let y = 0; y < grid.size; y++) {
            for (let x = 0; x < grid.size; x++) {
                const cell = grid.getCell(x, y);
                this.context.fillStyle = this.getColor(cell.status);
                this.context.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
            }
        }
    }
}

export class WindRenderer extends RenderStrategy {
    render(grid) {
        for (let y = 0; y < grid.size; y++) {
            for (let x = 0; x < grid.size; x++) {
                const cell = grid.getCell(x, y);
                const windSpeed = cell.windSpeed;
                const windDirection = cell.windDirection;

                // 使用方向和速度渲染箭头
                if (windSpeed && windDirection) {
                    this.drawWindArrow(x, y, windSpeed, windDirection);
                }
            }
        }
    }

    drawWindArrow(x, y, speed, direction) {
        const ctx = this.context;
        const length = speed * this.cellSize * 0.1;
        const angle = this.directionToAngle(direction);

        const centerX = x * this.cellSize + this.cellSize / 2;
        const centerY = y * this.cellSize + this.cellSize / 2;
        const toX = centerX + length * Math.cos(angle);
        const toY = centerY + length * Math.sin(angle);

        this.drawArrow(ctx, centerX, centerY, toX, toY, "white");


        ctx.stroke();
    }

    drawArrow(ctx, fromX, fromY, toX, toY, color) {
        const headlen = 10;   // length of head in pixels
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();

        // draw arrowhead
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }

    directionToAngle(direction) {
        const directions = { "N": -Math.PI / 2, "NE": -Math.PI / 4, "E": 0, "SE": Math.PI / 4, "S": Math.PI / 2, "SW": 3 * Math.PI / 4, "W": Math.PI, "NW": -3 * Math.PI / 4 };
        return directions[direction] || 0;
    }
}

export class FirefighterRenderer extends RenderStrategy {
    constructor(canvas, gridSize, firefighters) {
        super(canvas, gridSize);
        this.firefighters = firefighters;  // 传入消防员对象数组
    }

    render(grid) {
        // 统计每个单元格内的消防员数量
        const cellCounts = new Map();

        for (const firefighter of this.firefighters) {
            const key = `${firefighter.x},${firefighter.y}`;
            cellCounts.set(key, (cellCounts.get(key) || 0) + 1);
        }

        // 绘制每个消防员
        for (const firefighter of this.firefighters) {
            this.drawFirefighter(firefighter, cellCounts);
        }
    }

    drawFirefighter(firefighter, cellCounts) {
        const ctx = this.context;
        const x = firefighter.x * this.cellSize;
        const y = firefighter.y * this.cellSize;

        // 若消防员体力为 0，或水量为 0，则绘制为黑色并跳过
        if (firefighter.stamina <= 0 || firefighter.water <= 0) {
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.arc(x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize / 3, 0, 2 * Math.PI);
            ctx.fill();
            return;
        }

        // 绘制消防员的圆形表示
        ctx.fillStyle = "#0000FF";  // 消防员的颜色
        ctx.beginPath();
        ctx.arc(x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize / 3, 0, 2 * Math.PI);
        ctx.fill();

        // 绘制消防员的方向箭头
        const direction = firefighter.direction;
        if (direction) {
            this.drawArrow(ctx, x + this.cellSize / 2, y + this.cellSize / 2, direction);
        }

        // 在单元格内绘制消防员数量
        const key = `${firefighter.x},${firefighter.y}`;
        const count = cellCounts.get(key);
        if (count > 1) {
            ctx.fillStyle = "white";
            ctx.font = "24px Arial";
            ctx.fillText(count, x + this.cellSize / 2 - 10, y + this.cellSize / 2 + 10);
        }else{
            // 消防员的状态
            ctx.fillStyle = "#000000";
            ctx.font = "24px Arial";
            ctx.fillText(firefighter.stamina, x + this.cellSize / 2 - 10, y + this.cellSize / 2 + 10);

        }
    }

    drawArrow(ctx, x, y, direction) {
        const length = this.cellSize / 2;
        const angle = this.directionToAngle(direction);

        const toX = x + length * Math.cos(angle);
        const toY = y + length * Math.sin(angle);

        this.drawArrowHead(ctx, x, y, toX, toY);
    }

    drawArrowHead(ctx, fromX, fromY, toX, toY) {
        const headlen = 10;   // length of head in pixels
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        ctx.stroke();

        // draw arrowhead
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }

    directionToAngle(direction) {
        const directions = { "N": -Math.PI / 2, "NE": -Math.PI / 4, "E": 0, "SE": Math.PI / 4, "S": Math.PI / 2, "SW": 3 * Math.PI / 4, "W": Math.PI, "NW": -3 * Math.PI / 4 };
        return directions[direction] || 0;
    }
}


// 信息渲染测略，将当前时间步渲染在画布上 左上角
export class InfoRenderer extends RenderStrategy {
    render(grid) {
        this.context.fillStyle = "#000000";
        this.context.font = "20px Arial";
        this.context.fillText(`Time: ${grid.getCurrentTime()}`, 10, 30);
    }
}

export class Renderer {
    constructor(canvas, cellSize) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.cellSize = cellSize;
        this.strategies = [];
        this.infoRenderer = new InfoRenderer(canvas, cellSize);
    }

    addStrategy(strategy) {
        this.strategies.push(strategy);
    }

    render(grid) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 调用所有策略的渲染方法
        for (const strategy of this.strategies) {
            strategy.render(grid);
        }

        // 信息渲染策略
        this.infoRenderer.render(grid);
    }
}
