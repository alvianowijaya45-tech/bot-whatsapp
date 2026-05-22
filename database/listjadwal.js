module.exports = {
    shifts: {
        'PA2': { nama: 'Pagi Ampasit Lt.2', waktu: '07:00 - 16:00', lokasi: 'PT. Ampasit - Lt.2', perusahaan: 'Ampasit' },
        'PC4': { nama: 'Pagi Cideng Lt.4', waktu: '07:00 - 16:00', lokasi: 'PT. Cideng - Lt.4', perusahaan: 'Cideng' },
        'SA2': { nama: 'Siang Ampasit Lt.2', waktu: '13:00 - 22:00', lokasi: 'PT. Ampasit - Lt.2', perusahaan: 'Ampasit' },
        'SC4': { nama: 'Siang Cideng Lt.4', waktu: '13:00 - 22:00', lokasi: 'PT. Cideng - Lt.4', perusahaan: 'Cideng' },
        'A2': { nama: 'Normal Ampasit Lt.2', waktu: '09:00 - 18:00', lokasi: 'PT. Ampasit - Lt.2', perusahaan: 'Ampasit' },
        'C4': { nama: 'Normal Cideng Lt.4', waktu: '09:57 - 18:00', lokasi: 'PT. Cideng - Lt.4', perusahaan: 'Cideng' },
        'A2B': { nama: 'Ampasit Lt.2 Shift B', waktu: '09:00 - 18:00', lokasi: 'PT. Ampasit - Lt.2', perusahaan: 'Ampasit' },
        'M1': { nama: 'Malam (Shift 1)', waktu: '17:00 - 02:00', lokasi: 'Lokasi Shift Malam', perusahaan: 'Malam' },
        'M2': { nama: 'Malam (Shift 2)', waktu: '23:00 - 08:00', lokasi: 'Lokasi Shift Malam', perusahaan: 'Malam' },
        'L': { nama: 'Libur', waktu: '-', lokasi: '-', perusahaan: 'Libur' },
        'S': { nama: 'Stanby', waktu: '-', lokasi: '-', perusahaan: 'Stanby' },
        'P': { nama: 'Praktik', waktu: '09:00 - 16:00', lokasi: 'Lokasi Praktik', perusahaan: 'Praktik' },
        'LB': { nama: 'Libur/Off', waktu: '-', lokasi: '-', perusahaan: 'Off' }
    },
    jadwal: [
        {
            nama: 'Darren',
            sekolah: 'SMKN 2 PKL',
            schedule: [
                { tanggal: '2026-05-04', hari: 'Senin', shift: 'A2' },
                { tanggal: '2026-05-05', hari: 'Selasa', shift: 'A2' },
                { tanggal: '2026-05-06', hari: 'Rabu', shift: 'A2' },
                { tanggal: '2026-05-07', hari: 'Kamis', shift: 'A2' },
                { tanggal: '2026-05-08', hari: 'Jumat', shift: 'A2' },
                { tanggal: '2026-05-09', hari: 'Sabtu', shift: 'L' },
                { tanggal: '2026-05-10', hari: 'Minggu', shift: 'L' },
                { tanggal: '2026-05-11', hari: 'Senin', shift: 'A2B' },
                { tanggal: '2026-05-12', hari: 'Selasa', shift: 'PC4' },
                { tanggal: '2026-05-13', hari: 'Rabu', shift: 'PC4' },
                { tanggal: '2026-05-14', hari: 'Kamis', shift: 'LB' },
                { tanggal: '2026-05-15', hari: 'Jumat', shift: 'A2B' },
                { tanggal: '2026-05-16', hari: 'Sabtu', shift: 'L' },
                { tanggal: '2026-05-17', hari: 'Minggu', shift: 'S' }
            ]
        },
        {
            nama: 'Reynard',
            sekolah: 'SMKN 2 PKL',
            schedule: [
                { tanggal: '2026-05-04', hari: 'Senin', shift: 'A2' },
                { tanggal: '2026-05-05', hari: 'Selasa', shift: 'A2' },
                { tanggal: '2026-05-06', hari: 'Rabu', shift: 'A2' },
                { tanggal: '2026-05-07', hari: 'Kamis', shift: 'A2' },
                { tanggal: '2026-05-08', hari: 'Jumat', shift: 'A2' },
                { tanggal: '2026-05-09', hari: 'Sabtu', shift: 'L' },
                { tanggal: '2026-05-10', hari: 'Minggu', shift: 'L' },
                { tanggal: '2026-05-11', hari: 'Senin', shift: 'A2B' },
                { tanggal: '2026-05-12', hari: 'Selasa', shift: 'A2B' },
                { tanggal: '2026-05-13', hari: 'Rabu', shift: 'L' },
                { tanggal: '2026-05-14', hari: 'Kamis', shift: 'LB' },
                { tanggal: '2026-05-15', hari: 'Jumat', shift: 'A2B' },
                { tanggal: '2026-05-16', hari: 'Sabtu', shift: 'S' },
                { tanggal: '2026-05-17', hari: 'Minggu', shift: 'S' }
            ]
        },
        {
            nama: 'Ritzwan',
            sekolah: 'SMKN 2 PKL',
            schedule: [
                { tanggal: '2026-05-04', hari: 'Senin', shift: 'A2' },
                { tanggal: '2026-05-05', hari: 'Selasa', shift: 'A2' },
                { tanggal: '2026-05-06', hari: 'Rabu', shift: 'A2' },
                { tanggal: '2026-05-07', hari: 'Kamis', shift: 'A2' },
                { tanggal: '2026-05-08', hari: 'Jumat', shift: 'A2' },
                { tanggal: '2026-05-09', hari: 'Sabtu', shift: 'L' },
                { tanggal: '2026-05-10', hari: 'Minggu', shift: 'L' },
                { tanggal: '2026-05-11', hari: 'Senin', shift: 'L' },
                { tanggal: '2026-05-12', hari: 'Selasa', shift: 'A2B' },
                { tanggal: '2026-05-13', hari: 'Rabu', shift: 'PC4' },
                { tanggal: '2026-05-14', hari: 'Kamis', shift: 'S' },
                { tanggal: '2026-05-15', hari: 'Jumat', shift: 'L' },
                { tanggal: '2026-05-16', hari: 'Sabtu', shift: 'M1' },
                { tanggal: '2026-05-17', hari: 'Minggu', shift: 'M1' }
            ]
        },
        {
            nama: 'Andika',
            sekolah: 'SMKN 2 PKL',
            schedule: [
                { tanggal: '2026-05-04', hari: 'Senin', shift: 'A2' },
                { tanggal: '2026-05-05', hari: 'Selasa', shift: 'A2' },
                { tanggal: '2026-05-06', hari: 'Rabu', shift: 'A2' },
                { tanggal: '2026-05-07', hari: 'Kamis', shift: 'A2' },
                { tanggal: '2026-05-08', hari: 'Jumat', shift: 'A2' },
                { tanggal: '2026-05-09', hari: 'Sabtu', shift: 'L' },
                { tanggal: '2026-05-10', hari: 'Minggu', shift: 'L' },
                { tanggal: '2026-05-11', hari: 'Senin', shift: 'SC4' },
                { tanggal: '2026-05-12', hari: 'Selasa', shift: 'PC4' },
                { tanggal: '2026-05-13', hari: 'Rabu', shift: 'A2B' },
                { tanggal: '2026-05-14', hari: 'Kamis', shift: 'P' },
                { tanggal: '2026-05-15', hari: 'Jumat', shift: 'PC4' },
                { tanggal: '2026-05-16', hari: 'Sabtu', shift: 'L' },
                { tanggal: '2026-05-17', hari: 'Minggu', shift: 'S' }
            ]
        },
        {
            nama: 'Alfiano',
            sekolah: 'JP1 PKL',
            schedule: [
                { tanggal: '2026-05-04', hari: 'Senin', shift: 'A2' },
                { tanggal: '2026-05-05', hari: 'Selasa', shift: 'A2' },
                { tanggal: '2026-05-06', hari: 'Rabu', shift: 'A2' },
                { tanggal: '2026-05-07', hari: 'Kamis', shift: 'A2' },
                { tanggal: '2026-05-08', hari: 'Jumat', shift: 'A2' },
                { tanggal: '2026-05-09', hari: 'Sabtu', shift: 'L' },
                { tanggal: '2026-05-10', hari: 'Minggu', shift: 'L' },
                { tanggal: '2026-05-11', hari: 'Senin', shift: 'PC4' },
                { tanggal: '2026-05-12', hari: 'Selasa', shift: 'SC4' },
                { tanggal: '2026-05-13', hari: 'Rabu', shift: 'L' },
                { tanggal: '2026-05-14', hari: 'Kamis', shift: 'L' },
                { tanggal: '2026-05-15', hari: 'Jumat', shift: 'A2B' },
                { tanggal: '2026-05-16', hari: 'Sabtu', shift: 'P' },
                { tanggal: '2026-05-17', hari: 'Minggu', shift: 'P' }
            ]
        },
        {
            nama: 'Fabian',
            sekolah: 'JP1 PKL',
            schedule: [
                { tanggal: '2026-05-04', hari: 'Senin', shift: 'A2' },
                { tanggal: '2026-05-05', hari: 'Selasa', shift: 'A2' },
                { tanggal: '2026-05-06', hari: 'Rabu', shift: 'A2' },
                { tanggal: '2026-05-07', hari: 'Kamis', shift: 'A2' },
                { tanggal: '2026-05-08', hari: 'Jumat', shift: 'A2' },
                { tanggal: '2026-05-09', hari: 'Sabtu', shift: 'L' },
                { tanggal: '2026-05-10', hari: 'Minggu', shift: 'L' },
                { tanggal: '2026-05-11', hari: 'Senin', shift: 'SC4' },
                { tanggal: '2026-05-12', hari: 'Selasa', shift: 'L' },
                { tanggal: '2026-05-13', hari: 'Rabu', shift: 'A2B' },
                { tanggal: '2026-05-14', hari: 'Kamis', shift: 'LB' },
                { tanggal: '2026-05-15', hari: 'Jumat', shift: 'L' },
                { tanggal: '2026-05-16', hari: 'Sabtu', shift: 'M2' },
                { tanggal: '2026-05-17', hari: 'Minggu', shift: 'M2' }
            ]
        },
        {
            nama: 'Raditya',
            sekolah: 'JP1 PKL',
            schedule: [
                { tanggal: '2026-05-04', hari: 'Senin', shift: 'A2' },
                { tanggal: '2026-05-05', hari: 'Selasa', shift: 'A2' },
                { tanggal: '2026-05-06', hari: 'Rabu', shift: 'A2' },
                { tanggal: '2026-05-07', hari: 'Kamis', shift: 'A2' },
                { tanggal: '2026-05-08', hari: 'Jumat', shift: 'A2' },
                { tanggal: '2026-05-09', hari: 'Sabtu', shift: 'L' },
                { tanggal: '2026-05-10', hari: 'Minggu', shift: 'L' },
                { tanggal: '2026-05-11', hari: 'Senin', shift: 'A2B' },
                { tanggal: '2026-05-12', hari: 'Selasa', shift: 'A2B' },
                { tanggal: '2026-05-13', hari: 'Rabu', shift: 'SC4' },
                { tanggal: '2026-05-14', hari: 'Kamis', shift: 'LB' },
                { tanggal: '2026-05-15', hari: 'Jumat', shift: 'SC4' },
                { tanggal: '2026-05-16', hari: 'Sabtu', shift: 'L' },
                { tanggal: '2026-05-17', hari: 'Minggu', shift: 'L' }
            ]
        }
    ]
};
