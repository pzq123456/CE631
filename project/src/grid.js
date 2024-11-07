import { Stastics } from "./stastics.js";

/**
 * cell grid
 * (0,0) ------> x
 * |
 * |
 * |
 * y
 */

export class Grid {
    #data; // 私有属性

    constructor(rows,cols){
        this.rows = rows;
        this.cols = cols;
        // this.data = create2DArray(rows,cols);
        this.#data = createRandom2DArray(rows,cols);
        this.stastics = new Stastics();
        // this.stastics.append2DArr(this.data);
        this.updateStastics();
    }

    get SIZE(){
        return {
            rows: this.rows,
            cols: this.cols,
        };
    }

    // 修改某一位置的值
    setCell(x,y,value){
        this.#data[x][y] = value;
        this.updateStastics();
    }

    updateStastics(){
        this.stastics.clear();
        this.stastics.append2DArr(this.#data);
    }

    get data(){
        return this.#data;
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
