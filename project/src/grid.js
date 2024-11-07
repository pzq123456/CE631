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
    constructor(rows,cols){
        this.rows = rows;
        this.cols = cols;
        // this.data = create2DArray(rows,cols);
        this.data = createRandom2DArray(rows,cols);
        this.stastics = new Stastics();
        this.stastics.append2DArr(this.data);
    }

    get SIZE(){
        return {
            rows: this.rows,
            cols: this.cols,
        };
    }

    test(){
        console.log(this.data);
        console.log(this.stastics.desciption);
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
