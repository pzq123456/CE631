export class Event {
    constructor(time) {
        this.time = time;
    }
    execute() {
        throw new Error("Execute method should be implemented in subclasses");
    }
}

export class EventQueue {
    constructor() {
        this.queue = [];
        this.record = [];
    }

    addEvent(event) {
        this.queue.push(event);
        this.queue.sort((a, b) => a.time - b.time);
    }

    getNextEvent() {
        this.record.push(this.queue[0]);
        return this.queue.shift();
    }

    isEmpty() {
        return this.queue.length === 0;
    }

    getRecord() {
        return this.record;
    }
}