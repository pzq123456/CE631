export const defaultColors = [
    '#f7f7f7',
    '#d9f0a3',
    '#addd8e',
    '#78c679',
    '#31a354',
    '#006837',
];

export class Stastics {
    constructor() {
        this._max = 0;
        this._min = 0;
        this._average = 0;
        this._data = [];
    }

    clear() {
        this._max = 0;
        this._min = 0;
        this._average = 0;
        this._data = [];
    }

    update() {
        this.dropna();
        this._max = Math.max(...this._data);
        this._min = Math.min(...this._data);
        this._average = this._data.reduce((a, b) => a + b, 0) / this._data.length;
    }

    dropna() {
        this._data = this._data.filter((value) => value !== null && value !== undefined && !isNaN(value));
    }

    append(value, getVal) {
        this._data.push(...value.map(getVal));
        this.update();
    }

    append2DArr(arr, getVal) {
        if(getVal){
            this._data.push(...arr.map(row => row.map(getVal)).flat());
        }else{
            this._data.push(...arr.flat());
            this.dropna();
        }

        this.update();
    }

    // 增量更新统计值
    updateIncremental(data) {
        for (let value of data) {
            if (value !== null && value !== undefined && !isNaN(value)) {
                this._max = Math.max(this._max, value);
                this._min = Math.min(this._min, value);
                this._average = (this._average * this._data.length + value) / (this._data.length + 1);
                this._data.push(value);
            }
        }
        console.log(this._data);
    }

    get description() {
        return {
            max: this._max,
            min: this._min,
            average: this._average,
        };
    }

    // 根据内置的统计值进行值映射，支持拉伸函数
    mapValue(value, isReverse = false, stretch = 'linear') {
        let mappedValue = (value - this._min) / (this._max - this._min);

        switch (stretch) {
            case 'log': // 对数拉伸
                mappedValue = Math.log10(1 + mappedValue * 9); // 可调整基数
                break;
            case 'exp': // 指数拉伸
                mappedValue = Math.pow(mappedValue, 2); // 可调整指数
                break;
            case 'sqrt': // 平方根拉伸
                mappedValue = Math.sqrt(mappedValue);
                break;
        }

        if (isReverse) {
            return 1 - mappedValue;
        } else {
            return mappedValue;
        }
    }

    mapValue2Color(value, colors = defaultColors, isReverse = false,  stretch = 'linear') {
        let index = Math.floor(this.mapValue(value, isReverse, stretch) * (colors.length - 1));
        return colors[index];
    }

    mvc(value, colors = defaultColors, isReverse = false,  stretch = 'linear') {
        let index = Math.floor(this.mapValue(value, isReverse, stretch) * (colors.length - 1));
        return colors[index];
    }

    getGrades(num, fixed = 2) {

        let grades = [];
    
        // 计算出最大最小值差距
        let range = this._max - this._min;
    
        // 确定一个合适的步长，使得每个区间的范围是整数
        let roughStep = range / num;
    
        // 找到最近的 "漂亮的" 步长 (比如10, 50, 100这样的数字)
        let magnitude = Math.pow(10, Math.floor(Math.log10(roughStep))); // 获得步长的数量级
        let niceStep = Math.ceil(roughStep / magnitude) * magnitude; // 找到适合的步长
    
        // 计算新的分级区间
        let niceMin = Math.floor(this._min / niceStep) * niceStep; // 向下取整到最近的漂亮整数
        let niceMax = Math.ceil(this._max / niceStep) * niceStep;  // 向上取整到最近的漂亮整数
    
        // 生成分级
        for (let i = niceMin; i <= niceMax; i += niceStep) {
            grades.push(i);
        }

        // 保留两位小数
        grades = grades.map(d => d.toFixed(fixed));
    
        return grades;
    }
    
}