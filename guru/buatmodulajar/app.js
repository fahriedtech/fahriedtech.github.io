// app.js

// ===============================================
// Import Modul Firebase (Versi 12.4.0)
// ===============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";


// ===============================================
// 1. KONFIGURASI FIREBASE ANDA (WAJIB GANTI!)
// ===============================================
const firebaseConfig = {
    apiKey: "AIzaSyAS5gU7KrFMyJ6S1QmHNfQo2yFcFLQlZJk", // Ganti dengan API Key Anda
    authDomain: "aigenmod.firebaseapp.com",
    projectId: "aigenmod",
    // ... Detail konfigurasi lainnya ...
};

// ===============================================
// 2. VARIABEL AUTO-LOGOUT
// ===============================================
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 menit
let logoutTimer; 


// ===============================================
// 3. INISIALISASI FIREBASE
// ===============================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 


// ===============================================
// 4. FUNGSI LOGIKA AUTENTIKASI (Standar)
// ===============================================

function loginUser() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDisplay = document.getElementById('auth-error');
    errorDisplay.textContent = ''; 

    if (!email || !password) {
        errorDisplay.textContent = "Email dan Kata Sandi wajib diisi.";
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            console.log("Login berhasil.");
        })
        .catch((error) => {
            let errorMessage = "Login Gagal. Email atau kata sandi salah.";
            errorDisplay.textContent = errorMessage;
        });
}

function logoutUser() {
    signOut(auth)
        .then(() => {
            console.log("Logout berhasil.");
        })
        .catch((error) => {
            console.error("Error logout:", error);
        });
}


// ===============================================
// 5. FUNGSI AUTO-LOGOUT
// ===============================================

function resetLogoutTimer() {
    clearTimeout(logoutTimer); 

    logoutTimer = setTimeout(() => {
        if (auth.currentUser) {
            logoutUser();
            alert('Anda telah di-logout secara otomatis karena tidak ada aktivitas selama ' + (INACTIVITY_TIMEOUT_MS / 60000) + ' menit.');
        }
    }, INACTIVITY_TIMEOUT_MS);
}

function stopLogoutTimer() {
    clearTimeout(logoutTimer);
}


// ===============================================
// 6. EVENT LISTENERS
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    
    if (loginButton) {
        loginButton.addEventListener('click', loginUser);
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', logoutUser);
    }
    
    // Menambahkan Event Listener untuk mendeteksi aktivitas pengguna (Auto-logout)
    const activityHandler = () => {
        if (auth.currentUser) {
            resetLogoutTimer();
        }
    };

    document.addEventListener('mousemove', activityHandler);
    document.addEventListener('keypress', activityHandler);
    document.addEventListener('click', activityHandler);
});


// ===============================================
// 7. LOGIKA AKSES (HANYA CEK STATUS LOGIN & ANTI-FLICKER)
// ===============================================

onAuthStateChanged(auth, (user) => {
    const authContainer = document.getElementById('auth-container');
    const contentContainer = document.getElementById('content-container');
    
    // --- KRITIS: TAMPILKAN UI SETELAH FIREBASE SELESAI CEK STATUS ---
    document.body.classList.remove('auth-initializing'); 

    if (user) {
        // Otentikasi Berhasil: Tampilkan konten utama (Siapapun yang login, masuk)
        authContainer.classList.add('hidden');
        contentContainer.classList.remove('hidden');
        
        // Tampilkan email user di header
        document.getElementById('user-email-display').textContent = user.email;
        
        resetLogoutTimer(); 

    } else {
        // Pengguna belum login (atau sudah logout)
        stopLogoutTimer(); 
        authContainer.classList.remove('hidden');
        contentContainer.classList.add('hidden');
    }
});
