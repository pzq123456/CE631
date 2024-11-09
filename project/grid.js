import { EventQueue } from "./events.js";

// export class Cell {
//     constructor(x, y) {
//         this.x = x;
//         this.y = y;
//         this.status = "unburned"; // possible values: "unburned", "burning", "burned"
//     }
// }

export class Cell {
    constructor(x, y, type = "normal") {
        this.x = x;
        this.y = y;
        this.type = type;  // normal, water, fire-resistant, etc.
        this.status = "unburned"; // 状态：未燃烧、燃烧中、已燃烧
    }

    // 根据格网类型确定燃烧是否可能
    isFlammable() {
        return this.type !== "water" && this.type !== "fire-resistant";
    }

    // 返回此类型的燃烧蔓延概率调整
    getSpreadResistance() {
        switch (this.type) {
            case "fire-resistant": return 0.1;
            case "water": return 0.0;
            default: return 1.0;
        }
    }
}


export class Grid {
    constructor(size) {
        this.size = size;
        this.cells = Array.from({ length: size }, (_, y) =>
            Array.from({ length: size }, (_, x) => new Cell(x, y))
        );
        this.eventQueue = new EventQueue();
    }

    // Returns the cell at (x, y) if within bounds, otherwise returns null
    getCell(x, y) {
        if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
            return this.cells[y][x];
        }
        return null;  // Return null if out of bounds
    }

    getNeighbors(x, y) {
        // Fetch neighbors while checking bounds
        return [
            this.getCell(x + 1, y),
            this.getCell(x - 1, y),
            this.getCell(x, y + 1),
            this.getCell(x, y - 1),
            this.getCell(x + 1, y + 1),
            this.getCell(x - 1, y - 1),
            this.getCell(x + 1, y - 1),
            this.getCell(x - 1, y + 1)
        ].filter(cell => cell !== null);  // Filter out null values for out-of-bounds cells
    }

    addEvent(event) {
        this.eventQueue.addEvent(event);
    }

    step() {
        if (!this.eventQueue.isEmpty()) {
            const event = this.eventQueue.getNextEvent();
            event.execute();
        }
    }

    getRecord() {
        return this.eventQueue.getRecord();
    }

    hasPendingEvents() {
        return !this.eventQueue.isEmpty();
    }
}