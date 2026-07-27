// ============================================
// SIPEDULI BADUNG - FRONTEND API HELPER
// Versi Lengkap dengan Kecamatan & Desa
// ============================================

// PENTING: GANTI URL INI DENGAN URL WEB APP ANDA
const API_URL = 'https://script.google.com/macros/s/AKfycbwQ5SXr0DgRiMhH7z0Nm2oFw_uCQ5emei-FWWtWj03XLfcLk1coQ_SL_uQDxP26EdEa/exec';

console.log('🔧 SIPEDULI BADUNG Helper.js loaded');
console.log('📍 API_URL:', API_URL);

// ============================================
// FUNGSI API GET
// ============================================
async function apiGet(action, params = {}) {
    console.log('\n📡 API GET:', action);
    
    try {
        if (!API_URL || API_URL.includes('GANTI_DENGAN_URL')) {
            throw new Error('API_URL belum dikonfigurasi di helper.js');
        }
        
        let url = API_URL + '?action=' + encodeURIComponent(action);
        
        Object.keys(params).forEach(key => {
            const value = params[key];
            if (value !== null && value !== undefined && value !== '' && value !== 'undefined') {
                url += '&' + key + '=' + encodeURIComponent(value);
            }
        });
        
        console.log('🔗 URL:', url);
        
        const response = await fetch(url, { 
            method: 'GET',
            redirect: 'follow'
        });
        
        const text = await response.text();
        console.log(' Response:', text.substring(0, 300));
        
        if (!text || text.trim() === '') {
            throw new Error('Response kosong dari server');
        }
        
        const data = JSON.parse(text);
        console.log('✅ Success:', data.success);
        return data;
        
    } catch (error) {
        console.error(' Error:', error.message);
        return { success: false, message: error.message };
    }
}

// ============================================
// FUNGSI API POST
// ============================================
async function apiPost(action, data = {}) {
    console.log('\n📤 API POST:', action);
    
    try {
        if (!API_URL || API_URL.includes('GANTI_DENGAN_URL')) {
            throw new Error('API_URL belum dikonfigurasi di helper.js');
        }
        
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: action, ...data }),
            redirect: 'follow'
        });
        
        const text = await response.text();
        const result = JSON.parse(text);
        console.log('✅ Response:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        return { success: false, message: error.message };
    }
}

// ============================================
// FUNGSI-FUNGSI API
// ============================================

async function login(username, password, role) { 
    return await apiGet('login', { username, password, role }); 
}

async function getDisabilitas(filters = {}) { 
    return await apiGet('getDisabilitas', filters); 
}

async function saveDisabilitas(data) { 
    return await apiPost('saveDisabilitas', data); 
}

async function updateDisabilitas(data) { 
    return await apiPost('updateDisabilitas', data); 
}

async function deleteDisabilitas(id) { 
    return await apiPost('deleteDisabilitas', { id }); 
}

async function getAsesmen(filters = {}) { 
    return await apiGet('getAsesmen', filters); 
}

async function saveAsesmen(data) { 
    return await apiPost('saveAsesmen', data); 
}

async function getBantuan(filters = {}) { 
    return await apiGet('getBantuan', filters); 
}

async function saveBantuan(data) { 
    return await apiPost('saveBantuan', data); 
}

async function updateStatusBantuan(data) { 
    return await apiPost('updateStatusBantuan', data); 
}

async function getStats() { 
    console.log('📊 Calling getStats');
    return await apiGet('getStats'); 
}

async function getPrioritas() { 
    return await apiGet('getPrioritas'); 
}

async function getAnalitik() { 
    return await apiGet('getAnalitik'); 
}

// ============================================
// FUNGSI BARU: KECAMATAN & DESA
// ============================================

async function getKecamatan() { 
    console.log('🏘️ Calling getKecamatan');
    return await apiGet('getKecamatan'); 
}

async function getDesa(kecamatan) { 
    console.log('🏘️ Calling getDesa for kecamatan:', kecamatan);
    return await apiGet('getDesa', { kecamatan: kecamatan }); 
}

async function getAllDesa() { 
    console.log('️ Calling getAllDesa');
    return await apiGet('getAllDesa'); 
}

// ============================================
// FUNGSI UI - NOTIFIKASI
// ============================================
function showNotif(pesan, tipe = 'success') {
    const container = document.getElementById('notifContainer') || document.body;
    const alertClass = tipe === 'success' ? 'alert-success' : 'alert-danger';
    const icon = tipe === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
    
    const notif = document.createElement('div');
    notif.className = `alert ${alertClass} alert-dismissible fade show position-fixed shadow`;
    notif.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 300px; border-radius: 10px;';
    notif.innerHTML = `
        <i class="bi ${icon} me-2"></i>${pesan}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    container.appendChild(notif);
    setTimeout(() => {
        if (notif.parentNode) notif.parentNode.removeChild(notif);
    }, 4000);
}

// ============================================
// FUNGSI UI - LOADING
// ============================================
function showLoading(pesan = 'Memproses...') {
    let loader = document.getElementById('globalLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'globalLoader';
        loader.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;';
        loader.innerHTML = `
            <div class="bg-white rounded-3 p-4 text-center shadow-lg">
                <div class="spinner-border text-success mb-2" role="status" style="width: 3rem; height: 3rem;"></div>
                <p class="mb-0 fw-semibold">${pesan}</p>
            </div>`;
        document.body.appendChild(loader);
    } else {
        loader.style.display = 'flex';
    }
}

function hideLoading() {
    const loader = document.getElementById('globalLoader');
    if (loader) loader.style.display = 'none';
}

// ============================================
// FUNGSI BARU: POPULATE DROPDOWN KECAMATAN
// ============================================
async function populateKecamatan(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    try {
        const result = await getKecamatan();
        if (result && result.success) {
            const currentVal = select.value;
            select.innerHTML = '<option value="">Pilih Kecamatan</option>';
            result.data.forEach(kec => {
                select.innerHTML += `<option value="${kec}">${kec}</option>`;
            });
            select.value = currentVal;
        }
    } catch (error) {
        console.error('Error loading kecamatan:', error);
    }
}

// ============================================
// FUNGSI BARU: POPULATE DROPDOWN DESA (CASCADING)
// ============================================
async function populateDesa(selectId, kecamatanSelectId) {
    const select = document.getElementById(selectId);
    const kecamatanSelect = document.getElementById(kecamatanSelectId);
    if (!select || !kecamatanSelect) return;
    
    const kecamatan = kecamatanSelect.value;
    
    if (!kecamatan) {
        select.innerHTML = '<option value="">Pilih Desa</option>';
        select.disabled = true;
        return;
    }
    
    select.disabled = true;
    select.innerHTML = '<option value="">Memuat desa...</option>';
    
    try {
        const result = await getDesa(kecamatan);
        if (result && result.success) {
            select.innerHTML = '<option value="">Pilih Desa</option>';
            result.data.forEach(desa => {
                select.innerHTML += `<option value="${desa}">${desa}</option>`;
            });
            select.disabled = false;
        } else {
            select.innerHTML = '<option value="">Tidak ada desa</option>';
            select.disabled = false;
        }
    } catch (error) {
        console.error('Error loading desa:', error);
        select.innerHTML = '<option value="">Error memuat desa</option>';
        select.disabled = false;
    }
}