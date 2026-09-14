// --- INITIAL LOCALSTORAGE SETUP ---
function initStorage() {
    if (!localStorage.getItem('lms_accounts')) {
        const defaultAccounts = [
            { id: 1, email: 'admin@lms.internal', password: 'password123', role: 'admin', name: 'Main Administrator', assignedBarangays: [] },
            { id: 2, email: 'officer1@lms.internal', password: 'password123', role: 'officer', name: 'Officer Juan', assignedBarangays: ['Barangay 1', 'Barangay 2'] }
        ];
        localStorage.setItem('lms_accounts', JSON.stringify(defaultAccounts));
    }
    if (!localStorage.getItem('lms_centers')) {
        localStorage.setItem('lms_centers', JSON.stringify([
            { id: 1, name: 'Center A', barangay: 'Barangay 1' },
            { id: 2, name: 'Center B', barangay: 'Barangay 3' }
        ]));
    }
    if (!localStorage.getItem('lms_barangays')) {
        localStorage.setItem('lms_barangays', JSON.stringify([
            { id: 1, name: 'Barangay 1', center: 'Center A' },
            { id: 2, name: 'Barangay 2', center: 'Center A' },
            { id: 3, name: 'Barangay 3', center: 'Center B' }
        ]));
    }
    if (!localStorage.getItem('lms_clients')) {
        localStorage.setItem('lms_clients', JSON.stringify([
            { id: 1, name: 'Ana Reyes', barangay: 'Barangay 1', center: 'Center A', contact: '09123456789' },
            { id: 2, name: 'Pedro Penduko', barangay: 'Barangay 2', center: 'Center A', contact: '09987654321' },
            { id: 3, name: 'Clara Santos', barangay: 'Barangay 3', center: 'Center B', contact: '09112233445' }
        ]));
    }
    ['loans', 'payments', 'savings', 'transactions', 'audit', 'officers'].forEach(key => {
        if (!localStorage.getItem(`lms_${key}`)) {
            localStorage.setItem(`lms_${key}`, JSON.stringify([]));
        }
    });
}

initStorage();

document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Suriin kung may naka-login na
    const sessionEmail = localStorage.getItem('lms_current_session');
    if (sessionEmail) {
        startApp(sessionEmail);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();

            const accounts = JSON.parse(localStorage.getItem('lms_accounts'));
            const user = accounts.find(acc => acc.email === email && acc.password === password);

            if (user) {
                localStorage.setItem('lms_current_session', user.email);
                startApp(user.email);
            } else {
                loginError.style.display = 'block';
                loginError.textContent = 'Maling email o password.';
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('lms_current_session');
            loginView.style.display = 'flex';
            appView.style.display = 'none';
        });
    }
});

function getCurrentUser() {
    const email = localStorage.getItem('lms_current_session');
    if (!email) return null;
    const accounts = JSON.parse(localStorage.getItem('lms_accounts'));
    return accounts.find(acc => acc.email === email) || null;
}

function startApp(email) {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('app-view').style.display = 'flex';

    const user = getCurrentUser();
    buildNavigation(user);
    loadDashboard(user);
}

// --- BUILD DYNAMIC NAVIGATION DEPENDING ON ROLE ---
function buildNavigation(user) {
    const navContainer = document.getElementById('sidebar-nav');
    const titleEl = document.getElementById('sidebar-title');

    let navHtml = `<button class="nav-btn active" data-tab="dashboard">Dashboard</button>`;

    if (user.role === 'admin') {
        titleEl.textContent = 'LMS Administrator';
        navHtml += `
            <button class="nav-btn" data-tab="centers">Centers</button>
            <button class="nav-btn" data-tab="barangays">Barangays</button>
            <button class="nav-btn" data-tab="officers">Officers</button>
            <button class="nav-btn" data-tab="clients">Clients</button>
            <button class="nav-btn" data-tab="loans">Loans / Financing</button>
            <button class="nav-btn" data-tab="payments">Payments</button>
            <button class="nav-btn" data-tab="savings">Savings</button>
            <button class="nav-btn" data-tab="transactions">Transactions</button>
            <button class="nav-btn" data-tab="reports">Reports</button>
            <button class="nav-btn" data-tab="audit">Audit Logs</button>
            <button class="nav-btn" data-tab="settings">System Settings</button>
        `;
    } else {
        titleEl.textContent = `Officer: ${user.name}`;
        navHtml += `
            <button class="nav-btn" data-tab="clients">Clients (Assigned)</button>
            <button class="nav-btn" data-tab="loans">Loans</button>
            <button class="nav-btn" data-tab="payments">Payments</button>
            <button class="nav-btn" data-tab="savings">Savings</button>
            <button class="nav-btn" data-tab="transactions">Transactions</button>
            <button class="nav-btn" data-tab="reports">Reports</button>
        `;
    }

    navContainer.innerHTML = navHtml;

    // Tab switching event binding
    const navButtons = navContainer.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tabName = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(sec => sec.style.display = 'none');
            
            const target = document.getElementById(`tab-${tabName}`);
            if (target) {
                target.style.display = 'block';
                loadTabData(tabName, user);
            }
        });
    });
}

// --- DASHBOARD LOADER ---
function loadDashboard(user) {
    const title = document.getElementById('dash-title');
    const subtitle = document.getElementById('dash-subtitle');
    const metricsContainer = document.getElementById('metrics-container');
    const actionsContainer = document.getElementById('action-buttons-container');

    if (user.role === 'admin') {
        title.textContent = 'Main Dashboard (Full Access)';
        subtitle.textContent = 'Pangkalahatang buod ng buong sistema.';

        const centers = JSON.parse(localStorage.getItem('lms_centers')).length;
        const barangays = JSON.parse(localStorage.getItem('lms_barangays')).length;
        const officers = JSON.parse(localStorage.getItem('lms_accounts')).filter(a => a.role === 'officer').length;
        const clients = JSON.parse(localStorage.getItem('lms_clients')).length;
        const loans = JSON.parse(localStorage.getItem('lms_loans')).length;

        metricsContainer.innerHTML = `
            <div class="card"><p>Total Centers</p><h3>${centers}</h3></div>
            <div class="card"><p>Total Barangays</p><h3>${barangays}</h3></div>
            <div class="card"><p>Total Officers</p><h3>${officers}</h3></div>
            <div class="card"><p>Total Clients</p><h3>${clients}</h3></div>
            <div class="card"><p>Active Loans</p><h3>${loans}</h3></div>
            <div class="card"><p>Outstanding Balance</p><h3>₱ 0</h3></div>
        `;

        actionsContainer.innerHTML = `
            <button onclick="openModal('center')">+ ADD CENTER</button>
            <button onclick="openModal('barangay')">+ ADD BARANGAY</button>
            <button onclick="openModal('officer')">+ ADD OFFICER</button>
            <button onclick="openModal('client')">+ ADD CLIENT</button>
            <button onclick="openModal('loan')" class="btn-green">+ NEW LOAN</button>
            <button onclick="openModal('payment')" class="btn-green">RECORD PAYMENT</button>
        `;
    } else {
        title.textContent = `Welcome, Officer ${user.name}`;
        subtitle.textContent = `Mga nakatalagang Barangay: ${user.assignedBarangays.join(', ') || 'Wala pang assigned barangay'}`;

        // Filter clients based on assigned barangays
        const allClients = JSON.parse(localStorage.getItem('lms_clients'));
        const assignedClients = allClients.filter(c => user.assignedBarangays.includes(c.barangay));

        metricsContainer.innerHTML = `
            <div class="card"><p>Assigned Barangays</p><h3>${user.assignedBarangays.length}</h3></div>
            <div class="card"><p>Clients in Scope</p><h3>${assignedClients.length}</h3></div>
            <div class="card"><p>Today's Collection</p><h3>₱ 0</h3></div>
        `;

        actionsContainer.innerHTML = `
            <button onclick="openModal('client')">+ ADD CLIENT</button>
            <button onclick="openModal('loan')" class="btn-green">+ NEW LOAN</button>
            <button onclick="openModal('payment')" class="btn-green">RECORD PAYMENT</button>
        `;
    }
}

// --- DATA FILTERING FOR TABLES (BARANGAY SCOPE) ---
function loadTabData(tabName, user) {
    if (tabName === 'dashboard') {
        loadDashboard(user);
        return;
    }

    const container = document.getElementById(`table-${tabName}`);
    if (!container) return;

    let rawData = JSON.parse(localStorage.getItem(`lms_${tabName}`)) || [];

    // Kung officer, i-filter ang clients/loans ayon sa assigned barangays
    if (user.role === 'officer' && (tabName === 'clients' || tabName === 'loans' || tabName === 'payments')) {
        rawData = rawData.filter(item => user.assignedBarangays.includes(item.barangay));
    }

    if (rawData.length === 0) {
        container.innerHTML = `<p style="padding: 20px; color: #6b7280;">Walang nakitang rekord para sa sakop mo.</p>`;
        return;
    }

    let html = '<table><thead><tr>';
    const keys = Object.keys(rawData[0]);
    keys.forEach(k => html += `<th>${k}</th>`);
    html += '</tr></thead><tbody>';

    rawData.forEach(row => {
        html += '<tr>';
        keys.forEach(k => html += `<td>${row[k]}</td>`);
        html += '</tr>';
    });
    html += '</tbody></table>';

    container.innerHTML = html;
}

// --- MODAL & FORM HANDLERS ---
function openModal(type) {
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('dynamic-form');

    title.textContent = `Magdagdag ng ${type}`;
    overlay.style.display = 'flex';

    let fields = '';
    if (type === 'client') {
        fields = `
            <label>Pangalan ng Kliyente</label>
            <input type="text" id="m-name" required placeholder="Pangalan">
            <label>Barangay</label>
            <input type="text" id="m-barangay" required placeholder="Barangay 1">
            <label>Kontak</label>
            <input type="text" id="m-contact" required placeholder="09123456789">
        `;
    } else if (type === 'center') {
        fields = `
            <label>Pangalan ng Center</label>
            <input type="text" id="m-center" required placeholder="Center A">
            <label>Barangay</label>
            <input type="text" id="m-barangay" required placeholder="Barangay 1">
        `;
    } else if (type === 'barangay') {
        fields = `
            <label>Pangalan ng Barangay</label>
            <input type="text" id="m-brgy" required placeholder="Barangay 1">
        `;
    } else if (type === 'officer') {
        fields = `
            <label>Pangalan ng Officer</label>
            <input type="text" id="m-ofc-name" required placeholder="Juan">
            <label>Email</label>
            <input type="email" id="m-ofc-email" required placeholder="officer@lms.internal">
            <label>Password</label>
            <input type="password" id="m-ofc-pass" required placeholder="••••••••">
            <label>Assigned Barangays (Comma separated)</label>
            <input type="text" id="m-ofc-brgy" placeholder="Barangay 1, Barangay 2">
        `;
    } else {
        fields = `<p>Form para sa ${type} ay ginagawa pa.</p>`;
    }

    form.innerHTML = `
        ${fields}
        <button type="submit" style="background: #2563eb; margin-top: 10px;">I-save</button>
        <button type="button" onclick="closeModal()" style="background: #6b7280; margin-top: 8px;">Isara</button>
    `;

    form.onsubmit = (e) => {
        e.preventDefault();
        saveModalData(type);
    };
}

function saveModalData(type) {
    const user = getCurrentUser();
    if (type === 'client') {
        const newItem = {
            id: Date.now(),
            name: document.getElementById('m-name').value,
            barangay: document.getElementById('m-barangay').value,
            contact: document.getElementById('m-contact').value
        };
        const clients = JSON.parse(localStorage.getItem('lms_clients'));
        clients.push(newItem);
        localStorage.setItem('lms_clients', JSON.stringify(clients));
    } else if (type === 'officer') {
        const brgyInput = document.getElementById('m-ofc-brgy').value.split(',').map(s => s.trim());
        const newOfficer = {
            id: Date.now(),
            name: document.getElementById('m-ofc-name').value,
            email: document.getElementById('m-ofc-email').value,
            password: document.getElementById('m-ofc-pass').value,
            role: 'officer',
            assignedBarangays: brgyInput
        };
        const accounts = JSON.parse(localStorage.getItem('lms_accounts'));
        accounts.push(newOfficer);
        localStorage.setItem('lms_accounts', JSON.stringify(accounts));
    }
    // Idagdag ang iba pang uri kung kailangan

    closeModal();
    loadDashboard(user);
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}
// --- INITIAL LOCALSTORAGE SETUP ---
function initStorage() {
    if (!localStorage.getItem('lms_accounts')) {
        const defaultAccounts = [
            { id: 1, email: 'admin@lms.internal', password: 'password123', role: 'admin', name: 'Main Administrator', assignedBarangays: [] },
            { id: 2, email: 'officer1@lms.internal', password: 'password123', role: 'officer', name: 'Officer Juan', assignedBarangays: ['Barangay 1', 'Barangay 2'] }
        ];
        localStorage.setItem('lms_accounts', JSON.stringify(defaultAccounts));
    }
    if (!localStorage.getItem('lms_centers')) {
        localStorage.setItem('lms_centers', JSON.stringify([
            { id: 1, name: 'Center A', barangay: 'Barangay 1' },
            { id: 2, name: 'Center B', barangay: 'Barangay 3' }
        ]));
    }
    if (!localStorage.getItem('lms_barangays')) {
        localStorage.setItem('lms_barangays', JSON.stringify([
            { id: 1, name: 'Barangay 1', center: 'Center A' },
            { id: 2, name: 'Barangay 2', center: 'Center A' },
            { id: 3, name: 'Barangay 3', center: 'Center B' }
        ]));
    }
    if (!localStorage.getItem('lms_clients')) {
        localStorage.setItem('lms_clients', JSON.stringify([
            { id: 1, name: 'Ana Reyes', barangay: 'Barangay 1', center: 'Center A', contact: '09123456789' },
            { id: 2, name: 'Pedro Penduko', barangay: 'Barangay 2', center: 'Center A', contact: '09987654321' },
            { id: 3, name: 'Clara Santos', barangay: 'Barangay 3', center: 'Center B', contact: '09112233445' }
        ]));
    }
    ['loans', 'payments', 'savings', 'transactions', 'audit', 'officers'].forEach(key => {
        if (!localStorage.getItem(`lms_${key}`)) {
            localStorage.setItem(`lms_${key}`, JSON.stringify([]));
        }
    });
}

initStorage();

document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Suriin kung may naka-login na
    const sessionEmail = localStorage.getItem('lms_current_session');
    if (sessionEmail) {
        startApp(sessionEmail);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();

            const accounts = JSON.parse(localStorage.getItem('lms_accounts'));
            const user = accounts.find(acc => acc.email === email && acc.password === password);

            if (user) {
                localStorage.setItem('lms_current_session', user.email);
                startApp(user.email);
            } else {
                loginError.style.display = 'block';
                loginError.textContent = 'Maling email o password.';
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('lms_current_session');
            loginView.style.display = 'flex';
            appView.style.display = 'none';
        });
    }
});

function getCurrentUser() {
    const email = localStorage.getItem('lms_current_session');
    if (!email) return null;
    const accounts = JSON.parse(localStorage.getItem('lms_accounts'));
    return accounts.find(acc => acc.email === email) || null;
}

function startApp(email) {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('app-view').style.display = 'flex';

    const user = getCurrentUser();
    buildNavigation(user);
    loadDashboard(user);
}

// --- BUILD DYNAMIC NAVIGATION DEPENDING ON ROLE ---
function buildNavigation(user) {
    const navContainer = document.getElementById('sidebar-nav');
    const titleEl = document.getElementById('sidebar-title');

    let navHtml = `<button class="nav-btn active" data-tab="dashboard">Dashboard</button>`;

    if (user.role === 'admin') {
        titleEl.textContent = 'LMS Administrator';
        navHtml += `
            <button class="nav-btn" data-tab="centers">Centers</button>
            <button class="nav-btn" data-tab="barangays">Barangays</button>
            <button class="nav-btn" data-tab="officers">Officers</button>
            <button class="nav-btn" data-tab="clients">Clients</button>
            <button class="nav-btn" data-tab="loans">Loans / Financing</button>
            <button class="nav-btn" data-tab="payments">Payments</button>
            <button class="nav-btn" data-tab="savings">Savings</button>
            <button class="nav-btn" data-tab="transactions">Transactions</button>
            <button class="nav-btn" data-tab="reports">Reports</button>
            <button class="nav-btn" data-tab="audit">Audit Logs</button>
            <button class="nav-btn" data-tab="settings">System Settings</button>
        `;
    } else {
        titleEl.textContent = `Officer: ${user.name}`;
        navHtml += `
            <button class="nav-btn" data-tab="clients">Clients (Assigned)</button>
            <button class="nav-btn" data-tab="loans">Loans</button>
            <button class="nav-btn" data-tab="payments">Payments</button>
            <button class="nav-btn" data-tab="savings">Savings</button>
            <button class="nav-btn" data-tab="transactions">Transactions</button>
            <button class="nav-btn" data-tab="reports">Reports</button>
        `;
    }

    navContainer.innerHTML = navHtml;

    // Tab switching event binding
    const navButtons = navContainer.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tabName = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(sec => sec.style.display = 'none');
            
            const target = document.getElementById(`tab-${tabName}`);
            if (target) {
                target.style.display = 'block';
                loadTabData(tabName, user);
            }
        });
    });
}

// --- DASHBOARD LOADER ---
function loadDashboard(user) {
    const title = document.getElementById('dash-title');
    const subtitle = document.getElementById('dash-subtitle');
    const metricsContainer = document.getElementById('metrics-container');
    const actionsContainer = document.getElementById('action-buttons-container');

    if (user.role === 'admin') {
        title.textContent = 'Main Dashboard (Full Access)';
        subtitle.textContent = 'Pangkalahatang buod ng buong sistema.';

        const centers = JSON.parse(localStorage.getItem('lms_centers')).length;
        const barangays = JSON.parse(localStorage.getItem('lms_barangays')).length;
        const officers = JSON.parse(localStorage.getItem('lms_accounts')).filter(a => a.role === 'officer').length;
        const clients = JSON.parse(localStorage.getItem('lms_clients')).length;
        const loans = JSON.parse(localStorage.getItem('lms_loans')).length;

        metricsContainer.innerHTML = `
            <div class="card"><p>Total Centers</p><h3>${centers}</h3></div>
            <div class="card"><p>Total Barangays</p><h3>${barangays}</h3></div>
            <div class="card"><p>Total Officers</p><h3>${officers}</h3></div>
            <div class="card"><p>Total Clients</p><h3>${clients}</h3></div>
            <div class="card"><p>Active Loans</p><h3>${loans}</h3></div>
            <div class="card"><p>Outstanding Balance</p><h3>₱ 0</h3></div>
        `;

        actionsContainer.innerHTML = `
            <button onclick="openModal('center')">+ ADD CENTER</button>
            <button onclick="openModal('barangay')">+ ADD BARANGAY</button>
            <button onclick="openModal('officer')">+ ADD OFFICER</button>
            <button onclick="openModal('client')">+ ADD CLIENT</button>
            <button onclick="openModal('loan')" class="btn-green">+ NEW LOAN</button>
            <button onclick="openModal('payment')" class="btn-green">RECORD PAYMENT</button>
        `;
    } else {
        title.textContent = `Welcome, Officer ${user.name}`;
        subtitle.textContent = `Mga nakatalagang Barangay: ${user.assignedBarangays.join(', ') || 'Wala pang assigned barangay'}`;

        // Filter clients based on assigned barangays
        const allClients = JSON.parse(localStorage.getItem('lms_clients'));
        const assignedClients = allClients.filter(c => user.assignedBarangays.includes(c.barangay));

        metricsContainer.innerHTML = `
            <div class="card"><p>Assigned Barangays</p><h3>${user.assignedBarangays.length}</h3></div>
            <div class="card"><p>Clients in Scope</p><h3>${assignedClients.length}</h3></div>
            <div class="card"><p>Today's Collection</p><h3>₱ 0</h3></div>
        `;

        actionsContainer.innerHTML = `
            <button onclick="openModal('client')">+ ADD CLIENT</button>
            <button onclick="openModal('loan')" class="btn-green">+ NEW LOAN</button>
            <button onclick="openModal('payment')" class="btn-green">RECORD PAYMENT</button>
        `;
    }
}

// --- DATA FILTERING FOR TABLES (BARANGAY SCOPE) ---
function loadTabData(tabName, user) {
    if (tabName === 'dashboard') {
        loadDashboard(user);
        return;
    }

    const container = document.getElementById(`table-${tabName}`);
    if (!container) return;

    let rawData = JSON.parse(localStorage.getItem(`lms_${tabName}`)) || [];

    // Kung officer, i-filter ang clients/loans ayon sa assigned barangays
    if (user.role === 'officer' && (tabName === 'clients' || tabName === 'loans' || tabName === 'payments')) {
        rawData = rawData.filter(item => user.assignedBarangays.includes(item.barangay));
    }

    if (rawData.length === 0) {
        container.innerHTML = `<p style="padding: 20px; color: #6b7280;">Walang nakitang rekord para sa sakop mo.</p>`;
        return;
    }

    let html = '<table><thead><tr>';
    const keys = Object.keys(rawData[0]);
    keys.forEach(k => html += `<th>${k}</th>`);
    html += '</tr></thead><tbody>';

    rawData.forEach(row => {
        html += '<tr>';
        keys.forEach(k => html += `<td>${row[k]}</td>`);
        html += '</tr>';
    });
    html += '</tbody></table>';

    container.innerHTML = html;
}

// --- MODAL & FORM HANDLERS ---
function openModal(type) {
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('dynamic-form');

    title.textContent = `Magdagdag ng ${type}`;
    overlay.style.display = 'flex';

    let fields = '';
    if (type === 'client') {
        fields = `
            <label>Pangalan ng Kliyente</label>
            <input type="text" id="m-name" required placeholder="Pangalan">
            <label>Barangay</label>
            <input type="text" id="m-barangay" required placeholder="Barangay 1">
            <label>Kontak</label>
            <input type="text" id="m-contact" required placeholder="09123456789">
        `;
    } else if (type === 'center') {
        fields = `
            <label>Pangalan ng Center</label>
            <input type="text" id="m-center" required placeholder="Center A">
            <label>Barangay</label>
            <input type="text" id="m-barangay" required placeholder="Barangay 1">
        `;
    } else if (type === 'barangay') {
        fields = `
            <label>Pangalan ng Barangay</label>
            <input type="text" id="m-brgy" required placeholder="Barangay 1">
        `;
    } else if (type === 'officer') {
        fields = `
            <label>Pangalan ng Officer</label>
            <input type="text" id="m-ofc-name" required placeholder="Juan">
            <label>Email</label>
            <input type="email" id="m-ofc-email" required placeholder="officer@lms.internal">
            <label>Password</label>
            <input type="password" id="m-ofc-pass" required placeholder="••••••••">
            <label>Assigned Barangays (Comma separated)</label>
            <input type="text" id="m-ofc-brgy" placeholder="Barangay 1, Barangay 2">
        `;
    } else {
        fields = `<p>Form para sa ${type} ay ginagawa pa.</p>`;
    }

    form.innerHTML = `
        ${fields}
        <button type="submit" style="background: #2563eb; margin-top: 10px;">I-save</button>
        <button type="button" onclick="closeModal()" style="background: #6b7280; margin-top: 8px;">Isara</button>
    `;

    form.onsubmit = (e) => {
        e.preventDefault();
        saveModalData(type);
    };
}

function saveModalData(type) {
    const user = getCurrentUser();
    if (type === 'client') {
        const newItem = {
            id: Date.now(),
            name: document.getElementById('m-name').value,
            barangay: document.getElementById('m-barangay').value,
            contact: document.getElementById('m-contact').value
        };
        const clients = JSON.parse(localStorage.getItem('lms_clients'));
        clients.push(newItem);
        localStorage.setItem('lms_clients', JSON.stringify(clients));
    } else if (type === 'officer') {
        const brgyInput = document.getElementById('m-ofc-brgy').value.split(',').map(s => s.trim());
        const newOfficer = {
            id: Date.now(),
            name: document.getElementById('m-ofc-name').value,
            email: document.getElementById('m-ofc-email').value,
            password: document.getElementById('m-ofc-pass').value,
            role: 'officer',
            assignedBarangays: brgyInput
        };
        const accounts = JSON.parse(localStorage.getItem('lms_accounts'));
        accounts.push(newOfficer);
        localStorage.setItem('lms_accounts', JSON.stringify(accounts));
    }
    // Idagdag ang iba pang uri kung kailangan

    closeModal();
    loadDashboard(user);
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}
