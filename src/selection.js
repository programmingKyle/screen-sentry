let startX, startY;

window.addEventListener('mousedown', e => {
    startX = e.screenX;
    startY = e.screenY;
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
    api.windowSelection({selection: selection});
});
