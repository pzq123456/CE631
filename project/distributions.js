// distributions.js for Monte Carlo Simulation

class MonteCarloDistribution {
    constructor() {
        if (this.constructor === MonteCarloDistribution) {
            throw new Error("Cannot instantiate abstract class MonteCarloDistribution");
        }
    }

    // 抽象方法：生成符合分布的随机样本
    sample() {
        throw new Error("sample() must be implemented in subclass");
    }

    // 可选：打印分布的描述
    describe() {
        throw new Error("describe() must be implemented in subclass");
    }
}

export class GaussianDistribution extends MonteCarloDistribution {
    constructor(mean, standardDeviation) {
        super();
        this.mean = mean;
        this.standardDeviation = standardDeviation;
    }

    // 使用 Box-Muller 变换生成正态分布随机数
    sample() {
        let u1 = Math.random();
        let u2 = Math.random();
        let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return this.mean + z0 * this.standardDeviation;
    }

    describe() {
        return `Gaussian Distribution with mean ${this.mean} and standard deviation ${this.standardDeviation}`;
    }
}

export class DiscreteDistribution extends MonteCarloDistribution {
    constructor(probabilityMap) {
        super();
        this.probabilityMap = probabilityMap;
        this.keys = Object.keys(probabilityMap);
        this.values = Object.values(probabilityMap);

        // 创建累积分布
        this.cumulativeProbabilities = [];
        this._buildCumulative();
    }

    _buildCumulative() {
        let cumulativeSum = 0;
        for (let i = 0; i < this.values.length; i++) {
            cumulativeSum += this.values[i];
            this.cumulativeProbabilities[i] = cumulativeSum;
        }
    }

    sample() {
        const rand = Math.random();
        for (let i = 0; i < this.cumulativeProbabilities.length; i++) {
            if (rand <= this.cumulativeProbabilities[i]) {
                return this.keys[i];
            }
        }
        return this.keys[this.keys.length - 1]; // 返回最后一个值作为默认
    }

    describe() {
        return `Discrete Distribution with probabilities: ${JSON.stringify(this.probabilityMap)}`;
    }
}

