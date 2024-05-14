const monitorButton_el = document.getElementById('monitorButton');

monitorButton_el.addEventListener('click', () => {
    api.windowSelectHandler({request: 'openSelection'});
});