const monitorButton_el = document.getElementById('monitorButton');
const monitorIcon_el = document.getElementById('monitorIcon');
const monitorButtonText_el = document.getElementById('monitorButtonText');

let isMonitoring = false;

monitorButton_el.addEventListener('click', () => {
    if (!isMonitoring){
        api.windowSelectHandler({request: 'openSelection'});
    } else {
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


api.setMonitoring((status) => {
    if (status === 'Monitoring'){
        toggleMonitoring();
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
