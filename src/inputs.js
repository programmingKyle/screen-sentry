const thresholdLabel_el = document.getElementById('thresholdLabel');
const thresholdSlider_el = document.getElementById('thresholdSlider');
const volumeLabel_el = document.getElementById('volumeLabel');
const volumeSlider_el = document.getElementById('volumeSlider');
const notificationSound_el = document.getElementById('notificationSound');
const alwaysOnTopCheckbox_el = document.getElementById('alwaysOnTopCheckbox');
const intervalInput_el = document.getElementById('intervalInput');

const pauseHotkeyText_el = document.getElementById('pauseHotkeyText');
const assignPauseHotkey_el = document.getElementById('assignPauseHotkey');
const confirmPauseHotkeyButton_el = document.getElementById('confirmPauseHotkeyButton');
const cancelHotkeyButton_el = document.getElementById('cancelHotkeyButton');

let settings;

document.addEventListener('DOMContentLoaded', async () => {
    settings = await api.getConfig();
    loadSettings();
});

function loadSettings(){
    thresholdLabel_el.textContent = `Threshold: ${settings.inputSettings.threshold * 100}%`;
    thresholdSlider_el.value = settings.inputSettings.threshold * 100;
    volumeLabel_el.textContent = `Notification Volume: ${settings.inputSettings.volume * 100}%`;
    volumeSlider_el.value = settings.inputSettings.volume * 100;
    intervalInput_el.value = settings.inputSettings.interval;
    populateHotkeyText(settings.inputSettings.pauseHotkey);
    api.inputHandler({input: 'interval', value: settings.inputSettings.interval});
    if (settings.inputSettings.onTop){
        alwaysOnTopCheckbox_el.checked = settings.inputSettings.onTop;
        api.inputHandler({input: 'onTop', value: settings.inputSettings.onTop});
    }
}

function populateHotkeyText(hotkey){
    pauseHotkeyText_el.textContent = `Pause Hotkey: ${hotkey.replace(', ', ' + ')}`;
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
let lastKeyUp; // used to see if it should be removed from pressedKeys
let lastKeyDown;
const pressedKeys = new Set();

assignPauseHotkey_el.addEventListener('click', () => {
    console.log('Time to assign a hotkey');
    assigningPause = true;

    assignPauseHotkey_el.style.display = 'none';
    confirmPauseHotkeyButton_el.style.display = 'grid';
    cancelHotkeyButton_el.style.display = 'grid';
});

document.addEventListener('keydown', (e) => {
    if (assigningPause && lastKeyDown !== e.key){
        console.log(e.key);
        e.preventDefault();
        lastKeyDown = e.key;
        if (numberOfKeys === 0 && pressedKeys && assigningPause){
            pressedKeys.clear();
        }
        if (lastKeyUp && pressedKeys.has(lastKeyUp)){
            pressedKeys.delete(lastKeyUp);
            lastKeyUp = null;
        }
        if (!pressedKeys.has(e.key)){
            numberOfKeys++;
            pressedKeys.add(e.key);
            pauseHotkeyText_el.textContent = `Pause Hotkey: ${Array.from(pressedKeys).join(' + ')}`;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (assigningPause){
        numberOfKeys--;
        lastKeyUp = e.key;
    }

    if (numberOfKeys === 0 && assigningPause){
        lastKeyDown = null;
        lastKeyUp = null;
        //assigningPause = false;
        //api.hotkeyHandler({request: 'set', keys: pressedKeys});
    }
});

cancelHotkeyButton_el.addEventListener('click', () => {
    assigningPause = false;
    assignPauseHotkey_el.style.display = 'grid';
    confirmPauseHotkeyButton_el.style.display = 'none';
    cancelHotkeyButton_el.style.display = 'none';
    populateHotkeyText(settings.inputSettings.pauseHotkey);
});

confirmPauseHotkeyButton_el.addEventListener('click', () => {
    assigningPause = false;
    assignPauseHotkey_el.style.display = 'grid';
    confirmPauseHotkeyButton_el.style.display = 'none';
    cancelHotkeyButton_el.style.display = 'none';
    api.hotkeyHandler({request: 'set', keys: Array.from(pressedKeys).join(', ')});
});