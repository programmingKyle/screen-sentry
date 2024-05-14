let startX, startY;

window.addEventListener('mousedown', e => {
    startX = e.screenX;
    startY = e.screenY;
});

window.addEventListener('mouseup', e => {
    let isValid = true;
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
    if (selection.width === 0 || selection.height === 0){
        isValid = false;
    }
    if (isValid){
        api.windowSelectHandler({request: 'select', selection: selection});
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape'){
        api.windowSelectHandler({request: 'close'});
    }
})