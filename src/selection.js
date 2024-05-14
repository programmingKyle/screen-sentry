const selectionBox_el = document.getElementById('selectionBox');
let startX, startY;

window.addEventListener('mousedown', e => {
    startX = e.screenX;
    startY = e.screenY;
    selectionBox_el.style.display = 'block';
    updateSelectionBox(startX, startY, 0, 0);
});

window.addEventListener('mousemove', e => {
    if (!startX || !startY) return;
    console.log(selectionBox_el);
    selectionBox_el.style.display = 'block';
    const endX = e.screenX;
    const endY = e.screenY;
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    const selection = {
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        width,
        height
    };
    updateSelectionBox(selection.x, selection.y, selection.width, selection.height);
});

window.addEventListener('mouseup', e => {
    const endX = e.screenX;
    const endY = e.screenY;
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    const selection = {
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        width,
        height
    };
    startX = null;
    startY = null;
    selectionBox_el.style.display = 'none';
    if (selection.width === 0 || selection.height === 0) return;
    api.windowSelectHandler({request: 'select', selection: selection});
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape'){
        api.windowSelectHandler({request: 'close'});
    }
});

function updateSelectionBox(x, y, width, height) {
    selectionBox_el.style.left = x + 'px';
    selectionBox_el.style.top = y + 'px';
    selectionBox_el.style.width = width + 'px';
    selectionBox_el.style.height = height + 'px';
}