// Peta role -> hak akses, sesuai Blueprint Modul 1 - Master User.
// Referensi/dokumentasi untuk UI; belum ditegakkan sebagai middleware otorisasi
// karena sistem login/autentikasi belum dibangun.
const ROLES = ['ADMIN', 'SPV_GUDANG', 'STAFF_GUDANG', 'PICKER', 'QC'];

const ROLE_PERMISSIONS = {
  ADMIN: ['Akses penuh ke seluruh modul'],
  SPV_GUDANG: ['Monitoring', 'Approval', 'Report'],
  STAFF_GUDANG: ['Receiving', 'Putaway'],
  PICKER: ['Picking'],
  QC: ['Cycle Count'],
};

module.exports = { ROLES, ROLE_PERMISSIONS };
