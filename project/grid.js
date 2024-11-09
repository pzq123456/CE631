import { EventQueue } from "./events.js";
import { Cell } from "./cell.js";

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