const fs = require('fs');
const path = require('path');

const listjadwal = require('../database/listjadwal');
const listorangpkl = require('../database/listorangpkl');

// Store alert state (untuk tracking alert yang sudah dikirim)
let sentAlerts = {
    // Format: "NAMA_TANGGAL_TIPE" => true (untuk mencegah double alert)
};

const getAlertGroupId = () => {
    try {
        const configPath = path.join(__dirname, '../.env.alert');
        if (fs.existsSync(configPath)) {
            const content = fs.readFileSync(configPath, 'utf-8');
            const match = content.match(/ALERT_GROUP_ID=(.+)/);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
    } catch (error) {
        console.error('Error reading alert group ID:', error);
    }
    return null;
};

const extractTimeFromShift = (shiftCode, shifts) => {
    const shiftInfo = shifts[shiftCode];
    if (!shiftInfo) return null;
    const times = shiftInfo.waktu.split(' - ');
    return times[0]; // Return start time (e.g., "07:00")
};

const parseTime = (timeStr) => {
    if (!timeStr || timeStr === '-') return null;
    const [hours, mins] = timeStr.split(':').map(Number);
    return { hours, mins };
};

const formatTime = (hours, mins) => {
    const normalizedHours = ((hours % 24) + 24) % 24;
    const normalizedMins = ((mins % 60) + 60) % 60;
    return `${String(normalizedHours).padStart(2, '0')}:${String(normalizedMins).padStart(2, '0')}`;
};

const timeToMinutes = (hours, mins) => {
    return hours * 60 + mins;
};

const getTodayAlertSummary = () => {
    const jadwals = listjadwal.jadwal || [];
    const shifts = listjadwal.shifts || {};
    const peserta = listorangpkl.orang || [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const summary = [];

    // Check for test schedule
    const testSchedulePath = path.join(__dirname, '../.test.schedule.json');
    let testJadwals = [];
    if (fs.existsSync(testSchedulePath)) {
        try {
            testJadwals = JSON.parse(fs.readFileSync(testSchedulePath, 'utf-8'));
        } catch (e) {
            testJadwals = [];
        }
    }

    // Use test schedule if available, otherwise use real schedule
    const schedulesToCheck = testJadwals.length > 0 ? testJadwals : jadwals;

    schedulesToCheck.forEach((personData) => {
        let todaySchedule;
        let personName;
        
        if (testJadwals.length > 0) {
            // Test schedule format: { nama, tanggal, shift }
            if (personData.tanggal === todayStr) {
                todaySchedule = { shift: personData.shift };
                personName = personData.nama;
            }
        } else {
            // Real schedule format: { nama, schedule: [...] }
            todaySchedule = personData.schedule?.find(s => s.tanggal === todayStr);
            personName = personData.nama;
        }
        
        if (!todaySchedule || todaySchedule.shift === 'L' || todaySchedule.shift === 'S' || todaySchedule.shift === 'LB') return;

        const shiftInfo = shifts[todaySchedule.shift];
        if (!shiftInfo) return;

        const startTime = extractTimeFromShift(todaySchedule.shift, shifts);
        const parsedTime = parseTime(startTime);
        if (!parsedTime) return;

        const shiftMin = timeToMinutes(parsedTime.hours, parsedTime.mins);
        const alert50 = formatTime(Math.floor((shiftMin - 50) / 60), (shiftMin - 50) % 60);
        const alert10 = formatTime(Math.floor((shiftMin - 10) / 60), (shiftMin - 10) % 60);

        const phoneNumber = peserta.find(p => {
            const name = p.split(' - ')[0].trim().toLowerCase();
            return name === personName.toLowerCase();
        })?.split(' - ')[1]?.trim() || 'tidak ditemukan';

        summary.push({
            nama: personName,
            phoneNumber,
            shiftName: shiftInfo.nama,
            shiftTime: shiftInfo.waktu,
            lokasi: shiftInfo.lokasi,
            alert50,
            alert10
        });
    });

    return summary;
};

const getCurrentTimeInMinutes = (overrideTime) => {
    if (overrideTime) {
        const [hours, mins] = overrideTime.split(':').map(Number);
        if (Number.isInteger(hours) && Number.isInteger(mins) && hours >= 0 && hours < 24 && mins >= 0 && mins < 60) {
            return hours * 60 + mins;
        }
        return null;
    }
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
};

const loadDirectAlerts = () => {
    const directPath = path.join(__dirname, '../.alert.direct.json');
    if (!fs.existsSync(directPath)) return [];
    try {
        return JSON.parse(fs.readFileSync(directPath, 'utf-8')) || [];
    } catch (error) {
        console.warn('Error reading direct alert file:', error.message);
        return [];
    }
};

const loadTestSchedule = () => {
    const testSchedulePath = path.join(__dirname, '../.test.schedule.json');
    if (!fs.existsSync(testSchedulePath)) return [];
    try {
        return JSON.parse(fs.readFileSync(testSchedulePath, 'utf-8')) || [];
    } catch (error) {
        console.warn('Error reading test schedule file:', error.message);
        return [];
    }
};

const sendManualScheduleAlert = async (client, config, fquoted, overrideTime = null) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const testSchedule = loadTestSchedule().filter(s => s.tanggal === todayStr);
    if (!testSchedule.length) return { sent: 0 };

    const ALERT_GROUP_ID = getAlertGroupId();
    if (!ALERT_GROUP_ID) {
        console.warn('⚠️ Alert group ID not configured. Run .setupalertgroup first.');
        return { sent: 0 };
    }

    const shifts = listjadwal.shifts || {};
    const peserta = listorangpkl.orang || [];
    let msg = `🚨 *SIMULASI ALERT JADWAL* 🚨\n\n`;
    msg += `⏰ Waktu simulasi: *${overrideTime || `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`}*\n`;
    msg += `📅 Tanggal: *${todayStr}*\n\n`;
    msg += `👥 *Jadwal hari ini yang diset untuk simulasi:*\n\n`;

    const mentions = [];

    testSchedule.forEach((item, index) => {
        const shiftInfo = shifts[item.shift] || { nama: item.shift, waktu: '-', lokasi: '-' };
        const personPhone = peserta.find(p => p.split(' - ')[0].trim().toLowerCase() === item.nama.toLowerCase())?.split(' - ')[1]?.trim();
        msg += `${index + 1}. *${item.nama}*\n`;
        msg += `   📅 Tanggal: ${item.tanggal}\n`;
        msg += `   ⏰ Shift: ${shiftInfo.nama}\n`;
        msg += `   🕒 Waktu: ${shiftInfo.waktu}\n`;
        msg += `   📍 Lokasi: ${shiftInfo.lokasi}\n\n`;
        if (personPhone) mentions.push(`${personPhone}@s.whatsapp.net`);
    });

    msg += `⚠️ Ini adalah simulasi berdasarkan jadwal yang sudah kamu atur.\n`;
    msg += `   Pesan ini dikirim pada jam simulasi yang kamu pilih.`;

    try {
        await client.sendMessage(ALERT_GROUP_ID, { text: msg, mentions }, { quoted: fquoted.packSticker });
        console.log(`✓ Manual schedule alert sent for ${todayStr}`);
        return { sent: testSchedule.length };
    } catch (error) {
        console.error('Error sending manual schedule alert:', error);
        return { sent: 0, error: error.message };
    }
};

const checkAndSendAlerts = async (client, config, fquoted, overrideTime = null) => {
    try {
        const jadwals = listjadwal.jadwal || [];
        const shifts = listjadwal.shifts || {};
        const peserta = listorangpkl.orang || [];
        
        // Check for test schedule
        const testSchedulePath = path.join(__dirname, '../.test.schedule.json');
        let testJadwals = [];
        if (fs.existsSync(testSchedulePath)) {
            try {
                testJadwals = JSON.parse(fs.readFileSync(testSchedulePath, 'utf-8'));
                console.log('Using test schedule:', testJadwals.length, 'entries');
            } catch (e) {
                console.warn('Error loading test schedule:', e.message);
            }
        }
        
        // Use test schedule if available, otherwise use real schedule
        const schedulesToCheck = testJadwals.length > 0 ? testJadwals : jadwals;
        
        // Get today's date
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const currentTimeInMinutes = getCurrentTimeInMinutes(overrideTime);
        
        // Get alert group ID
        const ALERT_GROUP_ID = getAlertGroupId();
        if (!ALERT_GROUP_ID) {
            console.warn('⚠️ Alert group ID not configured. Run .setupalertgroup first.');
            return;
        }
        
        // Collect alerts for each type
        const alertsToSend = {
            '50menit': [],
            '10menit': []
        };
        
        // Iterate through each person's schedule
        schedulesToCheck.forEach((personData) => {
            let todaySchedule;
            
            if (testJadwals.length > 0) {
                // Test schedule format: { nama, tanggal, shift }
                if (personData.tanggal === todayStr) {
                    todaySchedule = { shift: personData.shift };
                }
            } else {
                // Real schedule format: { nama, schedule: [...] }
                todaySchedule = personData.schedule?.find(s => s.tanggal === todayStr);
            }
            
            if (!todaySchedule || todaySchedule.shift === 'L' || todaySchedule.shift === 'S' || todaySchedule.shift === 'LB') {
                return; // Skip if libur, stanby, or off
            }
            
            // Get shift start time
            const startTime = extractTimeFromShift(todaySchedule.shift, shifts);
            const parsedTime = parseTime(startTime);
            
            if (!parsedTime) return;
            
            const shiftStartInMinutes = timeToMinutes(parsedTime.hours, parsedTime.mins);
            const timeUntilShift = shiftStartInMinutes - currentTimeInMinutes;
            
            // Check for 50 minutes before and 10 minutes before alerts
            const alertTypes = [
                { minutesBefore: 50, type: '50menit' },
                { minutesBefore: 10, type: '10menit' }
            ];
            
            alertTypes.forEach(({ minutesBefore, type }) => {
                const alertKey = `${personData.nama}_${todayStr}_${type}`;
                
                // Check if alert should be sent (within 1 minute window)
                if (timeUntilShift > minutesBefore - 1 && timeUntilShift <= minutesBefore && !sentAlerts[alertKey]) {
                    // Find person's phone number
                    const personPhone = peserta.find(p => {
                        const name = p.split(' - ')[0].trim().toLowerCase();
                        return name === personData.nama.toLowerCase();
                    });
                    
                    if (personPhone) {
                        const phoneNumber = personPhone.split(' - ')[1]?.trim();
                        const shiftInfo = shifts[todaySchedule.shift];
                        
                        alertsToSend[type].push({
                            nama: personData.nama,
                            phoneNumber: phoneNumber,
                            shiftInfo: shiftInfo,
                            jadwal: personData
                        });
                        
                        sentAlerts[alertKey] = true;
                    }
                }
            });
        });
        
        // Send direct time alerts first
        let totalSent = 0;
        const directAlerts = loadDirectAlerts().filter(a => a.date === todayStr);
        for (const directAlert of directAlerts) {
            const parsedAlertTime = parseTime(directAlert.time);
            if (!parsedAlertTime) continue;
            const directMinutes = timeToMinutes(parsedAlertTime.hours, parsedAlertTime.mins);
            const alertKey = `DIRECT_${todayStr}_${directAlert.time}`;
            if (directMinutes === currentTimeInMinutes && !sentAlerts[alertKey]) {
                await sendDirectTimeAlert(client, config, fquoted, directAlert, ALERT_GROUP_ID);
                sentAlerts[alertKey] = true;
                totalSent += 1;
            }
        }

        // Send collected schedule-based alerts
        for (const type of Object.keys(alertsToSend)) {
            const alerts = alertsToSend[type];
            if (alerts.length > 0) {
                const minutesBefore = type === '50menit' ? 50 : 10;
                await sendGroupedAbsenceAlert(client, config, fquoted, alerts, minutesBefore, ALERT_GROUP_ID);
                totalSent += alerts.length;
            }
        }
        
        return {
            sent: totalSent,
            currentTime: overrideTime || `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
            summary: getTodayAlertSummary()
        };
    } catch (error) {
        console.error('Error in checkAndSendAlerts:', error);
        return { sent: 0, error: error.message };
    }
};

const sendDirectTimeAlert = async (client, config, fquoted, directAlert, groupId) => {
    try {
        const msg = `🚨 *ALERT TENGGANG WAKTU* 🚨\n\n` +
            `⏰ Jam: *${directAlert.time}*\n` +
            `📅 Tanggal: *${directAlert.date}*\n\n` +
            `⚠️ Waktu sudah tiba. Segera lakukan absen atau konfirmasi ke grup.`;

        await client.sendMessage(groupId, {
            text: msg
        }, { quoted: fquoted.packSticker });

        console.log(`✓ Direct alert sent for ${directAlert.time}`);
    } catch (error) {
        console.error('Error sending direct time alert:', error);
    }
};

const sendGroupedAbsenceAlert = async (client, config, fquoted, alerts, minutesBefore, groupId) => {
    try {
        // Format message
        let msg = `🚨 *ALERT ABSEN PKL* 🚨\n`;
        msg += `${'='.repeat(50)}\n\n`;
        msg += `⏰ *MULAI KERJA ${minutesBefore} MENIT LAGI!*\n\n`;
        msg += `👥 *Yang perlu absen hari ini:*\n\n`;
        
        const mentions = [];
        
        alerts.forEach((alert, index) => {
            const { nama, phoneNumber, shiftInfo } = alert;
            msg += `${index + 1}. *${nama}*\n`;
            msg += `   📱 @${phoneNumber}\n`;
            msg += `   📅 Shift: ${shiftInfo.nama}\n`;
            msg += `   ⏰ Waktu: ${shiftInfo.waktu}\n`;
            msg += `   📍 Lokasi: ${shiftInfo.lokasi}\n\n`;
            
            mentions.push(`${phoneNumber}@s.whatsapp.net`);
        });
        
        msg += `⚠️ Segera absen di aplikasi *DCT e-HR*\n`;
        msg += `${'='.repeat(50)}\n`;
        
        // Send to alert group with all tags
        await client.sendMessage(groupId, {
            text: msg,
            mentions: mentions
        }, { quoted: fquoted.packSticker });
        
        console.log(`✓ Grouped alert sent for ${alerts.length} people (${minutesBefore}min before)`);
        
    } catch (error) {
        console.error('Error sending grouped absence alert:', error);
    }
};

const resetAlertState = () => {
    // Reset setiap hari pada jam 00:00
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
        sentAlerts = {};
        console.log('Alert state reset untuk hari berikutnya');
        resetAlertState(); // Recursive untuk setiap hari
    }, timeUntilMidnight);
};

module.exports = {
    checkAndSendAlerts,
    sendManualScheduleAlert,
    resetAlertState,
    getAlertGroupId
};
