const selectionBox_el = document.getElementById('selectionBox');
const overlay_el = document.getElementById('overlay');
let startX, startY;

window.addEventListener('mousedown', e => {
    startX = e.screenX;
    startY = e.screenY;
    selectionBox_el.style.display = 'block';
    updateSelectionBox(startX, startY, 0, 0);
});

window.addEventListener('mousemove', e => {
    if (!startX || !startY) return;
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
    adjustOverlay(selection.x, selection.y, selection.width, selection.height);
});

window.addEventListener('mouseup', e => {
    const endX = e.screenX;
    const endY = e.screenY;
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    
    const screen = window.screen;
    const availLeft = screen.availLeft;
    const availTop = screen.availTop;

    const selection = {
        x: Math.min(startX, endX) - availLeft,
        y: Math.min(startY, endY) - availTop,
        width,
        height
    };

    startX = null;
    startY = null;
    selectionBox_el.style.display = 'none';
    if (selection.width === 0 || selection.height === 0) return;
    api.windowSelectHandler({ request: 'select', selection: selection });
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

function adjustOverlay(x, y, width, height) {
    const overlayRect = overlay_el.getBoundingClientRect();
    const overlayWidth = overlayRect.width;
    const overlayHeight = overlayRect.height;

    const selectedAreaLeft = x / overlayWidth;
    const selectedAreaTop = y / overlayHeight;
    const selectedAreaRight = (x + width) / overlayWidth;
    const selectedAreaBottom = (y + height) / overlayHeight;

    const maskImage = `linear-gradient(to right, rgba(0, 0, 0, 1) ${selectedAreaLeft * 100}%, rgba(0, 0, 0, 0) ${selectedAreaLeft * 100}%, rgba(0, 0, 0, 0) ${selectedAreaRight * 100}%, rgba(0, 0, 0, 1) ${selectedAreaRight * 100}%)`;

    const topMask = `linear-gradient(to bottom, rgba(0, 0, 0, 1) ${selectedAreaTop * 100}%, rgba(0, 0, 0, 0) ${selectedAreaTop * 100}%)`;
    const bottomMask = `linear-gradient(to bottom, rgba(0, 0, 0, 0) ${selectedAreaBottom * 100}%, rgba(0, 0, 0, 1) ${selectedAreaBottom * 100}%)`;

    const combinedMask = `${topMask}, ${maskImage}, ${bottomMask}`;

    overlay_el.style.maskImage = combinedMask;
}

