// --- DOM Element References ---
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userNameSpan = document.getElementById('user-name');

const studentNameInput = document.getElementById('student-name');
const addStudentBtn = document.getElementById('add-student-btn');
const studentList = document.getElementById('student-list');

const taskNameInput = document.getElementById('task-name');
const taskGenderSelect = document.getElementById('task-gender');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');

const generateBtn = document.getElementById('generate-btn');
const saveBtn = document.getElementById('save-btn');
const exportBtn = document.getElementById('export-btn');
const printBtn = document.getElementById('print-btn');
const scheduleContainer = document.getElementById('schedule-container');

// --- Global State ---
let currentUser = null;
let students = [];
let tasks = [];
let schedule = {};

// --- Event Listeners ---
loginBtn.addEventListener('click', loginWithGoogle);
logoutBtn.addEventListener('click', logoutUser);
addStudentBtn.addEventListener('click', addStudent);
addTaskBtn.addEventListener('click', addTask);
generateBtn.addEventListener('click', generateSchedule);
saveBtn.addEventListener('click', saveDataToFirestore);
exportBtn.addEventListener('click', exportToCSV);
printBtn.addEventListener('click', () => window.print());

// --- Firebase Authentication ---
window.onAuthStateChanged(window.auth, (user) => {
    if (user) {
        currentUser = user;
        userNameSpan.textContent = user.displayName;
        loginContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        loadUserData();
    } else {
        currentUser = null;
        loginContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
});

function loginWithGoogle() {
    const provider = new window.GoogleAuthProvider();
    window.signInWithPopup(window.auth, provider).catch(error => {
        console.error("Error during login:", error);
        alert("Login gagal. Silakan coba lagi.");
    });
}

function logoutUser() {
    window.signOut(window.auth).catch(error => {
        console.error("Error during logout:", error);
    });
}

// --- Firestore Data Management ---
async function loadUserData() {
    if (!currentUser) return;

    const userDocRef = window.doc(window.db, "users", currentUser.uid);
    const docSnap = await window.getDoc(userDocRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        students = data.students || [];
        tasks = data.tasks || [];
        schedule = data.schedule || {};
    } else {
        // Initialize with empty data if new user
        students = [];
        tasks = [];
        schedule = {};
    }
    renderAll();
}

async function saveDataToFirestore() {
    if (!currentUser) {
        alert("Anda harus login untuk menyimpan data.");
        return;
    }

    const userDocRef = window.doc(window.db, "users", currentUser.uid);
    const dataToSave = { students, tasks, schedule };

    try {
        await window.setDoc(userDocRef, dataToSave);
        alert("Data berhasil disimpan ke cloud!");
    } catch (error) {
        console.error("Error saving data:", error);
        alert("Gagal menyimpan data. Periksa koneksi Anda.");
    }
}

// --- UI Rendering ---
function renderAll() {
    renderStudentList();
    renderTaskList();
    renderSchedule();
}

function renderStudentList() {
    studentList.innerHTML = '';
    students.forEach((student, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${student.name}
            <button class="gender-btn" data-index="${index}">${student.gender === 'male' ? '♂️' : '♀️'}</button>
            <button class="remove-btn" data-index="${index}">x</button>
        `;
        studentList.appendChild(li);
    });

    // Add event listeners to new buttons
    document.querySelectorAll('#student-list .gender-btn').forEach(btn => {
        btn.addEventListener('click', (e) => toggleGender(e.target.dataset.index));
    });
    document.querySelectorAll('#student-list .remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => removeStudent(e.target.dataset.index));
    });
}

function renderTaskList() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        const genderText = task.genderRestriction === 'male' ? ' (L)' : task.genderRestriction === 'female' ? ' (P)' : '';
        li.innerHTML = `
            ${task.name}${genderText}
            <button class="remove-btn" data-index="${index}">x</button>
        `;
        taskList.appendChild(li);
    });

    document.querySelectorAll('#task-list .remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => removeTask(e.target.dataset.index));
    });
}

function renderSchedule() {
    if (Object.keys(schedule).length === 0) {
        scheduleContainer.innerHTML = '<p class="placeholder-text">Belum ada jadwal. Silakan tambahkan siswa/tugas dan klik "Buat Jadwal Otomatis".</p>';
        return;
    }

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    let tableHTML = '<table id="schedule-grid"><thead><tr><th>Hari</th>';

    // Create table headers
    tasks.forEach(task => {
        tableHTML += `<th>${task.name}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    // Create table rows
    days.forEach(day => {
        tableHTML += `<tr><td class="task-header">${day}</td>`;
        tasks.forEach(task => {
            const daySchedule = schedule[day] || {};
            const taskSchedule = daySchedule[task.name] || [];
            const studentPills = taskSchedule.map(s => `<span class="student-pill">${s}</span>`).join('');
            tableHTML += `<td><div class="dropzone" data-day="${day}" data-task="${task.name}">${studentPills}</div></td>`;
        });
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    scheduleContainer.innerHTML = tableHTML;

    setupDragAndDrop();
}

// --- Input & Data Manipulation ---
function addStudent() {
    const name = studentNameInput.value.trim();
    if (!name) return;

    const gender = guessGender(name);
    students.push({ name, gender });
    studentNameInput.value = '';
    renderStudentList();
}

function addTask() {
    const name = taskNameInput.value.trim();
    const genderRestriction = taskGenderSelect.value;
    if (!name) return;

    tasks.push({ name, genderRestriction });
    taskNameInput.value = '';
    renderTaskList();
}

function removeStudent(index) {
    students.splice(index, 1);
    renderStudentList();
}

function removeTask(index) {
    tasks.splice(index, 1);
    renderTaskList();
}

function toggleGender(index) {
    students[index].gender = students[index].gender === 'male' ? 'female' : 'male';
    renderStudentList();
}

function guessGender(name) {
    const lowerName = name.toLowerCase();
    const maleSuffixes = ['o', 'adi', 'nugroho', 'prakoso', 'budi', 'agus', 'dwi'];
    const femaleSuffixes = ['a', 'i', 'sari', 'putri', 'dewi', 'ratna', 'fitri'];

    for (const suffix of maleSuffixes) {
        if (lowerName.endsWith(suffix)) return 'male';
    }
    for (const suffix of femaleSuffixes) {
        if (lowerName.endsWith(suffix)) return 'female';
    }
    return 'any'; // Default if uncertain
}

// --- Schedule Generation ---
function generateSchedule() {
    if (students.length === 0 || tasks.length === 0) {
        alert("Harap tambahkan siswa dan tugas terlebih dahulu!");
        return;
    }

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    const newSchedule = {};

    // Separate students by gender for fair distribution
    const maleStudents = students.filter(s => s.gender === 'male').map(s => s.name);
    const femaleStudents = students.filter(s => s.gender === 'female').map(s => s.name);
    const anyStudents = students.map(s => s.name); // For 'any' tasks

    // Shuffle arrays for randomness
    shuffleArray(maleStudents);
    shuffleArray(femaleStudents);
    shuffleArray(anyStudents);

    let maleIndex = 0, femaleIndex = 0, anyIndex = 0;

    days.forEach(day => {
        newSchedule[day] = {};
        tasks.forEach(task => {
            const assignedStudents = [];
            const studentsNeeded = 2; // Asumsi 2 siswa per tugas

            if (task.genderRestriction === 'male') {
                for (let i = 0; i < studentsNeeded; i++) {
                    if (maleIndex < maleStudents.length) {
                        assignedStudents.push(maleStudents[maleIndex++]);
                    }
                }
            } else if (task.genderRestriction === 'female') {
                for (let i = 0; i < studentsNeeded; i++) {
                    if (femaleIndex < femaleStudents.length) {
                        assignedStudents.push(femaleStudents[femaleIndex++]);
                    }
                }
            } else { // 'any'
                for (let i = 0; i < studentsNeeded; i++) {
                    if (anyIndex < anyStudents.length) {
                        assignedStudents.push(anyStudents[anyIndex++]);
                    }
                }
            }
            newSchedule[day][task.name] = assignedStudents;
        });
    });

    schedule = newSchedule;
    renderSchedule();
    alert("Jadwal berhasil dibuat! Anda dapat menyimpannya dengan tombol 'Simpan ke Cloud'.");
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- Drag and Drop ---
function setupDragAndDrop() {
    const dropzones = document.querySelectorAll('.dropzone');
    const pills = document.querySelectorAll('.student-pill');

    pills.forEach(pill => {
        pill.draggable = true;
        pill.addEventListener('dragstart', handleDragStart);
        pill.addEventListener('dragend', handleDragEnd);
    });

    dropzones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
        zone.addEventListener('dragleave', handleDragLeave);
    });
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = e.target;
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    if (draggedElement) {
        // Find original location
        const originalDropzone = draggedElement.parentNode;
        const originalDay = originalDropzone.dataset.day;
        const originalTask = originalDropzone.dataset.task;

        // Find new location
        const newDropzone = e.currentTarget;
        const newDay = newDropzone.dataset.day;
        const newTask = newDropzone.dataset.task;

        // Move element in DOM
        newDropzone.appendChild(draggedElement);

        // Update data in state
        const studentName = draggedElement.textContent;
        
        // Remove from old location
        const oldTaskList = schedule[originalDay][originalTask];
        const oldIndex = oldTaskList.indexOf(studentName);
        if (oldIndex > -1) {
            oldTaskList.splice(oldIndex, 1);
        }

        // Add to new location
        if (!schedule[newDay][newTask]) {
            schedule[newDay][newTask] = [];
        }
        schedule[newDay][newTask].push(studentName);
        
        draggedElement = null;
    }
}


// --- Export & Print ---
function exportToCSV() {
    if (Object.keys(schedule).length === 0) {
        alert("Tidak ada jadwal untuk diekspor.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = ['Hari', ...tasks.map(t => t.name)];
    csvContent += headers.join(',') + '\n';

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    days.forEach(day => {
        const row = [day];
        tasks.forEach(task => {
            const taskStudents = schedule[day][task.name] || [];
            row.push(`"${taskStudents.join(', ')}"`); // Join with comma and quote
        });
        csvContent += row.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "jadwal_piket.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}