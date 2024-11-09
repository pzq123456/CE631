class RenderStrategy {
    constructor(context, cellSize) {
        this.context = context;
        this.cellSize = cellSize;
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

export class Renderer {
    constructor(canvas, cellSize) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.cellSize = cellSize;
        this.strategies = [];
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
    }
}
