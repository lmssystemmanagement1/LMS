// Malinis na Supabase Client Initialization
const SUPABASE_URL = 'https://evxdalxwavcbudampzqu.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE'; // Ilagay ang tamang anon key dito

// Siguraduhing iisa lang ang instance ng client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Suriin kung may active session na
    const { data: { session } } = await supabase.auth.getSession();
    updateView(session);

    // Makinig sa pagbabago ng auth state
    supabase.auth.onAuthStateChange((event, session) => {
        updateView(session);
    });

    // Login Form Event Listener
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (loginError) {
                loginError.style.display = 'none';
                loginError.textContent = '';
            }

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                if (loginError) {
                    loginError.style.display = 'block';
                    loginError.textContent = error.message;
                }
                return;
            }
        });
    }

    // Logout Event Listener
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabase.auth.signOut();
        });
    }

    function updateView(session) {
        if (session) {
            if (loginView) loginView.style.display = 'none';
            if (appView) appView.style.display = 'flex';
            loadDashboardData();
        } else {
            if (loginView) loginView.style.display = 'flex';
            if (appView) appView.style.display = 'none';
        }
    }

    // Navigation para sa mga tabs
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tabName = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(section => {
                section.style.display = 'none';
            });

            const target = document.getElementById(`tab-${tabName}`);
            if (target) {
                target.style.display = 'block';
                loadTabData(tabName);
            }
        });
    });
});

async function loadDashboardData() {
    try {
        const { count: cCount } = await supabase.from('centers').select('*', { count: 'exact', head: true });
        const { count: bCount } = await supabase.from('barangays').select('*', { count: 'exact', head: true });
        const { count: oCount } = await supabase.from('officers').select('*', { count: 'exact', head: true });
        const { count: clCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
        const { count: lCount } = await supabase.from('loans').select('*', { count: 'exact', head: true });

        if (document.getElementById('m-centers')) document.getElementById('m-centers').textContent = cCount || 0;
        if (document.getElementById('m-barangays')) document.getElementById('m-barangays').textContent = bCount || 0;
        if (document.getElementById('m-officers')) document.getElementById('m-officers').textContent = oCount || 0;
        if (document.getElementById('m-clients')) document.getElementById('m-clients').textContent = clCount || 0;
        if (document.getElementById('m-active-loans')) document.getElementById('m-active-loans').textContent = lCount || 0;
    } catch (err) {
        console.error('Error fetching metrics:', err);
    }
}

async function loadTabData(tabName) {
    if (tabName === 'dashboard') {
        loadDashboardData();
        return;
    }

    const container = document.getElementById(`table-${tabName}`);
    if (!container) return;

    container.innerHTML = '<p style="padding: 20px;">Naglo-load ng data...</p>';

    try {
        const { data, error } = await supabase.from(tabName).select('*');
        if (error) {
            container.innerHTML = `<p style="padding: 20px; color: red;">Error: ${error.message}</p>`;
            return;
        }

        if (!data || data.length === 0) {
            container.innerHTML = '<p style="padding: 20px;">Walang nakitang tala.</p>';
            return;
        }

        let html = '<table><thead><tr>';
        const keys = Object.keys(data[0]);
        keys.forEach(k => html += `<th>${k}</th>`);
        html += '</tr></thead><tbody>';

        data.forEach(row => {
            html += '<tr>';
            keys.forEach(k => html += `<td>${row[k] !== null ? row[k] : ''}</td>`);
            html += '</tr>';
        });
        html += '</tbody></table>';

        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = '<p style="padding: 20px; color: red;">Nabigo sa pagkarga ng data.</p>';
    }
}

function openModal(type) {
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('dynamic-form');

    if (title) title.textContent = `Magdagdag ng ${type}`;
    if (overlay) overlay.style.display = 'flex';
    if (form) {
        form.innerHTML = `
            <p style="margin-bottom: 15px; font-size: 14px;">Form para sa ${type}.</p>
            <button type="button" onclick="closeModal()" style="background: #6b7280;">Isara</button>
        `;
    }
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.style.display = 'none';
}
