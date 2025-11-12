// --- DOM Elements ---
const stopwatchBtn = document.getElementById('stopwatch-btn');
const timerBtn = document.getElementById('timer-btn');
const stopwatchSection = document.getElementById('stopwatch-section');
const timerSection = document.getElementById('timer-section');

const stopwatchDisplay = document.getElementById('stopwatch-display');
const timerDisplay = document.getElementById('timer-display');

const startStopBtn = document.getElementById('start-stop-btn');
const resetStopwatchBtn = document.getElementById('reset-stopwatch-btn');
const lapBtn = document.getElementById('lap-btn');
const lapsList = document.getElementById('laps-list');

const startTimerBtn = document.getElementById('start-timer-btn');
const resetTimerBtn = document.getElementById('reset-timer-btn');
const timerHoursInput = document.getElementById('timer-hours');
const timerMinutesInput = document.getElementById('timer-minutes');
const timerSecondsInput = document.getElementById('timer-seconds');
const presetButtons = document.querySelectorAll('.presets button');

// Warning elements
const yellowWarningInput = document.getElementById('yellow-warning');
const redWarningInput = document.getElementById('red-warning');

// --- State ---
let stopwatchInterval = null;
let timerInterval = null;
let stopwatchTime = 0;
let timerTime = 0;
let isStopwatchRunning = false;
let isTimerRunning = false;
let lapCount = 0;
let yellowWarningMinutes = 5; // Default value
let redWarningMinutes = 2;   // Default value
let currentColorState = 'normal'; // State baru untuk melacak warna

// --- Mode Switching ---
stopwatchBtn.addEventListener('click', () => switchMode('stopwatch'));
timerBtn.addEventListener('click', () => switchMode('timer'));

function switchMode(mode) {
    if (mode === 'stopwatch') {
        stopwatchSection.classList.add('active');
        timerSection.classList.remove('active');
        stopwatchBtn.classList.add('active');
        timerBtn.classList.remove('active');
    } else {
        timerSection.classList.add('active');
        stopwatchSection.classList.remove('active');
        timerBtn.classList.add('active');
        stopwatchBtn.classList.remove('active');
    }
}

// --- Stopwatch Logic ---
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
}

startStopBtn.addEventListener('click', () => {
    if (isStopwatchRunning) {
        clearInterval(stopwatchInterval);
        startStopBtn.textContent = 'Start';
        isStopwatchRunning = false;
    } else {
        const startTime = Date.now() - stopwatchTime;
        stopwatchInterval = setInterval(() => {
            stopwatchTime = Date.now() - startTime;
            stopwatchDisplay.textContent = formatTime(stopwatchTime);
        }, 10);
        startStopBtn.textContent = 'Pause';
        isStopwatchRunning = true;
    }
});

resetStopwatchBtn.addEventListener('click', () => {
    clearInterval(stopwatchInterval);
    stopwatchTime = 0;
    stopwatchDisplay.textContent = '00:00.00';
    startStopBtn.textContent = 'Start';
    isStopwatchRunning = false;
    lapsList.innerHTML = '';
    lapCount = 0;
});

lapBtn.addEventListener('click', () => {
    if (isStopwatchRunning) {
        lapCount++;
        const li = document.createElement('li');
        li.innerHTML = `<span>Lap ${lapCount}</span><span>${formatTime(stopwatchTime)}</span>`;
        lapsList.prepend(li);
    }
});

// --- Timer Logic ---
function formatTimerTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function setTimerDisplay() {
    const hours = parseInt(timerHoursInput.value) || 0;
    const minutes = parseInt(timerMinutesInput.value) || 0;
    const seconds = parseInt(timerSecondsInput.value) || 0;
    timerTime = hours * 3600 + minutes * 60 + seconds;
    timerDisplay.textContent = formatTimerTime(timerTime);
}

// Update display when input changes
[timerHoursInput, timerMinutesInput, timerSecondsInput].forEach(input => {
    input.addEventListener('input', setTimerDisplay);
});

// Preset buttons
presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const totalSeconds = parseInt(btn.dataset.time);
        timerHoursInput.value = Math.floor(totalSeconds / 3600);
        timerMinutesInput.value = Math.floor((totalSeconds % 3600) / 60);
        timerSecondsInput.value = totalSeconds % 60;
        setTimerDisplay();
    });
});

// --- Warning Logic ---
function updateWarningValues() {
    yellowWarningMinutes = parseInt(yellowWarningInput.value) || 0;
    redWarningMinutes = parseInt(redWarningInput.value) || 0;
}

yellowWarningInput.addEventListener('input', updateWarningValues);
redWarningInput.addEventListener('input', updateWarningValues);

startTimerBtn.addEventListener('click', () => {
    if (!isTimerRunning) {
        if (timerTime <= 0) {
            setTimerDisplay();
        }
        if (timerTime > 0) {
            // Reset state warna saat timer dimulai
            currentColorState = 'normal'; 
            timerDisplay.classList.remove('warning-yellow', 'warning-red');

            timerInterval = setInterval(() => {
                timerTime--;
                timerDisplay.textContent = formatTimerTime(timerTime);

                const yellowThresholdSeconds = yellowWarningMinutes * 60;
                const redThresholdSeconds = redWarningMinutes * 60;
                
                let newColorState = 'normal';
                if (timerTime <= redThresholdSeconds && timerTime > 0) {
                    newColorState = 'red';
                } else if (timerTime <= yellowThresholdSeconds && timerTime > 0) {
                    newColorState = 'yellow';
                }

                // Cek apakah ada perubahan warna dan mainkan suara
                if (newColorState !== currentColorState) {
                    playWarningSound(); // Mainkan suara peringatan
                    currentColorState = newColorState; // Perbarui state
                }
                
                // Terapkan kelas CSS berdasarkan state saat ini
                timerDisplay.classList.remove('warning-yellow', 'warning-red');
                if (currentColorState === 'red') {
                    timerDisplay.classList.add('warning-red');
                } else if (currentColorState === 'yellow') {
                    timerDisplay.classList.add('warning-yellow');
                }

                if (timerTime <= 0) {
                    clearInterval(timerInterval);
                    isTimerRunning = false;
                    startTimerBtn.textContent = 'Start';
                    timerDisplay.textContent = 'WAKTU HABIS!';
                    timerDisplay.classList.remove('warning-yellow', 'warning-red');
                    currentColorState = 'normal'; // Reset state
                    playSound(); // Mainkan suara alarm utama
                    showNotification('Timer Selesai', 'Waktu yang Anda atur telah habis.');
                }
            }, 1000);
            startTimerBtn.textContent = 'Pause';
            isTimerRunning = true;
        }
    } else {
        clearInterval(timerInterval);
        startTimerBtn.textContent = 'Start';
        isTimerRunning = false;
    }
});

resetTimerBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerTime = 0;
    timerDisplay.textContent = '00:00:00';
    startTimerBtn.textContent = 'Start';
    isTimerRunning = false;
    timerHoursInput.value = '';
    timerMinutesInput.value = '';
    timerSecondsInput.value = '';
    // Reset state dan warna saat tombol reset ditekan
    currentColorState = 'normal';
    timerDisplay.classList.remove('warning-yellow', 'warning-red');
});

// --- Notification & Sound ---
function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: 'icons/icon-192x192.png'
        });
    }
}

// Fungsi suara untuk peringatan pergantian warna
function playWarningSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 600; // Frekuensi berbeda untuk suara peringatan
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Fungsi suara untuk alarm utama (3x beep)
function playSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const beepDuration = 0.15;
    const pauseDuration = 0.2;
    const frequency = 800;

    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            const startTime = audioContext.currentTime;
            const endTime = startTime + beepDuration;

            gainNode.gain.setValueAtTime(0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);

            oscillator.start(startTime);
            oscillator.stop(endTime);
        }, i * (beepDuration + pauseDuration) * 1000);
    }
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    updateWarningValues();
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});
