:root {
    --bg-color: #121212;
    --surface-color: #1e1e1e;
    --primary-color: #03dac6; /* Accent color */
    --on-primary-color: #121212;
    --text-color: #e0e0e0;
    --text-secondary-color: #a0a0a0;
    --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-family);
    background-color: var(--bg-color);
    color: var(--text-color);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    transition: background-color 0.3s, color 0.3s;
}

.app-container {
    width: 100%;
    max-width: 550px;
    padding: 2rem;
    background-color: var(--surface-color);
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

header h1 {
    text-align: center;
    font-size: 2.5rem;
    font-weight: 300;
    margin-bottom: 2rem;
    letter-spacing: 2px;
}

.mode-switcher {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
    background-color: var(--bg-color);
    border-radius: 50px;
    padding: 0.25rem;
}

.mode-switcher button {
    background: none;
    border: none;
    color: var(--text-secondary-color);
    padding: 0.75rem 2rem;
    font-size: 1rem;
    cursor: pointer;
    border-radius: 50px;
    transition: all 0.3s ease;
}

.mode-switcher button.active {
    background-color: var(--primary-color);
    color: var(--on-primary-color);
    font-weight: bold;
}

section {
    display: none;
    text-align: center;
}

section.active {
    display: block;
}

.display {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(2.5rem, 7vw, 4rem);
    font-weight: 700;
    margin-bottom: 2rem;
    letter-spacing: 1px;
    color: var(--primary-color);
    transition: color 0.5s ease;
    word-break: keep-all;
    overflow-wrap: normal;
}

.controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
}

.controls button {
    background-color: var(--primary-color);
    color: var(--on-primary-color);
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: bold;
    border-radius: 10px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.controls button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(3, 218, 198, 0.4);
}

.controls button:active {
    transform: translateY(0);
}

/* Aturan untuk tombol abu-abu sudah dihapus, sehingga semua tombol akan mengikuti gaya di atas */

.timer-inputs {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.timer-inputs input {
    width: 80px;
    text-align: center;
    font-size: 1.5rem;
    padding: 0.5rem;
    background-color: var(--bg-color);
    border: 2px solid #444;
    border-radius: 10px;
    color: var(--text-color);
}

/* Gaya untuk pengaturan peringatan */
.warning-settings {
    background-color: var(--bg-color);
    padding: 1rem;
    border-radius: 10px;
    margin-bottom: 1.5rem;
}

.warning-settings h3 {
    font-size: 1rem;
    font-weight: 400;
    color: var(--text-secondary-color);
    margin-bottom: 1rem;
    text-align: center;
}

.warning-input-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.warning-input-group label {
    font-size: 0.9rem;
}

.warning-input-group input {
    width: 60px;
    text-align: center;
    font-size: 1rem;
    padding: 0.4rem;
    background-color: var(--surface-color);
    border: 1px solid #555;
    border-radius: 5px;
    color: var(--text-color);
}

/* Definisikan kelas untuk warna peringatan */
.warning-yellow {
    color: #fdd835; /* Warna kuning cerah */
}

.warning-red {
    color: #f44336; /* Warna merah */
}

.presets {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.presets button {
    background-color: #333;
    color: var(--text-secondary-color);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s;
}

.presets button:hover {
    background-color: #444;
    color: var(--text-color);
}

#laps-list {
    list-style: none;
    padding: 0;
    margin-top: 1rem;
    max-height: 200px;
    overflow-y: auto;
}

#laps-list li {
    background-color: var(--bg-color);
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
