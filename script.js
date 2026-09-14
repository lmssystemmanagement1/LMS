// 1. Supabase Initialization
const SUPABASE_URL = 'https://evxdalxwavcbudampzqu.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE'; // Palitan kung kinakailangan o panatilihin kung tama na

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Check existing session on load
    const { data: { session } } = await supabase.auth.getSession();
    handleAuthChange(session);

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
        handleAuthChange(session);
    });

    // Login Form Submit Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginError.style.display = 'none';
            loginError.textContent = '';

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                loginError.style.display = 'block';
                loginError.textContent = error.message;
                return;
            }
        });
    }

    // Logout Handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabase.auth.signOut();
        });
    }

    function handleAuthChange(session) {
        if (session) {
            loginView.style.display = 'none';
            appView.style.display = 'flex';
            loadDashboardMetrics();
        } else {
            loginView.style.display = 'flex';
            appView.style.display = 'none';
        }
    }

    // Sidebar Tab Navigation Logic
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
                loadTabData(tabName);
            }
        });
    });
});

// Load Dashboard Metrics Counts
async function loadDashboardMetrics() {
    try {
        const { count: centersCount } = await supabase.from('centers').select('*', { count: 'exact', head: true });
        const { count: barangaysCount } = await supabase.from('barangays').select('*', { count: 'exact', head: true });
        const { count: officersCount } = await supabase.from('officers').select('*', { count: 'exact', head: true });
        const { count: clientsCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
        const { count: loansCount } = await supabase.from('loans').select('*', { count: 'exact', head: true });

        if (document.getElementById('m-centers')) document.getElementById('m-centers').textContent = centersCount || 0;
        if (document.getElementById('m-barangays')) document.getElementById('m-barangays').textContent = barangaysCount || 0;
        if (document.getElementById('m-officers')) document.getElementById('m-officers').textContent = officersCount || 0;
        if (document.getElementById('m-clients')) document.getElementById('m-clients').textContent = clientsCount || 0;
        if (document.getElementById('m-active-loans')) document.getElementById('m-active-loans').textContent = loansCount || 0;
    } catch (err) {
        console.error('Error loading metrics:', err);
    }
}

// Dynamic Tab Data Loading (Tables)
async function loadTabData(tabName) {
    if (tabName === 'dashboard') {
        loadDashboardMetrics();
        return;
    }

    const tableContainer = document.getElementById(`table-${tabName}`);
    if (!tableContainer) return;

    tableContainer.innerHTML = '<p style="padding: 20px;">Loading data...</p>';

    try {
        const { data, error } = await supabase.from(tabName).select('*');

        if (error) {
            tableContainer.innerHTML = `<p style="padding: 20px; color: red;">Error: ${error.message}</p>`;
            return;
        }

        if (!data || data.length === 0) {
            tableContainer.innerHTML = '<p style="padding: 20px;">No records found.</p>';
            return;
        }

        // Build HTML Table dynamically
        let html = '<table><thead><tr>';
        const keys = Object.keys(data[0]);
        keys.forEach(key => {
            html += `<th>${key}</th>`;
        });
        html += '</tr></thead><tbody>';

        data.forEach(row => {
            html += '<tr>';
            keys.forEach(key => {
                html += `<td>${row[key] !== null ? row[key] : ''}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        tableContainer.innerHTML = html;
    } catch (err) {
        console.error(`Error loading ${tabName}:`, err);
        tableContainer.innerHTML = '<p style="padding: 20px; color: red;">Failed to load data.</p>';
    }
}

// Modal Form Handlers (Stub para sa Quick Actions)
function openModal(type) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const dynamicForm = document.getElementById('dynamic-form');

    modalTitle.textContent = `Add New ${type}`;
    modalOverlay.style.display = 'flex';

    dynamicForm.innerHTML = `
        <p style="margin-bottom: 15px; font-size: 14px;">Form for ${type} goes here.</p>
        <button type="button" onclick="closeModal()" style="background: #6b7280; margin-top: 10px;">Close</button>
    `;
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}
// 1. Supabase Initialization
const SUPABASE_URL = 'https://evxdalxwavcbudampzqu.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE'; // Palitan kung kinakailangan o panatilihin kung tama na

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Check existing session on load
    const { data: { session } } = await supabase.auth.getSession();
    handleAuthChange(session);

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
        handleAuthChange(session);
    });

    // Login Form Submit Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginError.style.display = 'none';
            loginError.textContent = '';

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                loginError.style.display = 'block';
                loginError.textContent = error.message;
                return;
            }
        });
    }

    // Logout Handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabase.auth.signOut();
        });
    }

    function handleAuthChange(session) {
        if (session) {
            loginView.style.display = 'none';
            appView.style.display = 'flex';
            loadDashboardMetrics();
        } else {
            loginView.style.display = 'flex';
            appView.style.display = 'none';
        }
    }

    // Sidebar Tab Navigation Logic
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
                loadTabData(tabName);
            }
        });
    });
});

// Load Dashboard Metrics Counts
async function loadDashboardMetrics() {
    try {
        const { count: centersCount } = await supabase.from('centers').select('*', { count: 'exact', head: true });
        const { count: barangaysCount } = await supabase.from('barangays').select('*', { count: 'exact', head: true });
        const { count: officersCount } = await supabase.from('officers').select('*', { count: 'exact', head: true });
        const { count: clientsCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
        const { count: loansCount } = await supabase.from('loans').select('*', { count: 'exact', head: true });

        if (document.getElementById('m-centers')) document.getElementById('m-centers').textContent = centersCount || 0;
        if (document.getElementById('m-barangays')) document.getElementById('m-barangays').textContent = barangaysCount || 0;
        if (document.getElementById('m-officers')) document.getElementById('m-officers').textContent = officersCount || 0;
        if (document.getElementById('m-clients')) document.getElementById('m-clients').textContent = clientsCount || 0;
        if (document.getElementById('m-active-loans')) document.getElementById('m-active-loans').textContent = loansCount || 0;
    } catch (err) {
        console.error('Error loading metrics:', err);
    }
}

// Dynamic Tab Data Loading (Tables)
async function loadTabData(tabName) {
    if (tabName === 'dashboard') {
        loadDashboardMetrics();
        return;
    }

    const tableContainer = document.getElementById(`table-${tabName}`);
    if (!tableContainer) return;

    tableContainer.innerHTML = '<p style="padding: 20px;">Loading data...</p>';

    try {
        const { data, error } = await supabase.from(tabName).select('*');

        if (error) {
            tableContainer.innerHTML = `<p style="padding: 20px; color: red;">Error: ${error.message}</p>`;
            return;
        }

        if (!data || data.length === 0) {
            tableContainer.innerHTML = '<p style="padding: 20px;">No records found.</p>';
            return;
        }

        // Build HTML Table dynamically
        let html = '<table><thead><tr>';
        const keys = Object.keys(data[0]);
        keys.forEach(key => {
            html += `<th>${key}</th>`;
        });
        html += '</tr></thead><tbody>';

        data.forEach(row => {
            html += '<tr>';
            keys.forEach(key => {
                html += `<td>${row[key] !== null ? row[key] : ''}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        tableContainer.innerHTML = html;
    } catch (err) {
        console.error(`Error loading ${tabName}:`, err);
        tableContainer.innerHTML = '<p style="padding: 20px; color: red;">Failed to load data.</p>';
    }
}

// Modal Form Handlers (Stub para sa Quick Actions)
function openModal(type) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const dynamicForm = document.getElementById('dynamic-form');

    modalTitle.textContent = `Add New ${type}`;
    modalOverlay.style.display = 'flex';

    dynamicForm.innerHTML = `
        <p style="margin-bottom: 15px; font-size: 14px;">Form for ${type} goes here.</p>
        <button type="button" onclick="closeModal()" style="background: #6b7280; margin-top: 10px;">Close</button>
    `;
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}
