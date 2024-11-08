export class Renderer{
    #grid;
    constructor(canvas,grid) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.#grid = grid;
        this.Colors = defaultColors;
    }

    get cellSize() {
        const canvasWidth = this.width;
        const canvasHeight = this.height;
        const { rows, cols } = this.#grid.SIZE;

        return {
            width: canvasWidth / cols,
            height: canvasHeight / rows
        };
    }

    setGrid(grid) {
        this.#grid = grid;
        // this.update();
    }

    setColors(colors) {
        this.Colors = colors;
        // this.update();
    }

    drawGrid() {
        // 根据 grid 自带的 stastics 颜色表进行绘制
        const { rows, cols } = this.#grid.SIZE;
        const { width, height } = this.cellSize;

        const grid = this.#grid;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const value = grid.data[row][col];
                const color = this.#grid.stastics.mvc(value, this.Colors);

                this.ctx.fillStyle = color;
                this.ctx.fillRect(col * width, row * height, width, height);

                // 绘制文字
                this.ctx.fillStyle = 'black';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                // 仅仅保留整数部分
                this.ctx.fillText(value.toFixed(1),col * width + width / 2, row * height + height / 2);

            }
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    update() {
        this.clearCanvas();
        this.render();
    }

    render() {
        // 渲染函数
        // console.log("Rendering...");
        this.drawGrid();
    }
}

export const defaultColors = [
    '#f7f7f7',
    '#d9f0a3',
    '#addd8e',
    '#78c679',
    '#31a354',
    '#006837',
];