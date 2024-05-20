const monitorButton_el = document.getElementById('monitorButton');
const monitorIcon_el = document.getElementById('monitorIcon');
const monitorButtonText_el = document.getElementById('monitorButtonText');

const controlDiv_el = document.getElementById('controlDiv');

let isMonitoring = false;

monitorButton_el.addEventListener('click', () => {
    if (!isMonitoring){
        controlDiv_el.style.display = 'none';
        api.windowSelectHandler({request: 'openSelection', threshold: `${thresholdSlider_el.value / 100}`, volume: volumeSlider_el.value / 100});
    } else {
        controlDiv_el.style.display = 'block';
        toggleMonitoring();
    }
});

monitorButton_el.addEventListener('mouseover', () => {
    if (!isMonitoring){
        monitorButton_el.style.backgroundColor = 'green';
    } else {
        monitorButton_el.style.backgroundColor = '#1B1B1B';
    }
});

monitorButton_el.addEventListener('mouseleave', () => {
    if (!isMonitoring){
        monitorButton_el.style.backgroundColor = '#1B1B1B';
    } else {
        monitorButton_el.style.backgroundColor = 'green';
    }
});

api.monitoringHandler((status) => {
    switch (status){
        case 'Monitoring':
            toggleMonitoring();
            break;
        case 'Close':
            controlDiv_el.style.display = 'block';
            break;
        case 'Notify':
            notificationSound_el.volume = volumeSlider_el.value / 100;
            notificationSound_el.play();
            break;
    }
});

function toggleMonitoring(){
    if (!isMonitoring){
        isMonitoring = true;
        monitorIcon_el.className = 'fas fa-x';
        monitorButtonText_el.textContent = 'Stop Monitoring';
    } else {
        isMonitoring = false;
        api.windowSelectHandler({request: 'stop'});
        monitorIcon_el.className = 'fas fa-eye';
        monitorButtonText_el.textContent = 'Start Monitoring';    
    }
}
