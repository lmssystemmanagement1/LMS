// LocalStorage Database initialization (Zero demo data state)
let db = {
    officers: [
        { username: "officer_juan", name: "Juan Santos", barangays: ["Brgy. 1", "Brgy. 2"] }
    ],
    centers: [
        { id: "C-01", name: "Center Alpha", barangay: "Brgy. 1" },
        { id: "C-02", name: "Center Beta", barangay: "Brgy. 2" }
    ],
    clients: [],
    loans: [],
    savings: [], // stores { clientId, cbu, lcbu }
    transactions: [],
    auditLogs: []
};

// Load saved data if available
if(localStorage.getItem('lms_db')) {
    db = JSON.parse(localStorage.getItem('lms_db'));
} else {
    saveDB();
}

function saveDB() {
    localStorage.setItem('lms_db', JSON.stringify(db));
}

let loggedUser = null;
let selectedBarangay = null;
let selectedCenter = null;
let activeClient = null;

function handleLogin() {
    const user = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-password').value.trim();

    if(!user || !pass) {
        alert("Mangyaring ilagay ang username at password.");
        return;
    }

    if(user === 'admin' && pass === 'admin') {
        loggedUser = { role: 'main', name: 'Main Owner' };
        initMainDashboard();
    } else {
        const foundOfficer = db.officers.find(o => o.username === user);
        if(foundOfficer && pass === 'admin') { // default sample password check or hashed verification simulation
            loggedUser = { role: 'officer', ...foundOfficer };
            initOfficerDashboard();
        } else {
            alert("Maling kredensyal o walang rehistradong account.");
            return;
        }
    }

    document.getElementById('view-login').style.display = 'none';
    document.getElementById('main-navbar').style.display = 'flex';
    document.getElementById('main-container').style.display = 'block';
    document.getElementById('logged-user-label').innerText = `Logged in as: ${loggedUser.name} (${loggedUser.role.toUpperCase()})`;
    
    logAudit(loggedUser.name, "Logged in to LMS");
}

function logout() {
    if(loggedUser) logAudit(loggedUser.name, "Logged out");
    loggedUser = null;
    document.getElementById('view-login').style.display = 'flex';
    document.getElementById('main-navbar').style.display = 'none';
    document.getElementById('main-container').style.display = 'none';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
}

// ================= MAIN DASHBOARD =================
function initMainDashboard() {
    document.getElementById('view-main').style.display = 'block';
    document.getElementById('view-officer').style.display = 'none';

    document.getElementById('m-centers').innerText = db.centers.length;
    document.getElementById('m-barangays').innerText = [...new Set(db.centers.map(c => c.barangay))].length;
    document.getElementById('m-officers').innerText = db.officers.length;
    document.getElementById('m-clients').innerText = db.clients.length;
    document.getElementById('m-active-loans').innerText = db.loans.filter(l => l.status === 'ACTIVE').length;
    
    const totalColl = db.transactions.reduce((acc, t) => acc + (t.type === 'PAYMENT' ? t.amount : 0), 0);
    document.getElementById('m-collections').innerText = `₱${totalColl.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

    renderAuditLogs();
}

function renderAuditLogs() {
    const tbody = document.getElementById('audit-log-tbody');
    if(db.auditLogs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #7f8c8d;">NO AUDIT LOGS</td></tr>`;
        return;
    }
    tbody.innerHTML = db.auditLogs.map(log => `
        <tr><td>${log.who}</td><td>${log.what}</td><td>${log.when}</td></tr>
    `).join('');
}

function logAudit(who, what) {
    db.auditLogs.unshift({ who, what, when: new Date().toLocaleString() });
    saveDB();
}

// ================= OFFICER DASHBOARD =================
function initOfficerDashboard() {
    document.getElementById('view-main').style.display = 'none';
    document.getElementById('view-officer').style.display = 'block';

    document.getElementById('officer-welcome-title').innerText = `WELCOME, OFFICER ${loggedUser.name.toUpperCase()}`;
    
    const container = document.getElementById('officer-barangay-container');
    if(loggedUser.barangays.length === 0) {
        container.innerHTML = `<p style="color: #7f8c8d; font-style: italic;">NO BARANGAY ASSIGNED</p>`;
        return;
    }

    container.innerHTML = loggedUser.barangays.map(b => `
        <div class="chip" onclick="selectBarangay('${b}')">${b}</div>
    `).join('');
}

function selectBarangay(brgy) {
    selectedBarangay = brgy;
    document.getElementById('center-section').style.display = 'block';
    document.getElementById('selected-barangay-title').innerText = `Centers under ${brgy}`;
    
    const centers = db.centers.filter(c => c.barangay === brgy);
    const container = document.getElementById('barangay-center-container');
    
    if(centers.length === 0) {
        container.innerHTML = `<p style="color: #7f8c8d; font-style: italic;">NO CENTER FOUND</p>`;
        document.getElementById('client-list-section').style.display = 'none';
        return;
    }

    container.innerHTML = centers.map(c => `
        <button onclick="selectCenter('${c.id}')" class="btn-secondary" style="margin-right: 10px;">${c.name}</button>
    `).join('');
}

function selectCenter(centerId) {
    selectedCenter = db.centers.find(c => c.id === centerId);
    document.getElementById('client-list-section').style.display = 'block';
    document.getElementById('center-client-title').innerText = `Clients in ${selectedCenter.name} (${selectedCenter.barangay})`;
    renderClients();
}

function renderClients() {
    const tbody = document.getElementById('client-table-tbody');
    const filtered = db.clients.filter(c => c.barangay === selectedBarangay);

    if(filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #7f8c8d;">NO CLIENTS FOUND</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(c => `
        <tr>
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td>${c.contact}</td>
            <td><button onclick="openClientProfile('${c.id}')">View Profile</button></td>
        </tr>
    `).join('');
}

// ================= CLIENT MANAGEMENT & PROFILE =================
function saveNewClient() {
    const name = document.getElementById('ac-name').value.trim();
    const contact = document.getElementById('ac-contact').value.trim();
    const address = document.getElementById('ac-address').value.trim();

    if(!name) { alert("Ilagay ang pangalan ng kliyente."); return; }

    const newClient = {
        id: 'CL-' + Math.floor(100000 + Math.random() * 900000),
        name, contact, address,
        barangay: selectedBarangay,
        center: selectedCenter ? selectedCenter.name : 'Unassigned',
        officer: loggedUser.name
    };

    db.clients.push(newClient);
    db.savings.push({ clientId: newClient.id, cbu: 0, lcbu: 0 });
    saveDB();
    logAudit(loggedUser.name, `Created client ${name} (${newClient.id})`);

    closeModal('addClientModal');
    renderClients();
    alert("Kliyente ay matagumpay na naidagdag!");
}

function openClientProfile(clientId) {
    activeClient = db.clients.find(c => c.id === clientId);
    
    document.getElementById('client-list-section').style.display = 'none';
    document.getElementById('center-section').style.display = 'none';
    document.getElementById('client-profile-section').style.display = 'block';

    document.getElementById('cp-name').innerText = activeClient.name;
    document.getElementById('cp-id').innerText = activeClient.id;
    document.getElementById('cp-center').innerText = activeClient.center;
    document.getElementById('cp-brgy').innerText = activeClient.barangay;

    renderClientLoansAndSavings();
}

function backToClientList() {
    activeClient = null;
    document.getElementById('client-profile-section').style.display = 'none';
    document.getElementById('center-section').style.display = 'block';
    document.getElementById('client-list-section').style.display = 'block';
}

function renderClientLoansAndSavings() {
    // Savings
    const sav = db.savings.find(s => s.clientId === activeClient.id) || { cbu: 0, lcbu: 0 };
    const totalSav = sav.cbu + sav.lcbu;
    document.getElementById('cp-savings-bal').innerText = `₱${totalSav.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

    // Loans
    const loans = db.loans.filter(l => l.clientId === activeClient.id);
    const tbody = document.getElementById('cp-loans-tbody');

    if(loans.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #7f8c8d;">NO LOANS FOUND</td></tr>`;
        return;
    }

    tbody.innerHTML = loans.map(l => `
        <tr>
            <td>${l.id}</td>
            <td>${l.type}</td>
            <td>₱${l.amount.toLocaleString()}</td>
            <td>₱${l.totalPayable.toLocaleString()}</td>
            <td>${l.status}</td>
            <td>-</td>
        </tr>
    `).join('');
}

// ================= LOAN WORKFLOW =================
function computeLoanPreview() {
    const amt = parseFloat(document.getElementById('l-amount').value) || 0;
    const markupRate = parseFloat(document.getElementById('l-markup').value) || 0;
    const term = parseInt(document.getElementById('l-term').value) || 1;

    const totalMarkup = amt * (markupRate / 100);
    const totalPayable = amt + totalMarkup;
    const weekly = term > 0 ? totalPayable / term : 0;

    document.getElementById('calc-markup').innerText = `₱${totalMarkup.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('calc-payable').innerText = `₱${totalPayable.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('calc-weekly').innerText = `₱${weekly.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
}

function submitNewLoan() {
    const amt = parseFloat(document.getElementById('l-amount').value) || 0;
    const markupRate = parseFloat(document.getElementById('l-markup').value) || 0;
    const term = parseInt(document.getElementById('l-term').value) || 1;
    const type = document.getElementById('l-type').value;
    const purpose = document.getElementById('l-purpose').value;

    if(amt <= 0) { alert("Maglagay ng wastong halaga."); return; }

    const totalMarkup = amt * (markupRate / 100);
    const totalPayable = amt + totalMarkup;

    const newLoan = {
        id: 'LN-' + Math.floor(100000 + Math.random() * 900000),
        clientId: activeClient.id,
        type, amount: amt, markupRate, totalMarkup, totalPayable, term, purpose,
        status: 'ACTIVE' // Instant release simulation for quick workflow testing
    };

    db.loans.push(newLoan);
    saveDB();
    logAudit(loggedUser.name, `Released Loan ${newLoan.id} to ${activeClient.name}`);

    closeModal('addLoanModal');
    renderClientLoansAndSavings();
    alert("Loan ay matagumpay na naisaproseso at na-release!");
}

// ================= TRANSACTION & PAYMENT =================
function confirmClientTransaction() {
    const loanPay = parseFloat(document.getElementById('pay-loan-amount').value) || 0;
    const savAmt = parseFloat(document.getElementById('pay-savings-amount').value) || 0;
    const type = document.getElementById('pay-trans-type').value;

    if(loanPay <= 0 && savAmt <= 0) {
        alert("Mangyaring maglagay ng halaga para sa Loan Payment o Savings.");
        return;
    }

    let sav = db.savings.find(s => s.clientId === activeClient.id);
    if(!sav) {
        sav = { clientId: activeClient.id, cbu: 0, lcbu: 0 };
        db.savings.push(sav);
    }

    if(type === 'WITHDRAW') {
        const totalSav = sav.cbu + sav.lcbu;
        if(savAmt > totalSav) {
            alert("INSUFFICIENT SAVINGS BALANCE");
            return;
        }
        sav.cbu -= savAmt; // Deduct from CBU
        logAudit(loggedUser.name, `Withdrawal of ₱${savAmt} for ${activeClient.name}`);
    } else {
        if(savAmt > 0) {
            sav.cbu += savAmt; // Add to CBU deposit
            logAudit(loggedUser.name, `Savings Deposit of ₱${savAmt} for ${activeClient.name}`);
        }
        if(loanPay > 0) {
            db.transactions.push({
                id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
                clientId: activeClient.id,
                type: 'PAYMENT',
                amount: loanPay,
                date: new Date().toLocaleString()
            });
            logAudit(loggedUser.name, `Loan Payment of ₱${loanPay} recorded for ${activeClient.name}`);
        }
    }

    saveDB();
    renderClientLoansAndSavings();
    
    // Clear inputs
    document.getElementById('pay-loan-amount').value = '';
    document.getElementById('pay-savings-amount').value = '';
    alert("Transaksiyon ay matagumpay na naitala!");
}

// Modal helpers
function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
