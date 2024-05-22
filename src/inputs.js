const thresholdLabel_el = document.getElementById('thresholdLabel');
const thresholdSlider_el = document.getElementById('thresholdSlider');
const volumeLabel_el = document.getElementById('volumeLabel');
const volumeSlider_el = document.getElementById('volumeSlider');
const notificationSound_el = document.getElementById('notificationSound');
const alwaysOnTopCheckbox_el = document.getElementById('alwaysOnTopCheckbox');
const intervalInput_el = document.getElementById('intervalInput');

const pauseHotkeyText_el = document.getElementById('pauseHotkeyText');
const assignPauseHotkey_el = document.getElementById('assignPauseHotkey');

document.addEventListener('DOMContentLoaded', async () => {
    const results = await api.getConfig();
    loadSettings(results);
});

function loadSettings(settings){
    thresholdLabel_el.textContent = `Threshold: ${settings.inputSettings.threshold * 100}%`;
    thresholdSlider_el.value = settings.inputSettings.threshold * 100;
    volumeLabel_el.textContent = `Notification Volume: ${settings.inputSettings.volume * 100}%`;
    volumeSlider_el.value = settings.inputSettings.volume * 100;
    intervalInput_el.value = settings.inputSettings.interval;
    api.inputHandler({input: 'interval', value: settings.inputSettings.interval});
    if (settings.inputSettings.onTop){
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

let assigningPause;
let numberOfKeys = 0;
const pressedKeys = new Set();

assignPauseHotkey_el.addEventListener('click', () => {
    console.log('Time to assign a hotkey');
    assigningPause = true;
});

document.addEventListener('keydown', (e) => {
    if (assigningPause){
        if (!pressedKeys.has(e.key)){
            numberOfKeys++;
            pressedKeys.add(e.key);
            console.log(pressedKeys);    
        }
    }
});

document.addEventListener('keyup', () => {
    if (assigningPause){
        numberOfKeys--;
    }

    if (numberOfKeys === 0 && assigningPause){
        assigningPause = false;
        console.log(`Hotkey is: ${pressedKeys}`);
    }
});