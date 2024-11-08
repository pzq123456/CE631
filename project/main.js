class Logger {
    static log(message) {
        console.log(`[${new Date().toISOString()}] ${message}`);
    }
}

class Event {
    constructor(time) {
        this.time = time;
    }
    execute() {
        throw new Error("Execute method should be implemented in subclasses");
    }
}

class FireSpreadEvent extends Event {
    constructor(time, grid, x, y) {
        super(time);
        this.grid = grid;
        this.x = x;
        this.y = y;
    }

    execute() {
        Logger.log(`Executing FireSpreadEvent at (${this.x}, ${this.y}) on ${this.time}`);
        const cell = this.grid.getCell(this.x, this.y);
        if (cell && cell.status === "unburned") {
            cell.status = "burning";

            // Schedule fire spread to neighboring cells
            const neighbors = this.grid.getNeighbors(this.x, this.y);
            for (let neighbor of neighbors) {
                if (neighbor.status === "unburned" && Math.random() > 0.3) {
                    this.grid.addEvent(new FireSpreadEvent(this.time + 1, this.grid, neighbor.x, neighbor.y));
                }
            }

            // Schedule the cell to burn out
            this.grid.addEvent(new BurnOutEvent(this.time + 2, this.grid, this.x, this.y));
        }
    }
}

class BurnOutEvent extends Event {
    constructor(time, grid, x, y) {
        super(time);
        this.grid = grid;
        this.x = x;
        this.y = y;
    }

    execute() {
        Logger.log(`Executing BurnOutEvent at (${this.x}, ${this.y})`);
        const cell = this.grid.getCell(this.x, this.y);
        if (cell) {
            cell.status = "burned";
        }
    }
}

class EventQueue {
    constructor() {
        this.queue = [];
    }

    addEvent(event) {
        this.queue.push(event);
        this.queue.sort((a, b) => a.time - b.time);
    }

    getNextEvent() {
        return this.queue.shift();
    }

    isEmpty() {
        return this.queue.length === 0;
    }
}

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.status = "unburned"; // possible values: "unburned", "burning", "burned"
    }
}

class Grid {
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
}

class Renderer {
    constructor(canvas, cellSize) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.cellSize = cellSize;
    }

    render(grid) {
        const ctx = this.context;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < grid.size; y++) {
            for (let x = 0; x < grid.size; x++) {
                const cell = grid.getCell(x, y);
                ctx.fillStyle = this.getColor(cell.status);
                ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
            }
        }
    }

    getColor(status) {
        switch (status) {
            case "unburned": return "#9acd32";  // green
            case "burning": return "#ff4500";   // red
            case "burned": return "#555";       // gray
            default: return "#ffffff";          // white
        }
    }
}

// Initialize canvas, renderer, and grid
const canvas = document.getElementById("canvas");
const gridSize = 10;
const cellSize = 100;
const renderer = new Renderer(canvas, cellSize);
const grid = new Grid(gridSize);
renderer.render(grid);

// Add initial fire event at the center
grid.addEvent(new FireSpreadEvent(0, grid, Math.floor(gridSize / 2), Math.floor(gridSize / 2)));

// Simulation control and rendering loop
let simulationSpeed = 1;  // Adjust this to control the simulation speed
function simulationLoop() {
    for (let i = 0; i < simulationSpeed; i++) {
        grid.step();
    }
    setTimeout(simulationLoop, 10);  // Simulation frequency
}

function renderLoop() {
    renderer.render(grid);
    requestAnimationFrame(renderLoop);  // Render at the browser's frame rate
}

simulationLoop();
renderLoop();
