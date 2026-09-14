document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Suriin kung naka-login na
    if (localStorage.getItem('lms_logged_in') === 'true') {
        showDashboard();
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            if (email && password) {
                localStorage.setItem('lms_logged_in', 'true');
                showDashboard();
            } else {
                if (loginError) {
                    loginError.style.display = 'block';
                    loginError.textContent = 'Ipasok ang email at password.';
                }
            }
        });
    }

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
        updateMetrics();
    }

    // Tabs Navigation
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
                loadTableData(tabName);
            }
        });
    });
});

// Kunin ang data mula sa localStorage o gumawa ng empty array kung wala pa
function getData(key) {
    return JSON.parse(localStorage.getItem(`lms_${key}`)) || [];
}

function saveData(key, data) {
    localStorage.setItem(`lms_${key}`, JSON.stringify(data));
}

// I-update ang mga Bilang sa Dashboard
function updateMetrics() {
    document.getElementById('m-centers').textContent = getData('centers').length;
    document.getElementById('m-barangays').textContent = getData('barangays').length;
    document.getElementById('m-officers').textContent = getData('officers').length;
    document.getElementById('m-clients').textContent = getData('clients').length;
    document.getElementById('m-active-loans').textContent = getData('loans').length;
    document.getElementById('m-pending').textContent = getData('pending_loans')?.length || 0;
    document.getElementById('m-overdue').textContent = 0;
    document.getElementById('m-balance').textContent = '₱ 0';
}

// I-load ang Data sa mga Tables bawat Tab
function loadTableData(tabName) {
    if (tabName === 'dashboard') {
        updateMetrics();
        return;
    }

    const tableContainer = document.getElementById(`table-${tabName}`);
    if (!tableContainer) return;

    const data = getData(tabName);

    if (data.length === 0) {
        tableContainer.innerHTML = '<p style="padding: 20px; color: #6b7280;">Walang pang nakatalang rekord.</p>';
        return;
    }

    let html = '<table><thead><tr>';
    const keys = Object.keys(data[0]);
    keys.forEach(key => { html += `<th>${key}</th>`; });
    html += '</tr></thead><tbody>';

    data.forEach(row => {
        html += '<tr>';
        keys.forEach(key => { html += `<td>${row[key] !== undefined ? row[key] : ''}</td>`; });
        html += '</tr>';
    });
    html += '</tbody></table>';

    tableContainer.innerHTML = html;
}

// Buksan ang Modal na may totoong Input Forms
function openModal(type) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const dynamicForm = document.getElementById('dynamic-form');

    if (modalTitle) modalTitle.textContent = `Magdagdag ng ${type}`;
    if (modalOverlay) modalOverlay.style.display = 'flex';

    let formFields = '';
    if (type === 'center') {
        formFields = `
            <label>Pangalan ng Center</label>
            <input type="text" id="f-name" required placeholder="Hal. Center A - Zone 1">
            <label>Center Leader</label>
            <input type="text" id="f-leader" required placeholder="Hal. Maria Santos">
        `;
    } else if (type === 'barangay') {
        formFields = `
            <label>Pangalan ng Barangay</label>
            <input type="text" id="f-brgy" required placeholder="Hal. Barangay San Jose">
        `;
    } else if (type === 'officer') {
        formFields = `
            <label>Pangalan ng Officer</label>
            <input type="text" id="f-officer" required placeholder="Hal. Juan Dela Cruz">
            <label>Numero ng Telepono</label>
            <input type="text" id="f-contact" required placeholder="09123456789">
        `;
    } else if (type === 'client') {
        formFields = `
            <label>Pangalan ng Kliyente</label>
            <input type="text" id="f-client" required placeholder="Hal. Ana Reyes">
            <label>Numero ng Kontak</label>
            <input type="text" id="f-contact" required placeholder="09123456789">
        `;
    } else if (type === 'loan') {
        formFields = `
            <label>Pangalan ng Kliyente</label>
            <input type="text" id="f-loancard" required placeholder="Pangalan ng Kliyente">
            <label>Halaga ng Utang (₱)</label>
            <input type="number" id="f-amount" required placeholder="5000">
        `;
    } else {
        formFields = `<p>Walang form para sa opsyong ito.</p>`;
    }

    if (dynamicForm) {
        dynamicForm.innerHTML = `
            ${formFields}
            <button type="submit" style="background: #2563eb; margin-top: 10px;">I-save</button>
            <button type="button" onclick="closeModal()" style="background: #6b7280; margin-top: 8px;">Isara</button>
        `;

        // Handle Form Submit
        dynamicForm.onsubmit = function(e) {
            e.preventDefault();
            handleFormSubmit(type);
        };
    }
}

function handleFormSubmit(type) {
    let newItem = {};
    if (type === 'center') {
        newItem = { id: Date.now(), center_name: document.getElementById('f-name').value, leader: document.getElementById('f-leader').value };
    } else if (type === 'barangay') {
        newItem = { id: Date.now(), barangay_name: document.getElementById('f-brgy').value };
    } else if (type === 'officer') {
        newItem = { id: Date.now(), officer_name: document.getElementById('f-officer').value, contact: document.getElementById('f-contact').value };
    } else if (type === 'client') {
        newItem = { id: Date.now(), name: document.getElementById('f-client').value, contact: document.getElementById('f-contact').value, status: 'Active' };
    } else if (type === 'loan') {
        newItem = { id: Date.now(), client: document.getElementById('f-loancard').value, amount: '₱ ' + document.getElementById('f-amount').value, status: 'Active' };
    }

    if (type === 'payment') {
        closeModal();
        return;
    }

    const currentData = getData(type);
    currentData.push(newItem);
    saveData(type, currentData);

    closeModal();
    updateMetrics();
    
    // Refresh table kung nakabukas ang tab na iyon
    const activeTabBtn = document.querySelector('.nav-btn.active');
    if (activeTabBtn) {
        loadTableData(activeTabBtn.getAttribute('data-tab'));
    }
}

function closeModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) modalOverlay.style.display = 'none';
}
