export class Event {
    constructor(time) {
        this.time = time;
    }
    execute() {
        throw new Error("Execute method should be implemented in subclasses");
    }
}

// export class EventQueue {
//     constructor() {
//         this.queue = [];
//         this.record = [];
//         this.currentTime = 0;
//     }

//     addEvent(event) {
//         this.queue.push(event);
//         this.queue.sort((a, b) => a.time - b.time);
//     }

//     getNextEvent() {
//         this.record.push(this.queue[0]);
//         this.currentTime = this.queue[0].time;
//         return this.queue.shift();
//     }

//     isEmpty() {
//         return this.queue.length === 0;
//     }

//     getRecord() {
//         return this.record;
//     }

//     getEvent(x, y, type) {
//         return this.record.filter(e => e instanceof type && e.x === x && e.y === y);
//     }

//     overrideEvent(x,y,type,newEvent){
//         // queue 中寻找对应的事件 并替换
//         for(let i = 0;i<this.queue.length;i++){
//             if(this.queue[i] instanceof type && this.queue[i].x === x && this.queue[i].y === y){
//                 this.queue[i] = newEvent;
//             }
//         }
//     }

//     getCurrentTime() {
//         return this.currentTime;
//     }
// }


export class EventQueue {
    constructor() {
        this.queue = [];
        this.record = [];
        this.currentTime = 0;
    }

    addEvent(event) {
        this.queue.push(event);
        this.queue.sort((a, b) => a.time - b.time);
    }
    
    getNextEvent() {
        this.record.push(this.queue[0]);
        this.currentTime = this.queue[0].time;
        return this.queue.shift();
    }

    getNextEventsForSameTime() {
        // 检查队列的第一个事件的时间
        if (this.queue.length === 0) return [];

        const eventsAtSameTime = [];
        const targetTime = this.queue[0].time;

        // 提取所有与 targetTime 相同时间的事件
        while (this.queue.length > 0 && this.queue[0].time === targetTime) {
            const event = this.queue.shift();
            eventsAtSameTime.push(event);
            this.record.push(event);
        }

        // 更新 currentTime 为批处理的时间步
        this.currentTime = targetTime;
        return eventsAtSameTime;
    }

    executeNextTimeStep() {
        const eventsToExecute = this.getNextEventsForSameTime();
        eventsToExecute.forEach(event => event.execute());
    }

    isEmpty() {
        return this.queue.length === 0;
    }

    getRecord() {
        return this.record;
    }

    getEvent(x, y, type) {
        return this.record.filter(e => e instanceof type && e.x === x && e.y === y);
    }

    overrideEvent(x, y, type, newEvent) {
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i] instanceof type && this.queue[i].x === x && this.queue[i].y === y) {
                this.queue[i] = newEvent;
            }
        }
        this.queue.sort((a, b) => a.time - b.time);  // 保证队列顺序
    }

    getCurrentTime() {
        return this.currentTime;
    }
}
