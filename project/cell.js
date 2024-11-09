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
