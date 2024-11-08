import { Stastics } from "./stastics.js";

/**
 * cell grid
 * (0,0) ------> x
 * |
 * |
 * |
 * y
 */

// grid.js
export class Grid {
    #data; // 私有属性
    #statsNeedUpdate = true; // 标记统计更新的需求

    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.#data = new Float32Array(rows * cols); // 使用一维数组存储数据
        this.stastics = new Stastics();
        this.updateStastics(); // 初始化统计
    }

    get SIZE() {
        return { rows: this.rows, cols: this.cols };
    }

    // 获取某一位置的值
    getCell(x, y) {
        return this.#data[x * this.cols + y];
    }

    // 修改某一位置的值，延迟更新统计
    setCell(x, y, value) {
        this.#data[x * this.cols + y] = value;
        this.#statsNeedUpdate = true; // 标记统计需要更新

        this.updateStastics();
    }

    // 批量更新某些值
    setCells(cells) {
        for (const { x, y, value } of cells) {
            this.#data[x * this.cols + y] = value;
        }
        this.#statsNeedUpdate = true; // 标记统计需要更新
    }

    // 延迟更新统计，仅在需要时更新
    updateStastics() {
        if (this.#statsNeedUpdate) {
            this.stastics.updateIncremental(this.#data); // 使用增量更新统计值
            this.#statsNeedUpdate = false;
            console.log('update stastics');
            console.log(this.stastics.description);
        }
    }

    // 暴露给外部的更新接口 建议在animate函数中调用
    update(){
        this.updateStastics();
    }

    get description() {
        this.updateStastics();
        return this.stastics.description;
    }

    // 返回二维数组形式的数据
    get data() {
        const data = [];
        for (let i = 0; i < this.rows; i++) {
            data.push(this.#data.slice(i * this.cols, (i + 1) * this.cols));
        }
        return data;
    }
}

function create2DArray(rows, cols) {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
}

// test fun
function createRandom2DArray(rows, cols) {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random()));
}

export class GridGroup {
    constructor() {

    }
}
