export class Environment {
    constructor(windDirectionDist, windSpeedDist, humidityDist){
        this.windDirectionDist = windDirectionDist;
        this.windSpeedDist = windSpeedDist;
        this.humidityDist = humidityDist;
    }

    // 使用蒙特卡洛模拟生成风速和风向
    getWindDirection() {
        return this.windDirectionDist.sample();
    }

    getWindSpeed() {
        return this.windSpeedDist.sample();
    }

    getHumidity() {
        return this.humidityDist.sample();
    }
}
