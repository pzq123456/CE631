export class Controller {
    #controlCanvas;
    #grid;
    #events;
    #mousePosition;

    constructor(controlCanvas, grid) {
        this.#controlCanvas = controlCanvas;
        this.#grid = grid;
        this.#events = new Events(controlCanvas); // 将 controlCanvas 传入 Events 类
        this.#mousePosition = { x: 0, y: 0, row: 0, col: 0 };

        this.#initEvents();
    }

    /**
     * 计算并返回格网单元的大小
     */
    get cellSize() {
        const canvasWidth = this.#controlCanvas.width;
        const canvasHeight = this.#controlCanvas.height;
        const { rows, cols } = this.#grid.SIZE;

        return {
            width: canvasWidth / cols,
            height: canvasHeight / rows
        };
    }

    /**
     * 初始化事件绑定
     */
    #initEvents() {
        this.#events.on('mousemove', this.#handleMouseMove.bind(this));
        this.#events.on('click', this.#handleClick.bind(this));
    }

    /**
     * 处理鼠标移动事件，更新鼠标位置
     * @param {MouseEvent} event
     */
    #handleMouseMove(event) {
        const rect = this.#controlCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.#mousePosition.x = x;
        this.#mousePosition.y = y;

        // 计算网格位置
        // const row = Math.floor(y / this.#grid.cellHeight);
        // const col = Math.floor(x / this.#grid.cellWidth);

        const { width, height } = this.cellSize;
        const row = Math.floor(y / height);
        const col = Math.floor(x / width);

        this.#mousePosition.row = row;
        this.#mousePosition.col = col;

        // 打印鼠标位置和网格行列信息
        console.log(`Mouse Position - x: ${x}, y: ${y}, Grid - row: ${row}, col: ${col}`);
    }

    /**
     * 处理点击事件，更新网格数据
     * @param {MouseEvent} event
     */
    #handleClick(event) {
        const { row, col } = this.#mousePosition;

        if (this.#isValidGridPosition(row, col)) {
            this.#updateGridData(row, col);
        }
    }

    /**
     * 更新网格数据
     * @param {Number} row - 网格行号
     * @param {Number} col - 网格列号
     */
    #updateGridData(row, col) {
        // 例如：在被点击的网格中设置一个值
        this.#grid.data[row][col] = Math.random() * 100;
        console.log(`Grid data updated at row: ${row}, col: ${col}`);
    }

    /**
     * 检查网格位置是否合法
     * @param {Number} row
     * @param {Number} col
     * @returns {Boolean}
     */
    #isValidGridPosition(row, col) {
        return row >= 0 && row < this.#grid.data.length &&
               col >= 0 && col < this.#grid.data[0].length;
    }

    /**
     * 提供获取鼠标位置信息的公共方法
     */
    getMousePosition() {
        return this.#mousePosition;
    }
}

class Events {
    #listeners;    // 用于存储事件和处理函数
    #controlLayer; // 当前的控制图层
    
    constructor(controlLayer = null) {
        this.#listeners = {};      // 初始化一个空对象存储事件
        this.#controlLayer = controlLayer; // 初始化控制图层
    }

    /**
     * 注册事件
     * @param {String} eventName - 事件名称（如 'click', 'mousemove' 等）
     * @param {Function} handler - 事件处理函数
     */
    on(eventName, handler) {
        if (!this.#listeners[eventName]) {
            this.#listeners[eventName] = [];
            if (this.#controlLayer) {
                this.#controlLayer.addEventListener(eventName, this.#dispatch.bind(this, eventName));
            }
        }
        this.#listeners[eventName].push(handler);
    }

    /**
     * 移除特定事件处理函数
     * @param {String} eventName - 事件名称
     * @param {Function} handler - 要移除的处理函数
     */
    off(eventName, handler) {
        if (!this.#listeners[eventName]) return;

        const index = this.#listeners[eventName].indexOf(handler);
        if (index > -1) {
            this.#listeners[eventName].splice(index, 1);
        }

        if (this.#listeners[eventName].length === 0) {
            delete this.#listeners[eventName];
            if (this.#controlLayer) {
                this.#controlLayer.removeEventListener(eventName, this.#dispatch.bind(this, eventName));
            }
        }
    }

    /**
     * 触发事件
     * @param {String} eventName - 事件名称
     * @param {Event} event - 浏览器事件对象
     */
    #dispatch(eventName, event) {
        if (this.#listeners[eventName]) {
            for (const handler of this.#listeners[eventName]) {
                handler(event);
            }
        }
    }

    /**
     * 设置新的控制层，并重新绑定事件
     * @param {HTMLElement} newControlLayer
     */
    setControlLayer(newControlLayer) {
        // 移除旧的事件绑定
        if (this.#controlLayer) {
            for (let eventName in this.#listeners) {
                this.#controlLayer.removeEventListener(eventName, this.#dispatch.bind(this, eventName));
            }
        }

        // 更新控制层并重新绑定事件
        this.#controlLayer = newControlLayer;

        for (let eventName in this.#listeners) {
            this.#controlLayer.addEventListener(eventName, this.#dispatch.bind(this, eventName));
        }
    }
}
