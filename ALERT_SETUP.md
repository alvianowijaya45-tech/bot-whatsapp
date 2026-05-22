# SETUP ABSENCE ALERT SYSTEM

Fitur ini mengirimkan notifikasi otomatis ke grup khusus ketika anak PKL akan masuk kerja.

## Cara Setup:

### 1. Dapatkan Group ID
Group ID grup WhatsApp berbeda dengan share link. Anda perlu:
- Pergi ke grup PKL di WhatsApp
- Buka info grup
- Cari property/metadata grup

Format Group ID: `120363426104379560@g.us`

Jika belum tahu Group ID, bot akan bantu extract saat group di-join.

### 2. Set Alert Group (Owner Only)
```
.setupalertgroup <GROUP_ID>
```
Contoh:
```
.setupalertgroup 120363H7mKPII7BjyIeMK5ao3XYv@g.us
```

### 3. Aktifkan Alert System
```
.startalert on
```

Untuk nonaktifkan:
```
.startalert off
```

## Cara Kerja:

- **50 menit sebelum jam kerja**: Alert pertama dikirim ke grup
- **10 menit sebelum jam kerja**: Alert kedua dikirim ke grup
- Anak PKL di-tag dengan nomor WhatsApp mereka
- Ditampilkan: Shift, Jam, Lokasi, dan reminder untuk absen di DCT e-HR
- Alert hanya untuk yang shift kerja (tidak untuk libur/stanby)

## Contoh Alert Message:

```
🚨 ALERT ABSEN PKL 🚨
==================================================

👤 Nama: Alfiano
📱 Nomor: @082298624694

📅 Jadwal Hari Ini:
   Shift: Pagi Ampasit Lt.2
   Waktu: 07:00 - 16:00
   Lokasi: PT. Ampasit - Lt.2

⏰ MULAI KERJA 10 MENIT LAGI!

⚠️ Segera absen di aplikasi DCT e-HR
==================================================
```

## Status File:

- `.alert.active` - Marker bahwa alert system aktif
- `.env.alert` - Menyimpan Group ID configuration

## Troubleshooting:

Jika alert tidak muncul:
1. Pastikan `.alert.active` ada di folder root
2. Pastikan Group ID benar dengan format `120363...@g.us`
3. Pastikan jadwal di `database/listjadwal.js` sudah di-setup
4. Cek console bot untuk error messages
