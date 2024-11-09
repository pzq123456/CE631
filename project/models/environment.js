export class Environment {
    constructor(windDirectionDist, windSpeedDist) {
        this.windDirectionDist = windDirectionDist;
        this.windSpeedDist = windSpeedDist;
    }

    // 使用蒙特卡洛模拟生成风速和风向
    getWindDirection() {
        return this.windDirectionDist.sample();
    }

    getWindSpeed() {
        return this.windSpeedDist.sample();
    }
}
