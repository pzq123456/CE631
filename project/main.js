import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';

const panel = document.getElementsByClassName('panel')[0];

const PARAMS = {
    fontSize: 16,
    title: 'hello',
    color: '#ff0055',
};

const pane = new Pane();

pane.addBinding(PARAMS, 'fontSize', {
    min: 10,
    max: 100,
});

pane.addBinding(PARAMS, 'title');
pane.addBinding(PARAMS, 'color');

// 以绑定的值创建一个 h1 元素
const h1 = document.createElement('h1');
h1.textContent = PARAMS.title;
h1.style.color = PARAMS.color;
h1.style.fontSize = `${PARAMS.fontSize}px`;
document.body.appendChild(h1);

function update() {
    h1.style.fontSize = `${PARAMS.fontSize}px`;
    h1.textContent = PARAMS.title;
    h1.style.color = PARAMS.color;
}

pane.on('change', update);

