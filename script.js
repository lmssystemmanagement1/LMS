document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Suriin kung naka-login na dati sa pamamagitan ng localStorage
    const isLoggedIn = localStorage.getItem('lms_logged_in');
    if (isLoggedIn === 'true') {
        showDashboard();
    }

    // Login Handler
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            // Simplified Mock Authentication (Gumagana sa anumang email basta may laman)
            if (email && password) {
                localStorage.setItem('lms_logged_in', 'true');
                showDashboard();
            } else {
                if (loginError) {
                    loginError.style.display = 'block';
                    loginError.textContent = 'Mangyaring ilagay ang email at password.';
                }
            }
        });
    }

    // Logout Handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('lms_logged_in');
            if (loginView) loginView.style.display = 'flex';
            if (appView) appView.style.display = 'none';
        });
    }

    function showDashboard() {
        if (loginView) loginView.style.display = 'none';
        if (appView) appView.style.display = 'flex';
    }

    // Navigation Logic para sa Tabs
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tabName = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(section => {
                section.style.display = 'none';
            });

            const targetSection = document.getElementById(`tab-${tabName}`);
            if (targetSection) {
                targetSection.style.display = 'block';
                loadMockTableData(tabName);
            }
        });
    });
});

// Sample Mock Data para sa mga tab para makita mo agad kung paano lumalabas ang tables
function loadMockTableData(tabName) {
    if (tabName === 'dashboard') return;

    const tableContainer = document.getElementById(`table-${tabName}`);
    if (!tableContainer) return;

    // Halimbawa ng mock data depende sa piniling tab
    let sampleData = [];
    if (tabName === 'centers') {
        sampleData = [{ id: 1, center_name: 'Center A - Zone 1', leader: 'Maria Santos' }, { id: 2, center_name: 'Center B - Zone 2', leader: 'Juan Dela Cruz' }];
    } else if (tabName === 'clients') {
        sampleData = [{ id: 1, name: 'Ana Reyes', contact: '09123456789', status: 'Active' }, { id: 2, name: 'Pedro Penduko', contact: '09987654321', status: 'Pending' }];
    } else {
        sampleData = [{ message: `Walang paunang tala para sa ${tabName}.` }];
    }

    let html = '<table><thead><tr>';
    const keys = Object.keys(sampleData[0]);
    keys.forEach(key => { html += `<th>${key}</th>`; });
    html += '</tr></thead><tbody>';

    sampleData.forEach(row => {
        html += '<tr>';
        keys.forEach(key => { html += `<td>${row[key]}</td>`; });
        html += '</tr>';
    });
    html += '</tbody></table>';

    tableContainer.innerHTML = html;
}

// Modal Handlers
function openModal(type) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const dynamicForm = document.getElementById('dynamic-form');

    if (modalTitle) modalTitle.textContent = `Add New ${type}`;
    if (modalOverlay) modalOverlay.style.display = 'flex';
    if (dynamicForm) {
        dynamicForm.innerHTML = `
            <p style="margin-bottom: 15px; font-size: 14px;">Form para sa pagdaragdag ng ${type}.</p>
            <button type="button" onclick="closeModal()" style="background: #6b7280; width:100%;">Isara</button>
        `;
    }
}

function closeModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) modalOverlay.style.display = 'none';
}
