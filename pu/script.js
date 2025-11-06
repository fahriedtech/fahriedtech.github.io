// script.js

// !!! GANTI DENGAN URL API GAS ANDA YANG SUDAH DI-DEPLOY ULANG !!!
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycby_U7P1cCnVoRlswn3HoUA5mLjHwpvijRplxmcS4DnzYT7BzkL7xiHj1dyU2xvnMEgf/exec';

const HARI_KERJA = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
let jadwalPiketData = []; // Variabel global untuk menyimpan data jadwal

// --- UTILITY FUNCTIONS ---
async function fetchData(params, method = 'GET') {
    const url = new URL(GAS_API_URL);
    
    // Konversi params menjadi URLSearchParams untuk POST
    const bodyParams = new URLSearchParams(params);

    if (method === 'GET') {
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        try {
            const response = await fetch(url.toString());
            if (!response.ok) throw new Error(`HTTP Status ${response.status}`);
            return response.json();
        } catch (error) {
             console.error('Fetch GET Error:', error);
             return { status: 'error', message: `Koneksi atau API error: ${error.message}` };
        }
    } else if (method === 'POST') {
        try {
            const response = await fetch(GAS_API_URL, {
                method: 'POST',
                body: bodyParams
            });
            if (!response.ok) throw new Error(`HTTP Status ${response.status}`);
            return response.json();
        } catch (error) {
            console.error('Fetch POST Error:', error);
            return { status: 'error', message: `Koneksi atau API error: ${error.message}` };
        }
    }
}

function displayMessage(type, text) {
    const container = document.getElementById('messageContainer');
    if (!container) return;
    
    container.className = `message ${type}`;
    container.textContent = text;
}


// --- DASHBOARD UMUM FUNCTIONS ---

function populateFilterKelas() {
    const filterKelas = document.getElementById('filterKelas');
    const semuaKelas = new Set(jadwalPiketData.map(item => item.Kelas));

    filterKelas.innerHTML = '<option value="all">Semua Kelas</option>';
    
    Array.from(semuaKelas).sort().forEach(kelas => {
        if (kelas && kelas !== 'N/A') {
            const option = document.createElement('option');
            option.value = kelas;
            option.textContent = kelas;
            filterKelas.appendChild(option);
        }
    });
}

function filterByHari(hari) {
    document.querySelectorAll('.nav-hari button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === hari) {
            btn.classList.add('active');
        }
    });
    document.getElementById('cardContainer').dataset.activeHari = hari;
    updateJadwalDisplay();
}

function updateJadwalDisplay() {
    const container = document.getElementById('cardContainer');
    const activeHari = container.dataset.activeHari;
    const searchText = document.getElementById('searchSiswa').value.toLowerCase();
    const selectedKelas = document.getElementById('filterKelas').value;

    const jadwalHariIni = jadwalPiketData.filter(item => item.Hari === activeHari);

    if (jadwalHariIni.length === 0) {
        container.innerHTML = `<p class="message info">Tidak ada jadwal piket untuk hari ${activeHari}.</p>`;
        return;
    }

    // --- SORTIR DATA KRUSIAL ---
    // Sortir berdasarkan NamaLokasi (Kode Lokasi: RG, RTU, PUS)
    jadwalHariIni.sort((a, b) => {
        if (a.NamaLokasi < b.NamaLokasi) return -1;
        if (a.NamaLokasi > b.NamaLokasi) return 1;
        // Sub-sort berdasarkan NamaTugas untuk kerapian di dalam kartu
        if (a.NamaTugas < b.NamaTugas) return -1; 
        if (a.NamaTugas > b.NamaTugas) return 1;
        return 0;
    });
    // ----------------------------

    // Kelompokkan data berdasarkan NamaLokasi yang sudah disederhanakan (RG, RTU, PUS)
    const jadwalByLokasi = jadwalHariIni.reduce((acc, item) => {
        if (!acc[item.NamaLokasi]) {
            acc[item.NamaLokasi] = [];
        }
        acc[item.NamaLokasi].push(item);
        return acc;
    }, {});
    
    container.innerHTML = ''; // Bersihkan konten

    let totalCardsDisplayed = 0;

    // Loop untuk membuat kartu
    for (const lokasi in jadwalByLokasi) {
        let cardSiswaList = '';
        let showCard = false; 

        // Filter siswa di dalam lokasi berdasarkan search dan kelas
        const filteredSiswa = jadwalByLokasi[lokasi].filter(item => {
            const matchSearch = item.NamaSiswa.toLowerCase().includes(searchText);
            const matchKelas = selectedKelas === 'all' || item.Kelas === selectedKelas;
            return matchSearch && matchKelas;
        });

        if (filteredSiswa.length > 0) {
            showCard = true;
            totalCardsDisplayed++;
            filteredSiswa.forEach(item => {
                const nama = item.NamaSiswa;
                const tugas = item.NamaTugas; // Tugas sudah bersih dari kode lokasi (hasil dari GAS)
                const kelas = item.Kelas;
                
                const displayNama = searchText ? nama.replace(new RegExp(searchText, 'gi'), match => `<b>${match}</b>`) : nama;

                cardSiswaList += `
                    <div class="tugas-item">
                        <span class="siswa-nama">${displayNama}</span> 
                        <span class="siswa-kelas">(${kelas})</span>:
                        <p style="margin: 5px 0 0 10px;">${tugas}</p>
                    </div>
                `;
            });
        }
        
        // Buat kartu jika ada siswa yang lolos filter
        if (showCard) {
            const cardHTML = `
                <div class="card-lokasi">
                    <div class="card-header">
                        🏛️ ${lokasi}
                    </div>
                    <div class="card-body">
                        ${cardSiswaList}
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHTML);
        }
    }
    
    if (totalCardsDisplayed === 0) {
         container.innerHTML = `<p class="message info">Tidak ada data yang cocok dengan kriteria pencarian/filter Anda untuk hari ${activeHari}.</p>`;
    }
}

async function initDashboard() {
    const navContainer = document.querySelector('.nav-hari');
    const filterKelas = document.getElementById('filterKelas');

    HARI_KERJA.forEach(hari => {
        const button = document.createElement('button');
        button.textContent = hari;
        button.onclick = () => filterByHari(hari);
        navContainer.appendChild(button);
    });

    // Event listeners
    document.getElementById('searchSiswa').addEventListener('input', updateJadwalDisplay);
    filterKelas.addEventListener('change', updateJadwalDisplay);
    
    // Load data
    const result = await fetchData({ action: 'getJadwalPiket' }, 'GET');
    
    if (result.status === 'success') {
        jadwalPiketData = result.data;
        populateFilterKelas();
        
        // Tentukan hari aktif (default ke hari ini atau Senin)
        const todayIndex = new Date().getDay(); // 0=Minggu, 1=Senin...
        let activeDay = HARI_KERJA[0]; // Default: Senin
        if (todayIndex >= 1 && todayIndex <= 5) {
            activeDay = HARI_KERJA[todayIndex - 1];
        }
        
        filterByHari(activeDay);
    } else {
        document.getElementById('cardContainer').innerHTML = `<p class="message error">Koneksi Error. Cek URL GAS API atau error: ${result.message}</p>`;
    }
}


// --- ADMIN FUNCTIONS ---

function initAdmin() {
    const loginForm = document.getElementById('loginForm');
    const controlPanel = document.getElementById('controlPanel');
    const acakButton = document.getElementById('acakJadwalBtn');
    
    // Cek apakah elemen ada sebelum menyembunyikan/menampilkan
    if (loginForm && controlPanel) {
        loginForm.style.display = 'block';
        controlPanel.style.display = 'none';
    }


    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            displayMessage('info', 'Sedang memverifikasi...');

            const result = await fetchData({ action: 'login', username, password }, 'POST');

            if (result.status === 'success') {
                displayMessage('success', 'Login Berhasil! Selamat datang, Admin.');
                loginForm.style.display = 'none';
                controlPanel.style.display = 'block';
            } else {
                displayMessage('error', result.message || 'Login gagal. Cek kredensial Anda.');
            }
        });
    }
    
    
    if (acakButton) {
        acakButton.addEventListener('click', async () => {
            acakButton.disabled = true;
            displayMessage('info', 'Sedang memproses pengacakan jadwal. Ini mungkin memakan waktu sebentar...');

            const result = await fetchData({ action: 'acakDanSimpan' }, 'POST');
            
            acakButton.disabled = false;
            
            if (result.status === 'success') {
                displayMessage('success', result.data.message + `. Total ${result.data.count} penugasan baru.`);
            } else {
                displayMessage('error', 'Gagal mengacak: ' + (result.message || 'Terjadi kesalahan pada script GAS.'));
            }
        });
    }
}

// Inisialisasi berdasarkan halaman
window.onload = () => {
    if (document.body.id === 'dashboard') {
        initDashboard();
    } else if (document.body.id === 'admin') {
        initAdmin();
    }
};