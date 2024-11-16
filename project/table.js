export class tableRender {
    constructor(parentDiv, rowHeight, data, renderRow) {
        this.parentDiv = parentDiv;
        this.rowHeight = rowHeight;
        this.data = data;
        this.renderRow = renderRow;
        this.totalRows = data.length;
        this.visibleRows = Math.ceil(parentDiv.clientHeight / rowHeight);
        this.buffer = 5; // Buffer rows to render above and below the viewport
        this.startRow = 0;
        this.endRow = this.visibleRows + this.buffer;

        this.table = document.createElement('table');
        this.tbody = document.createElement('tbody');
        this.table.appendChild(this.tbody);
        this.parentDiv.appendChild(this.table);

        this.scrollContainer = document.createElement('div');
        this.scrollContainer.style.position = 'relative';
        this.scrollContainer.style.height = `${this.totalRows * this.rowHeight}px`;
        this.parentDiv.appendChild(this.scrollContainer);

        this.parentDiv.addEventListener('scroll', () => this.onScroll());
        this.render();
    }

    onScroll() {
        const scrollTop = this.parentDiv.scrollTop;
        const newStartRow = Math.floor(scrollTop / this.rowHeight) - this.buffer;
        const newEndRow = newStartRow + this.visibleRows + this.buffer * 2;

        if (newStartRow !== this.startRow || newEndRow !== this.endRow) {
            this.startRow = Math.max(0, newStartRow);
            this.endRow = Math.min(this.totalRows, newEndRow);
            // this.render();
            throttle(this.render.bind(this), 100)();
        }
    }

    render() {
        this.tbody.innerHTML = '';

        for (let i = this.startRow; i < this.endRow; i++) {
            if (i >= 0 && i < this.totalRows) {
                const row = this.createRow(i);
                this.tbody.appendChild(row);
            }
        }

        this.table.style.transform = `translateY(${this.startRow * this.rowHeight}px)`;
    }

    createRow(index) {
        const row = document.createElement('tr');
        row.style.height = `${this.rowHeight}px`;
        row.innerHTML = this.renderRow(this.data[index]);
        return row;
    }
}

// 防抖函数
// 防抖函数用于减少函数的调用次数，当一个函数被频繁调用时，可以使用防抖函数来合并多次调用为一次调用。

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// 节流函数

function throttle(func, wait) {
    let timeout;
    return function(...args) {
        if (!timeout) {
            timeout = setTimeout(() => {
                func.apply(this, args);
                timeout = null;
            }, wait);
        }
    };
}