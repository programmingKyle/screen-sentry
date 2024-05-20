const thresholdLabel_el = document.getElementById('thresholdLabel');
const thresholdSlider_el = document.getElementById('thresholdSlider');
const volumeLabel_el = document.getElementById('volumeLabel');
const volumeSlider_el = document.getElementById('volumeSlider');
const notificationSound_el = document.getElementById('notificationSound');
const alwaysOnTopCheckbox_el = document.getElementById('alwaysOnTopCheckbox');
const intervalInput_el = document.getElementById('intervalInput');

document.addEventListener('DOMContentLoaded', async () => {
    const results = await api.getConfig();
    loadSettings(results);
});

function loadSettings(settings){
    thresholdLabel_el.textContent = `Threshold: ${settings.inputSettings.threshold * 100}%`;
    thresholdSlider_el.value = settings.inputSettings.threshold * 100;
    volumeLabel_el.textContent = `Notification Volume: ${settings.inputSettings.volume * 100}%`;
    volumeSlider_el.value = settings.inputSettings.volume * 100;

    if (settings.inputSettings.onTop){
        console.log('exists');
        alwaysOnTopCheckbox_el.checked = settings.inputSettings.onTop;
        api.inputHandler({input: 'onTop', value: settings.inputSettings.onTop});
    }
}

thresholdSlider_el.addEventListener('input', () => {
    thresholdLabel_el.textContent = `Threshold: ${thresholdSlider_el.value}%`
});

thresholdSlider_el.addEventListener('mouseup', () => {
    api.inputHandler({input: 'threshold', value: thresholdSlider_el.value / 100});
});

volumeSlider_el.addEventListener('input', () => {
    volumeLabel_el.textContent = `Notification Volume: ${volumeSlider_el.value}%`;
});

volumeSlider_el.addEventListener('mouseup', () => {
    api.inputHandler({input: 'volume', value: volumeSlider_el.value / 100});
});

alwaysOnTopCheckbox_el.addEventListener('input', () => {
    api.inputHandler({input: 'onTop', value: alwaysOnTopCheckbox_el.checked});
});

intervalInput_el.addEventListener('input', () => {
    api.inputHandler({input: 'interval', value: intervalInput_el.value});
});