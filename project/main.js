import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';

const panel = document.getElementsByClassName('panel')[0];

const PARAMS = {
    factor: 123,
    title: 'hello',
    color: '#ff0055',
};

const pane = new Pane(
    {
        container: panel,
    }
);

pane.addBinding(PARAMS, 'factor');
pane.addBinding(PARAMS, 'title');
pane.addBinding(PARAMS, 'color');

// 以绑定的值创建一个 h1 元素
const h1 = document.createElement('h1');
h1.textContent = PARAMS.title;
h1.style.color = PARAMS.color;
document.body.appendChild(h1);


