export class Logger {
    constructor() {
        this.logs = new TimeStepStack();
    }
}

// 数据结构 timeStep Stack
[
    {
        simulationTime: 0,
        events: [
            {
                type: "FireSpreadEvent",
                x: 0,
                y: 0,
                burningTime: 3
            }
        ]
    },
    {
        simulationTime: 1,
        events: [
            {
                type: "FireSpreadEvent",
                x: 0,
                y: 1,
                burningTime: 2
            },
            {
                type: "FireSpreadEvent",
                x: 1,
                y: 0,
                burningTime: 3
            }
        ]
    }
]