// ============================================
// SIPEDULI BADUNG - BACKEND API
// Versi Lengkap dengan Data Desa
// ============================================

const CONFIG = {
  SPREADSHEET_ID: '1AlbjWTpQGSvHSXncMPI8BB2ikkqY81n-3z_6FK9URZ4',
  FOLDER_ID: '1ImpPb76v7hgkcnxL-bc11z4ZLyvphyx0',
  ADMIN_EMAIL: 'sipedulibadung@gmail.com',
  SHEETS: {
    USERS: 'Users',
    DISABILITAS: 'Disabilitas',
    ASESMEN: 'Asesmen',
    BANTUAN: 'Bantuan',
    KECAMATAN: 'Kecamatan',
    DESA: 'Desa'
  }
};

// DATA LENGKAP KECAMATAN & DESA DI BADUNG
const DATA_WILAYAH = {
  'Kuta': ['Legian', 'Kuta', 'Tuban', 'Seminyak'],
  'Kuta Selatan': ['Jimbaran', 'Ungasan', 'Benoa', 'Pecatu', 'Kutuh'],
  'Kuta Utara': ['Kerobokan', 'Kerobokan Kelod', 'Kerobokan Kaja', 'Tibubeneng', 'Canggu'],
  'Mengwi': ['Mengwi', 'Kapal', 'Sading', 'Sibang Kaja', 'Sibang Gede', 'Lukluk', 'Mambal', 'Punggul', 'Baha', 'Blahkiuh'],
  'Abiansemal': ['Abiansemal', 'Mambal', 'Angantaka', 'Bongkasa', 'Bongkasa Pindah', 'Dauh Yeh Cani', 'Mekar Bhuana', 'Punggul', 'Sedang', 'Sobangan'],
  'Petang': ['Petang', 'Belok', 'Beng', 'Carang Sari', 'Getasan', 'Puangan', 'Sulangai', 'Tohpati']
};

function doGet(e) {
  try {
    Logger.log('=== GET REQUEST ===');
    const action = e.parameter.action;
    Logger.log('Action: ' + action);
    
    let result;
    
    switch(action) {
      case 'ping':
        result = { success: true, message: 'SIPEDULI BADUNG API running' };
        break;
      case 'login':
        result = handleLogin(e.parameter);
        break;
      case 'getDisabilitas':
        const disabilitasFilters = {};
        Object.keys(e.parameter).forEach(key => {
          if (key !== 'action') disabilitasFilters[key] = e.parameter[key];
        });
        result = getGenericData(CONFIG.SHEETS.DISABILITAS, disabilitasFilters);
        break;
      case 'getAsesmen':
        const asesmenFilters = {};
        Object.keys(e.parameter).forEach(key => {
          if (key !== 'action') asesmenFilters[key] = e.parameter[key];
        });
        result = getGenericData(CONFIG.SHEETS.ASESMEN, asesmenFilters);
        break;
      case 'getBantuan':
        const bantuanFilters = {};
        Object.keys(e.parameter).forEach(key => {
          if (key !== 'action') bantuanFilters[key] = e.parameter[key];
        });
        result = getGenericData(CONFIG.SHEETS.BANTUAN, bantuanFilters);
        break;
      case 'getKecamatan':
        result = getKecamatanList();
        break;
      case 'getDesa':
        const kecamatan = e.parameter.kecamatan || '';
        result = getDesaByKecamatan(kecamatan);
        break;
      case 'getAllDesa':
        result = getAllDesaData();
        break;
      case 'getStats':
        result = getStats();
        break;
      case 'getPrioritas':
        result = getPrioritas();
        break;
      case 'getAnalitik':
        result = getAnalitik();
        break;
      default:
        result = { success: false, message: 'Action tidak ditemukan: ' + action };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    Logger.log('ERROR in doGet: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    Logger.log('=== POST REQUEST ===');
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    Logger.log('Action: ' + action);
    
    let result;
    
    switch(action) {
      case 'saveDisabilitas':
        result = saveDisabilitasDenganNotif(data);
        break;
      case 'updateDisabilitas':
        result = updateData(data, CONFIG.SHEETS.DISABILITAS);
        break;
      case 'deleteDisabilitas':
        result = deleteData(data.id, CONFIG.SHEETS.DISABILITAS);
        break;
      case 'saveAsesmen':
        result = saveAsesmenDenganSkor(data);
        break;
      case 'saveBantuan':
        result = saveBantuanDenganEmail(data);
        break;
      case 'updateStatusBantuan':
        result = updateData(data, CONFIG.SHEETS.BANTUAN);
        break;
      default:
        result = { success: false, message: 'Action tidak ditemukan: ' + action };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    Logger.log('ERROR in doPost: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// FUNGSI BARU: GET KECAMATAN LIST
// ============================================
function getKecamatanList() {
  return {
    success: true,
    data: Object.keys(DATA_WILAYAH).sort()
  };
}

// ============================================
// FUNGSI BARU: GET DESA BY KECAMATAN
// ============================================
function getDesaByKecamatan(kecamatan) {
  const desaList = DATA_WILAYAH[kecamatan] || [];
  return {
    success: true,
    data: desaList.sort()
  };
}

// ============================================
// FUNGSI BARU: GET ALL DESA DATA
// ============================================
function getAllDesaData() {
  const allData = [];
  Object.keys(DATA_WILAYAH).forEach(kecamatan => {
    DATA_WILAYAH[kecamatan].forEach(desa => {
      allData.push({ kecamatan: kecamatan, desa: desa });
    });
  });
  return {
    success: true,
    data: allData
  };
}

// ============================================
// FUNGSI LAINNYA (sama seperti sebelumnya)
// ============================================

function handleLogin(params) {
  const { username, password, role } = params;
  if (!username || !password) {
    return { success: false, message: 'Username dan password wajib diisi' };
  }
  
  const sheet = getSheet(CONFIG.SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const user = {};
    headers.forEach((h, idx) => user[h] = data[i][idx]);
    
    if (user.username === username && user.password === password && user.status === 'aktif') {
      if (role && user.role !== role) {
        return { success: false, message: 'Role tidak sesuai' };
      }
      return { 
        success: true, 
        data: { id: user.id, username: user.username, nama_lengkap: user.nama_lengkap, role: user.role } 
      };
    }
  }
  return { success: false, message: 'Username/password salah' };
}

function getGenericData(sheetName, filters = {}) {
  const sheet = getSheet(sheetName);
  if (!sheet) return { success: false, message: 'Sheet not found' };
  
  const data = sheet.getDataRange().getValues();
  if (data.length === 0) return { success: true, data: [] };
  
  const headers = data[0];
  if (data.length < 2) return { success: true, data: [] };
  
  let result = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((h, idx) => row[h] = data[i][idx]);
    result.push(row);
  }
  
  if (filters && typeof filters === 'object') {
    const activeFilters = {};
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '' && value !== 'undefined') {
        activeFilters[key] = value;
      }
    });
    
    if (Object.keys(activeFilters).length > 0) {
      result = result.filter(r => {
        return Object.keys(activeFilters).every(key => {
          const filterValue = String(activeFilters[key]).toLowerCase();
          const rowValue = String(r[key] || '').toLowerCase();
          return rowValue.includes(filterValue);
        });
      });
    }
  }
  
  return { success: true, data: result };
}

function saveGenericData(data, sheetName) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const newRow = headers.map(h => {
    if (h === 'id') return 'ID' + new Date().getTime() + Math.floor(Math.random() * 1000);
    if (h === 'created_at' || h === 'updated_at') return new Date().toISOString();
    return data[h] !== undefined ? data[h] : '';
  });
  
  sheet.appendRow(newRow);
  return { success: true, message: 'Data berhasil disimpan', id: newRow[0] };
}

function saveDisabilitasDenganNotif(data) {
  const sheet = getSheet(CONFIG.SHEETS.DISABILITAS);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const id = 'DIS' + new Date().getTime();
  const now = new Date().toISOString();
  
  let umur = '';
  if (data.tgl_lahir) {
    const birthDate = new Date(data.tgl_lahir);
    const today = new Date();
    umur = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
  }
  
  const newRow = headers.map(h => {
    if (h === 'id') return id;
    if (h === 'created_at') return now;
    if (h === 'umur') return umur || data.umur || '';
    return data[h] !== undefined ? data[h] : '';
  });
  
  sheet.appendRow(newRow);
  
  try {
    const nama = data.nama || 'Tidak diketahui';
    const subject = '📋 Data Disabilitas Baru: ' + nama;
    const htmlBody = '<h2>Data Disabilitas Baru</h2><p>Nama: ' + nama + '</p><p>NIK: ' + (data.nik || '-') + '</p>';
    MailApp.sendEmail({ to: CONFIG.ADMIN_EMAIL, subject: subject, htmlBody: htmlBody });
  } catch (e) {
    Logger.log('Email failed: ' + e.toString());
  }
  
  return { success: true, message: 'Data disabilitas berhasil disimpan', id: id };
}

function saveAsesmenDenganSkor(data) {
  const sheet = getSheet(CONFIG.SHEETS.ASESMEN);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const id = 'ASES' + new Date().getTime();
  const now = new Date().toISOString();
  
  let skor = 0;
  if (String(data.dtks || '').toLowerCase() === 'ya') skor += 30;
  
  const desil = parseInt(data.desil) || 10;
  if (desil <= 3) skor += 40;
  else if (desil <= 5) skor += 30;
  else if (desil <= 7) skor += 20;
  else skor += 10;
  
  const jenisDisabilitas = (data.jenis_disabilitas_uu || '').toLowerCase();
  if (jenisDisabilitas.includes('berat') || jenisDisabilitas.includes('ganda')) skor += 30;
  else if (jenisDisabilitas.includes('sedang')) skor += 20;
  else skor += 10;
  
  let kategoriPrioritas = 'PRIORITAS III';
  if (skor >= 80) kategoriPrioritas = 'PRIORITAS I';
  else if (skor >= 60) kategoriPrioritas = 'PRIORITAS II';
  
  const newRow = headers.map(h => {
    if (h === 'id') return id;
    if (h === 'created_at') return now;
    if (h === 'skor') return skor;
    if (h === 'kategori_prioritas') return kategoriPrioritas;
    return data[h] !== undefined ? data[h] : '';
  });
  
  sheet.appendRow(newRow);
  
  return { success: true, message: 'Asesmen berhasil disimpan', id: id, skor: skor, kategori: kategoriPrioritas };
}

function saveBantuanDenganEmail(data) {
  const sheet = getSheet(CONFIG.SHEETS.BANTUAN);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const id = 'BANTU' + new Date().getTime();
  const now = new Date().toISOString();
  
  const newRow = headers.map(h => {
    if (h === 'id') return id;
    if (h === 'created_at') return now;
    if (h === 'status') return 'Menunggu';
    return data[h] !== undefined ? data[h] : '';
  });
  
  sheet.appendRow(newRow);
  
  try {
    const nama = data.nama || 'Tidak diketahui';
    const subject = '🎁 Permohonan Bantuan: ' + nama;
    const htmlBody = '<h2>Permohonan Bantuan Baru</h2><p>Nama: ' + nama + '</p>';
    MailApp.sendEmail({ to: CONFIG.ADMIN_EMAIL, subject: subject, htmlBody: htmlBody });
  } catch (e) {
    Logger.log('Email failed: ' + e.toString());
  }
  
  return { success: true, message: 'Bantuan berhasil disimpan', id: id };
}

function updateData(data, sheetName) {
  const sheet = getSheet(sheetName);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][0]) === String(data.id)) {
      const newRow = headers.map(h => {
        if (h === 'updated_at') return new Date().toISOString();
        if (h === 'id') return data.id;
        return data[h] !== undefined ? data[h] : allData[i][headers.indexOf(h)];
      });
      
      sheet.getRange(i + 1, 1, 1, newRow.length).setValues([newRow]);
      return { success: true, message: 'Data berhasil diupdate' };
    }
  }
  
  return { success: false, message: 'Data tidak ditemukan' };
}

function deleteData(id, sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Data berhasil dihapus' };
    }
  }
  
  return { success: false, message: 'Data tidak ditemukan' };
}

function getStats() {
  try {
    const sheetDisabilitas = getSheet(CONFIG.SHEETS.DISABILITAS);
    const sheetBantuan = getSheet(CONFIG.SHEETS.BANTUAN);
    
    const totalDisabilitas = Math.max(0, sheetDisabilitas.getLastRow() - 1);
    
    let sudahBantuan = 0;
    let menungguBantuan = 0;
    let dalamPendampingan = 0;
    
    if (sheetBantuan.getLastRow() > 1) {
      const bantuanData = sheetBantuan.getDataRange().getValues();
      const headers = bantuanData[0];
      const statusIndex = headers.indexOf('status');
      
      for (let i = 1; i < bantuanData.length; i++) {
        const status = String(bantuanData[i][statusIndex] || '').toLowerCase();
        if (status.includes('selesai') || status.includes('diberikan')) sudahBantuan++;
        else if (status.includes('menunggu')) menungguBantuan++;
        else if (status.includes('proses') || status.includes('pendampingan')) dalamPendampingan++;
      }
    }
    
    return {
      success: true,
      data: {
        totalDisabilitas: totalDisabilitas,
        sudahBantuan: sudahBantuan,
        menungguBantuan: menungguBantuan,
        dalamPendampingan: dalamPendampingan
      }
    };
    
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function getPrioritas() {
  try {
    const asesmenData = getGenericData(CONFIG.SHEETS.ASESMEN);
    if (!asesmenData.success) return asesmenData;
    
    const sorted = asesmenData.data.sort((a, b) => {
      return (parseInt(b.skor) || 0) - (parseInt(a.skor) || 0);
    });
    
    return { success: true, data: sorted.slice(0, 50) };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function getAnalitik() {
  try {
    const disabilitasData = getGenericData(CONFIG.SHEETS.DISABILITAS);
    if (!disabilitasData.success) return disabilitasData;
    
    const data = disabilitasData.data;
    
    const perKecamatan = {};
    data.forEach(r => {
      const kec = r.kecamatan || 'Lainnya';
      if (!perKecamatan[kec]) {
        perKecamatan[kec] = { total: 0, dtks: 0, nonDtks: 0, desilRendah: 0 };
      }
      perKecamatan[kec].total++;
      if (String(r.dtks || '').toLowerCase() === 'ya') perKecamatan[kec].dtks++;
      else perKecamatan[kec].nonDtks++;
      if (parseInt(r.desil) <= 3) perKecamatan[kec].desilRendah++;
    });
    
    const perJenis = {};
    data.forEach(r => {
      const jenis = r.jenis_disabilitas_uu || 'Lainnya';
      perJenis[jenis] = (perJenis[jenis] || 0) + 1;
    });
    
    const dtksYa = data.filter(r => String(r.dtks || '').toLowerCase() === 'ya').length;
    const dtksTidak = data.length - dtksYa;
    
    const desilDistribution = {};
    for (let i = 1; i <= 10; i++) {
      desilDistribution[i] = data.filter(r => parseInt(r.desil) === i).length;
    }
    
    return {
      success: true,
      data: {
        perKecamatan: perKecamatan,
        perJenis: perJenis,
        dtks: { ya: dtksYa, tidak: dtksTidak },
        desil: desilDistribution,
        totalData: data.length
      }
    };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function getSheet(name) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function setupDatabase() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  
  // Users
  let sheet = ss.getSheetByName('Users') || ss.insertSheet('Users');
  sheet.clear();
  sheet.getRange(1, 1, 1, 7).setValues([['id', 'username', 'password', 'nama_lengkap', 'role', 'status', 'created_at']]);
  sheet.appendRow([1, 'admin', 'admin123', 'Administrator', 'admin', 'aktif', new Date().toISOString()]);
  
  // Disabilitas
  sheet = ss.getSheetByName('Disabilitas') || ss.insertSheet('Disabilitas');
  sheet.clear();
  sheet.getRange(1, 1, 1, 21).setValues([['id', 'nama', 'nik', 'kk', 'tempat_lahir', 'tgl_lahir', 'umur', 'jenis_kelamin', 'kecamatan', 'desa', 'alamat', 'no_hp', 'pendidikan', 'pekerjaan', 'jenis_disabilitas_uu', 'jenis_disabilitas_suket', 'nama_ibu', 'dtks', 'desil', 'keterangan', 'created_at']]);
  
  // Asesmen
  sheet = ss.getSheetByName('Asesmen') || ss.insertSheet('Asesmen');
  sheet.clear();
  sheet.getRange(1, 1, 1, 10).setValues([['id', 'disabilitas_id', 'nama', 'nik', 'skor', 'kategori_prioritas', 'tanggal_asesmen', 'asesor', 'rekomendasi', 'created_at']]);
  
  // Bantuan
  sheet = ss.getSheetByName('Bantuan') || ss.insertSheet('Bantuan');
  sheet.clear();
  sheet.getRange(1, 1, 1, 11).setValues([['id', 'disabilitas_id', 'nama', 'nik', 'jenis_bantuan', 'tanggal', 'nilai', 'kecamatan', 'status', 'petugas', 'created_at']]);
  
  // Kecamatan & Desa (tidak perlu sheet terpisah, sudah di CODE)
  
  return 'Setup database berhasil!';
}

function testApi() {
  const stats = getStats();
  Logger.log('Stats: ' + JSON.stringify(stats));
  return { stats: stats };
}