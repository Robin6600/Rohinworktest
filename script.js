document.addEventListener('DOMContentLoaded', function() {
    // --- Element Selectors ---
    const clockElement = document.getElementById('live-clock');
    const officeInBtn = document.getElementById('office-in-btn');
    const officeOutBtn = document.getElementById('office-out-btn');
    const inTimeDisplay = document.getElementById('in-time-display');
    const outTimeDisplay = document.getElementById('out-time-display');
    const monthYearHeader = document.getElementById('month-year-header');
    const calendarDaysGrid = document.getElementById('calendar-days');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const taskNotesContainer = document.getElementById('task-notes-container');
    const taskButtonsContainer = document.querySelector('.task-buttons');

    // Action Password Modal Selectors
    const resetTimeBtn = document.getElementById('reset-time-btn');
    const passwordModal = document.getElementById('password-modal');
    const passwordInput = document.getElementById('password-input');
    const submitPasswordBtn = document.getElementById('submit-password-btn');
    const cancelResetBtn = document.getElementById('cancel-reset-btn');
    const passwordError = document.getElementById('password-error');

    // Notes Password Modal Selectors
    const notesPasswordModal = document.getElementById('notes-password-modal');
    const notesPasswordInput = document.getElementById('notes-password-input');
    const submitNotesPasswordBtn = document.getElementById('submit-notes-password-btn');
    const cancelNotesBtn = document.getElementById('cancel-notes-btn');
    const notesPasswordError = document.getElementById('notes-password-error');
    
    // Info Modal Selectors
    const infoModal = document.getElementById('info-modal');
    const infoModalMessage = document.getElementById('info-modal-message');
    const infoModalCloseBtn = document.getElementById('info-modal-close-btn');

    // --- State Variables & Constants ---
    let currentDate = new Date();
    let selectedDate = null;
    let areNotesUnlocked = false; 
    let focusedNoteArea = null;  
    let pendingAction = null; // Stores the function to run after password confirmation
    const NOTE_PASSWORD = '713206';
    const ACTION_PASSWORD = '713206'; 

    // --- Matrix Background Effect ---
    const canvas = document.getElementById('matrix-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const setCanvasDimensions = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setCanvasDimensions();
        window.addEventListener('resize', setCanvasDimensions);
        const matrixChars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン01';
        const columns = Math.floor(canvas.width / 20);
        const drops = Array(columns).fill(1);
        const matrixFontColor = '#22d3ee';
        function drawMatrix() {
            ctx.fillStyle = 'rgba(17, 24, 39, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = matrixFontColor;
            ctx.font = '15px monospace';
            for (let i = 0; i < drops.length; i++) {
                const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
                ctx.fillText(text, i * 20, drops[i] * 20);
                if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        setInterval(drawMatrix, 50);
    }

    // --- Live Clock ---
    function updateClock() {
        if (!clockElement) return;
        const now = new Date();
        clockElement.textContent = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    setInterval(updateClock, 1000);
    updateClock();
    
    // --- Info Modal Functionality ---
    function showInfoModal(message) {
        infoModalMessage.textContent = message;
        infoModal.style.display = 'flex';
    }

    function hideInfoModal() {
        infoModal.style.display = 'none';
    }

    infoModalCloseBtn.addEventListener('click', hideInfoModal);
    infoModal.addEventListener('click', (e) => {
        if (e.target === infoModal) {
            hideInfoModal();
        }
    });

    // --- Password-Gated Actions ---
    function performOfficeIn() {
        const todayStr = new Date().toISOString().split('T')[0];
        if (localStorage.getItem(`inTime-${todayStr}`)) {
            showInfoModal('আপনি ইতি মধ্যে অফিসে-ই আছেন !');
            return;
        }
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        localStorage.setItem(`inTime-${todayStr}`, timeStr);
        inTimeDisplay.textContent = timeStr;
    }

    function performOfficeOut() {
        const todayStr = new Date().toISOString().split('T')[0];
        if (localStorage.getItem(`outTime-${todayStr}`)) {
            showInfoModal('আপনি ইতি মধ্যে অফিসে-থেকে বেরহয়ে এসেছেন !');
            return;
        }
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        localStorage.setItem(`outTime-${todayStr}`, timeStr);
        outTimeDisplay.textContent = timeStr;
    }

    function performReset() {
        const todayStr = new Date().toISOString().split('T')[0];
        localStorage.removeItem(`inTime-${todayStr}`);
        localStorage.removeItem(`outTime-${todayStr}`);
        inTimeDisplay.textContent = '-';
        outTimeDisplay.textContent = '-';
    }
    
    // --- Attendance Tracker ---
    function loadAttendance() {
        const todayStr = new Date().toISOString().split('T')[0];
        const inTime = localStorage.getItem(`inTime-${todayStr}`);
        const outTime = localStorage.getItem(`outTime-${todayStr}`);
        inTimeDisplay.textContent = inTime || '-';
        outTimeDisplay.textContent = outTime || '-';
    }

    // --- Action Password Functionality ---
    function requestPasswordForAction(action) {
        pendingAction = action;
        passwordModal.style.display = 'flex';
        passwordInput.value = '';
        passwordError.style.display = 'none';
        passwordInput.focus();
    }

    officeInBtn.addEventListener('click', () => requestPasswordForAction(performOfficeIn));
    officeOutBtn.addEventListener('click', () => requestPasswordForAction(performOfficeOut));
    resetTimeBtn.addEventListener('click', () => requestPasswordForAction(performReset));

    cancelResetBtn.addEventListener('click', () => {
        passwordModal.style.display = 'none';
        pendingAction = null; 
    });

    passwordModal.addEventListener('click', (e) => {
        if (e.target === passwordModal) {
            passwordModal.style.display = 'none';
            pendingAction = null; 
        }
    });

    submitPasswordBtn.addEventListener('click', () => {
        if (passwordInput.value === ACTION_PASSWORD) {
            if (typeof pendingAction === 'function') {
                pendingAction();
            }
            passwordModal.style.display = 'none';
            pendingAction = null; 
        } else {
            passwordError.style.display = 'block';
            passwordInput.value = '';
        }
    });

    // --- Notes Password Functionality ---
    taskNotesContainer.addEventListener('click', (e) => {
        if (e.target.matches('.task-note-area') && !areNotesUnlocked) {
            focusedNoteArea = e.target;
            notesPasswordModal.style.display = 'flex';
            notesPasswordInput.value = '';
            notesPasswordError.style.display = 'none';
            notesPasswordInput.focus();
        }
    });
    
    cancelNotesBtn.addEventListener('click', () => notesPasswordModal.style.display = 'none');
    notesPasswordModal.addEventListener('click', (e) => {
        if (e.target === notesPasswordModal) notesPasswordModal.style.display = 'none';
    });

    submitNotesPasswordBtn.addEventListener('click', () => {
        if (notesPasswordInput.value === NOTE_PASSWORD) {
            areNotesUnlocked = true;
            document.querySelectorAll('.task-note-area').forEach(area => {
                area.readOnly = false;
            });
            notesPasswordModal.style.display = 'none';
            if (focusedNoteArea) {
                focusedNoteArea.focus();
            }
        } else {
            notesPasswordError.style.display = 'block';
            notesPasswordInput.value = '';
        }
    });


    // --- Task Notes ---
    function generateTaskTextAreas() {
        const allTaskButtons = document.querySelectorAll('.task-buttons .task-btn');
        taskNotesContainer.innerHTML = '';
        allTaskButtons.forEach(button => {
            const taskName = button.dataset.task;
            const noteAreaId = `note-area-${taskName.replace(/\s+/g, '-')}`;
            const noteArea = document.createElement('textarea');
            noteArea.id = noteAreaId;
            noteArea.className = 'task-note-area';
            noteArea.placeholder = `Notes for ${taskName}... (Click to unlock)`;
            noteArea.readOnly = true;
            noteArea.style.cursor = 'pointer';

            noteArea.addEventListener('input', () => {
                if(selectedDate) {
                    const key = `note-${selectedDate}-${taskName}`;
                    localStorage.setItem(key, noteArea.value);
                    updateNoteIndicator(selectedDate);
                }
            });
            taskNotesContainer.appendChild(noteArea);
        });
    }
    
    taskButtonsContainer.addEventListener('click', (e) => {
        if (e.target.matches('.task-btn')) {
            document.querySelectorAll('.task-buttons .task-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            document.querySelectorAll('.task-note-area').forEach(area => area.style.display = 'none');
            
            const taskName = e.target.dataset.task;
            const noteAreaId = `note-area-${taskName.replace(/\s+/g, '-')}`;
            const noteArea = document.getElementById(noteAreaId);
            if (noteArea) {
                noteArea.style.display = 'block';
            }
        }
    });

    // --- Calendar ---
    function generateCalendar(date) {
        calendarDaysGrid.innerHTML = '';
        const year = date.getFullYear();
        const month = date.getMonth();
        const today = new Date();
        monthYearHeader.textContent = `${date.toLocaleString('en-US', { month: 'long' })} ${year}`;
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDaysGrid.appendChild(document.createElement('div')).classList.add('empty');
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            const currentDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dayCell.textContent = day;
            dayCell.dataset.dateString = currentDateString;

            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayCell.classList.add('today');
            }
            if (new Date(year, month, day).getDay() === 0) {
                dayCell.classList.add('sunday');
            }
            
            updateNoteIndicator(currentDateString);
            dayCell.addEventListener('click', () => handleDateClick(dayCell, currentDateString));
            calendarDaysGrid.appendChild(dayCell);
        }
    }

    function updateNoteIndicator(dateString) {
        const dayElement = document.querySelector(`.calendar-days-grid div[data-date-string='${dateString}']`);
        if (!dayElement) return;

        let hasNote = false;
        document.querySelectorAll('.task-buttons .task-btn').forEach(btn => {
            const taskName = btn.dataset.task;
            if (localStorage.getItem(`note-${dateString}-${taskName}`)) {
                hasNote = true;
            }
        });

        if (hasNote) {
            dayElement.classList.add('has-note');
        } else {
            dayElement.classList.remove('has-note');
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        generateCalendar(currentDate);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        generateCalendar(currentDate);
    });

    function handleDateClick(element, dateString) {
        selectedDate = dateString;
        document.querySelectorAll('.calendar-days-grid div').forEach(d => d.classList.remove('selected'));
        element.classList.add('selected');

        document.querySelectorAll('.task-buttons .task-btn').forEach(button => {
            const taskName = button.dataset.task;
            const key = `note-${selectedDate}-${taskName}`;
            const noteAreaId = `note-area-${taskName.replace(/\s+/g, '-')}`;
            const noteArea = document.getElementById(noteAreaId);
            if (noteArea) {
                noteArea.value = localStorage.getItem(key) || '';
            }
        });
        
        const firstTaskButton = document.querySelector('.task-buttons .task-btn');
        if (firstTaskButton) {
            firstTaskButton.click();
        }
    }

    // --- Data Save and Load Functionality ---

    const saveDataBtn = document.getElementById('save-data-btn');
    const loadDataBtn = document.getElementById('load-data-btn');
    const fileInput = document.getElementById('file-input');

    function collectAllDashboardData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('inTime-') || key.startsWith('outTime-') || key.startsWith('note-')) {
                data[key] = localStorage.getItem(key);
            }
        }
        return data;
    }

    // --!!!-- UPDATED FUNCTION TO WORK WITH NODE.JS SERVER --!!!--
    async function saveDataToFile() {
        const data = collectAllDashboardData();
        if (Object.keys(data).length === 0) {
            showInfoModal('কোনো ডেটা সেভ করার জন্য পাওয়া যায়নি!');
            return;
        }
    
        try {
            const response = await fetch('http://localhost:3000/save-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
    
            const result = await response.json();
    
            if (result.success) {
                showInfoModal('আপনার ডেটা ফোল্ডারে সফলভাবে সেভ হয়েছে!');
            } else {
                showInfoModal(`ত্রুটি: ${result.message}`);
            }
        } catch (error) {
            console.error('Error connecting to the server:', error);
            showInfoModal('ত্রুটি: সার্ভারের সাথে সংযোগ করা যাচ্ছে না। আপনি কি সার্ভার চালু করেছেন?');
        }
    }

    function loadDataFromFile(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                for (const key in data) {
                    if (Object.hasOwnProperty.call(data, key)) {
                        localStorage.setItem(key, data[key]);
                    }
                }
                showInfoModal('ডেটা ফাইল থেকে সফলভাবে লোড হয়েছে!');
                initialize(); // Re-initialize the dashboard to show loaded data

            } catch (error) {
                console.error('Error parsing JSON file:', error);
                showInfoModal('ত্রুটি: ফাইলটি সঠিক নয় বা নষ্ট হয়ে গেছে।');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    // Event Listeners for data management
    saveDataBtn.addEventListener('click', saveDataToFile);
    loadDataBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', loadDataFromFile);

    // --- Initial Load ---
    function initialize() {
        loadAttendance();
        generateTaskTextAreas();
        generateCalendar(currentDate);
        const todayElement = document.querySelector('.calendar-days-grid .today');
        if (todayElement) {
            todayElement.click();
        } else {
             const firstDay = document.querySelector(".calendar-days-grid div:not(.empty)");
             if(firstDay) firstDay.click();
        }
    }
    
    initialize();
});