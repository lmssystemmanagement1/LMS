const SUPABASE_URL = 'https://evxdalxwavcbudampzqu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gKbvXT1EWnBIN6zu1-NlsQ_9acw0vId';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUserEmail = '';

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    handleSession(session);

    supabase.auth.onAuthStateChange((_event, session) => {
        handleSession(session);
    });

    // Navigation Tabs
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
            e.target.classList.add('active');
            const tabId = e.target.getAttribute('data-tab');
            document.getElementById(`tab-${tabId}`).style.display = 'block';
            loadTabData(tabId);
        });
    });

    // Login Handler
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errDiv = document.getElementById('login-error');
        errDiv.style.display = 'none';

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            errDiv.textContent = error.message;
            errDiv.style.display = 'block';
        }
    });

    // Logout Handler
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
    });
});

function handleSession(session) {
    if (session) {
        currentUserEmail = session.user.email;
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('app-view').style.display = 'flex';
        loadTabData('dashboard');
    } else {
        currentUserEmail = '';
        document.getElementById('login-view').style.display = 'flex';
        document.getElementById('app-view').style.display = 'none';
    }
}

async function loadTabData(tabId) {
    if (tabId === 'dashboard') {
        fetchMetrics();
    } else if (['centers', 'barangays', 'officers', 'clients', 'loans', 'transactions', 'audit'].includes(tabId)) {
        fetchTableData(tabId);
    }
}

async function fetchMetrics() {
    try {
        const [
            { count: c }, { count: b }, { count: o }, { count: cl },
            { count: ac }, { count: pe }, { count: ov }, { data: loansData }
        ] = await Promise.all([
            supabase.from('centers').select('*', { count: 'exact', head: true }),
            supabase.from('barangays').select('*', { count: 'exact', head: true }),
            supabase.from('officers').select('*', { count: 'exact', head: true }),
            supabase.from('clients').select('*', { count: 'exact', head: true }),
            supabase.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
            supabase.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
            supabase.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'OVERDUE'),
            supabase.from('loans').select('outstanding_balance')
        ]);

        let totalBal = 0;
        loansData?.forEach(l => totalBal += Number(l.outstanding_balance || 0));

        document.getElementById('m-centers').textContent = c || 0;
        document.getElementById('m-barangays').textContent = b || 0;
        document.getElementById('m-officers').textContent = o || 0;
        document.getElementById('m-clients').textContent = cl || 0;
        document.getElementById('m-active-loans').textContent = ac || 0;
        document.getElementById('m-pending').textContent = pe || 0;
        document.getElementById('m-overdue').textContent = ov || 0;
        document.getElementById('m-balance').textContent = `₱ ${totalBal.toLocaleString()}`;
    } catch (err) {
        console.error(err);
    }
}

async function fetchTableData(tableName) {
    const container = document.getElementById(`table-${tableName}`);
    container.innerHTML = '<p style="padding:20px;text-align:center;">Loading...</p>';
    
    let query = supabase.from(tableName).select('*');
    if (tableName === 'transactions' || tableName === 'audit') {
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
        container.innerHTML = `<p style="padding:20px;color:red;">Error: ${error.message}</p>`;
        return;
    }

    if (!data || data.length === 0) {
        container.innerHTML = '<div style="padding:30px;text-align:center;color:#6b7280;">NO DATA AVAILABLE</div>';
        return;
    }

    const keys = Object.keys(data[0]);
    let html = '<table><thead><tr>';
    keys.forEach(k => html += `<th>${k.replace('_', ' ')}</th>`);
    html += '</tr></thead><tbody>';

    data.forEach(row => {
        html += '<tr>';
        keys.forEach(k => {
            let val = row[k];
            if (typeof val === 'object') val = JSON.stringify(val);
            html += `<td>${val !== null ? val : '-'}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function openModal(type) {
    const overlay = document.getElementById('modal-overlay');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('dynamic-form');
    title.textContent = `Add ${type}`;
    overlay.style.display = 'flex';

    let html = '';
    if (type === 'center') {
        html = `<input type="text" id="f-name" placeholder="Center Name" required>
                <input type="text" id="f-loc" placeholder="Location" required>`;
    } else if (type === 'barangay') {
        html = `<input type="text" id="f-bname" placeholder="Barangay Name" required>
                <input type="text" id="f-cid" placeholder="Center ID" required>`;
    } else if (type === 'officer') {
        html = `<input type="text" id="f-oname" placeholder="Full Name" required>
                <input type="text" id="f-ocont" placeholder="Contact Number" required>
                <input type="text" id="f-ouser" placeholder="Username" required>
                <input type="password" id="f-opass" placeholder="Password" required>`;
    } else if (type === 'client') {
        html = `<input type="text" id="f-cname" placeholder="Full Name" required>
                <input type="text" id="f-ccont" placeholder="Contact Number" required>
                <input type="text" id="f-caddr" placeholder="Address" required>
                <input type="text" id="f-cbrgy" placeholder="Barangay" required>`;
    } else if (type === 'loan') {
        html = `<input type="text" id="f-lclient" placeholder="Client ID (UUID)" required>
                <input type="number" id="f-lamt" placeholder="Loan Amount" required>`;
    } else if (type === 'payment') {
        html = `<select id="f-ptype" required>
                    <option value="">Select Transaction Type</option>
                    <option value="LOAN_PAYMENT">Loan Payment</option>
                    <option value="SAVINGS_DEPOSIT">Savings Deposit</option>
                    <option value="SAVINGS_WITHDRAWAL">Savings Withdrawal</option>
                </select>
                <input type="number" id="f-pamt" placeholder="Amount (₱)" required>`;
    }

    html += `<div style="display:flex;gap:10px;margin-top:20px;">
                <button type="submit" style="flex:1;background:#2563eb;">Save</button>
                <button type="button" onclick="closeModal()" style="flex:1;background:#6b7280;">Cancel</button>
             </div>`;
    form.innerHTML = html;

    form.onsubmit = async (e) => {
        e.preventDefault();
        await handleFormSubmit(type);
    };
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

async function handleFormSubmit(type) {
    try {
        let payload = {};
        let tableName = type;

        if (type === 'center') {
            payload = { center_name: document.getElementById('f-name').value, location: document.getElementById('f-loc').value };
        } else if (type === 'barangay') {
            tableName = 'barangays';
            payload = { barangay_name: document.getElementById('f-bname').value, center_id: document.getElementById('f-cid').value };
        } else if (type === 'officer') {
            tableName = 'officers';
            payload = { full_name: document.getElementById('f-oname').value, contact_number: document.getElementById('f-ocont').value, username: document.getElementById('f-ouser').value, password: document.getElementById('f-opass').value };
        } else if (type === 'client') {
            tableName = 'clients';
            payload = { full_name: document.getElementById('f-cname').value, contact_number: document.getElementById('f-ccont').value, address: document.getElementById('f-caddr').value, barangay: document.getElementById('f-cbrgy').value };
        } else if (type === 'loan') {
            tableName = 'loans';
            const amt = Number(document.getElementById('f-lamt').value);
            payload = { client_id: document.getElementById('f-lclient').value, loan_amount: amt, total_payable: amt * 1.2, outstanding_balance: amt * 1.2, status: 'PENDING' };
        } else if (type === 'payment') {
            tableName = 'transactions';
            payload = { type: document.getElementById('f-ptype').value, amount: Number(document.getElementById('f-pamt').value) };
        }

        const { error } = await supabase.from(tableName).insert([payload]);
        if (error) throw error;

        await supabase.from('audit_logs').insert([{ action: `CREATE_${type.toUpperCase()}`, details: `Created new ${type}`, user_email: currentUserEmail }]);

        closeModal();
        showAlert('Successfully saved to Supabase!', 'success');
        loadTabData('dashboard');
    } catch (err) {
        showAlert(err.message, 'error');
    }
}

function showAlert(msg, type) {
    const box = document.getElementById('alert-box');
    box.textContent = msg;
    box.className = `alert ${type}`;
    box.style.display = 'block';
    setTimeout(() => { box.style.display = 'none'; }, 4000);
}
