const config = require('./settings/config');
require('./setting.js');
const fs = require('fs');
const listowner = require('./database/listowner');
const listjadwal = require('./database/listjadwal');
const listorangpkl = require('./database/listorangpkl');
const { checkAndSendAlerts } = require('./lib/absenceAlert');
const axios = require('axios');
const chalk = require("chalk");
const jimp = require("jimp")
const util = require("util");
const crypto  = require("crypto")
const fetch = require("node-fetch")
const moment = require("moment-timezone");
const path = require("path")
const os = require('os');
const speed = require('performance-now')
const { spawn, exec, execSync } = require('child_process');
const { default: baileys, getContentType } = require("@shennmine/baileys");
module.exports = client = async (client, m, chatUpdate, store) => {
    try {
        const body = (
            m.message?.conversation ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption ||
            m.message?.extendedTextMessage?.text ||
            m.message?.buttonsResponseMessage?.selectedButtonId ||
            m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
            m.message?.templateButtonReplyMessage?.selectedId ||
            (m.mtype === "interactiveResponseMessage" ? JSON.parse(m.msg?.nativeFlowResponseMessage?.paramsJson || '{}').id : null) ||
            m.msg?.selectedId ||
            m.message?.buttonsResponseMessage?.selectedButtonId ||
            m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
            m.text ||
            ""
        );
        
        const sender = m.key.fromMe ? client.user.id.split(":")[0] + "@s.whatsapp.net" ||
              client.user.id : m.key.participant || m.key.remoteJid;
        
        const senderNumber = sender.split('@')[0];
        const budy = (typeof m.text === 'string' ? m.text : '');
        const prefa = ["", "!", ".", ",", "🐤", "🗿"];

        const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤ΠΦ_&><`™©®Δ^βα~¦|/\\©^]/;
        const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : '.';
        const from = m.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        const botNumber = await client.decodeJid(client.user.id);
        const isBot = botNumber.includes(senderNumber)
        
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const command2 = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
        const args = body.trim().split(/ +/).slice(1);
        const pushname = m.pushName || "No Name";
        const text = q = args.join(" ");
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';
        const qmsg = (quoted.msg || quoted);
        const isMedia = /image|video|sticker|audio/.test(mime);
        
        const { smsg, fetchJson, sleep, formatSize, runtime } = require('./w-shennmine/lib/myfunction');     
        const cihuy = fs.readFileSync('./w-shennmine/lib/media/w-shennmine.jpg')
        const { fquoted } = require('./w-shennmine/lib/fquoted')

        // group
        const groupMetadata = m?.isGroup ? await client.groupMetadata(m.chat).catch(() => ({})) : {};
        const groupName = m?.isGroup ? groupMetadata.subject || '' : '';
        const participants = m?.isGroup ? groupMetadata.participants?.map(p => {
            let admin = null;
            if (p.admin === 'superadmin') admin = 'superadmin';
            else if (p.admin === 'admin') admin = 'admin';
            return {
                id: p.id || null,
                jid: p.jid || null,
                admin,
                full: p
            };
        }) || []: [];
        const groupOwner = m?.isGroup ? participants.find(p => p.admin === 'superadmin')?.jid || '' : '';
        const groupAdmins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.jid || p.id);
        const isBotAdmins = m?.isGroup ? groupAdmins.includes(botNumber) : false;
        const isAdmins = m?.isGroup ? groupAdmins.includes(m.sender) : false;
        const isGroupOwner = m?.isGroup ? groupOwner === m.sender : false;
        
        if (m.message) {
            console.log('\x1b[30m--------------------\x1b[0m');
            console.log(chalk.bgHex("#4a69bd").bold(`▢ New Message`));
            console.log(
                chalk.bgHex("#ffffff").black(
                    `   ▢ Tanggal: ${new Date().toLocaleString()} \n` +
                    `   ▢ Pesan: ${m.body || m.mtype} \n` +
                    `   ▢ Pengirim: ${pushname} \n` +
                    `   ▢ JID: ${senderNumber} \n`
                )
            );
            console.log();
        }
        
        const reaction = async (jidss, emoji) => {
            client.sendMessage(jidss, {
                react: {
                    text: emoji,
                    key: m.key 
                } 
            })
        };
        
        async function reply(text) {
            client.sendMessage(m.chat, {
                text: "\n" + text + "\n",
                contextInfo: {
                    mentionedJid: [sender],
                    externalAdReply: {
                        title: config.settings.title,
                        body: config.settings.description,
                        thumbnailUrl: config.thumbUrl,
                        sourceUrl: config.socialMedia.Telegram,
                        renderLargerThumbnail: false,
                    }
                }
            }, { quoted: m })
        }
        
        const pluginsLoader = async (directory) => {
            let plugins = [];
            const folders = fs.readdirSync(directory);
            folders.forEach(file => {
                const filePath = path.join(directory, file);
                if (filePath.endsWith(".js")) {
                    try {
                        const resolvedPath = require.resolve(filePath);
                        if (require.cache[resolvedPath]) {
                            delete require.cache[resolvedPath];
                        }
                        const plugin = require(filePath);
                        plugins.push(plugin);
                    } catch (error) {
                        console.log(`${filePath}:`, error);
                    }
                }
            });
            return plugins;
        };

        const pluginsDisable = true;
        const plugins = await pluginsLoader(path.resolve(__dirname, "./command"));
        const plug = {
            client,
            prefix,
            command, 
            reply, 
            text, 
            isBot,
            reaction,
            pushname, 
            mime,
            quoted,
            sleep,
            fquoted,
            fetchJson 
        };

        const listCaseCommands = () => {
            const source = fs.readFileSync(__filename, 'utf-8');
            const matches = [...source.matchAll(/case\s+["']([^"']+)["']\s*:/g)];
            const cases = [...new Set(matches.map(match => match[1]))];
            return cases.filter(c => c !== 'listcase');
        };

        for (let plugin of plugins) {
            if (plugin.command.find(e => e == command.toLowerCase())) {
                if (plugin.isBot && !isBot) {
                    return
                }
                
                if (plugin.private && !plug.isPrivate) {
                    return m.reply(config.message.private);
                }

                if (typeof plugin !== "function") return;
                await plugin(m, plug);
            }
        }
        
        if (!pluginsDisable) return;  

        switch (command) {
            case "menu":{
                const totalMem = os.totalmem();
                const freeMem = os.freemem();
                const usedMem = totalMem - freeMem;
                const formattedUsedMem = formatSize(usedMem);
                const formattedTotalMem = formatSize(totalMem);
                let timestamp = speed()
                let latensi = speed() - timestamp
                let menu = `
 ▢ speed: ${latensi.toFixed(4)} s
 ▢ runtime: ${runtime(process.uptime())}
 ▢ RAM: ${formattedUsedMem} / ${formattedTotalMem}

command:
 ▢ ${prefix}tagall
 ▢ ${prefix}get
 ▢ ${prefix}insp
 ▢ ${prefix}addcase
 ▢ ${prefix}addowner
 ▢ ${prefix}delcase
 ▢ ${prefix}listcase
 ▢ ${prefix}listjadwal
 ▢ ${prefix}getcase
 ▢ ${prefix}listowner
 ▢ ${prefix}setupalertgroup
 ▢ ${prefix}startalert
 ▢ ${prefix}alertsim
 ▢ ${prefix}tessim
 ▢ ${prefix}setalert
 ▢ ${prefix}listalert
 ▢ ${prefix}clearalert
 ▢ ${prefix}testgroup
 ▢ ${prefix}setjadwal
 ▢ ${prefix}clearjadwal
 ▢ ${prefix}csesi
 ▢ ${prefix}exec
 ▢ ${prefix}eval
 ▢ ${prefix}mesinfo`
                    await client.sendMessage(m.chat, {
                        interactiveMessage: {
                            title: menu,
                            footer: config.settings.footer,
                            thumbnail: "https://github.com/kiuur.png",
                            nativeFlowMessage: {
                                messageParamsJson: JSON.stringify({
                                    limited_time_offer: {
                                        text: "shenń, yes 1437",
                                        url: "t.me/kiuurmine",
                                        copy_code: "shenń, yes 1437",
                                        expiration_time: Date.now() * 999
                                    },
                                    bottom_sheet: {
                                        in_thread_buttons_limit: 2,
                                        divider_indices: [1, 2, 3, 4, 5, 999],
                                        list_title: "shennminè",
                                        button_title: "shenń"
                                    },
                                    tap_target_configuration: {
                                        title: "▸ X ◂",
                                        description: "bomboclard",
                                        canonical_url: "https://t.me/sh3nnmine",
                                        domain: "shop.example.com",
                                        button_index: 0
                                    }
                                }),
                                buttons: [
                                    {
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify({ has_multiple_buttons: true })
                                    },
                                    {
                                        name: "call_permission_request",
                                        buttonParamsJson: JSON.stringify({ has_multiple_buttons: true })
                                    },
                                    {
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify({
                                            title: "Menu nya bang 😎",
                                            sections: [
                                                {
                                                    title: "# X - the best",
                                                    highlight_label: "label",
                                                    rows: [
                                                        {
                                                            title: "@dittsans", 
                                                            description: "b!cth",
                                                            id: "row_1"
                                                        },
                                                        { 
                                                            title: "@kyuucode",
                                                            description: "sh3nnmine",
                                                            id: "row_2"
                                                        },
                                                        { 
                                                            title: "@devorsixcore",
                                                            description: "rock and roll",
                                                            id: "row_3" 
                                                        }
                                                    ]
                                                }
                                            ],
                                            has_multiple_buttons: true
                                        })
                                    },
                                    {
                                        name: "cta_copy",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "Credit",
                                            id: "123456789",
                                            copy_code: "Thanks to CC : alfiano, reynard, darren, ritzwan, andika, fabian, raditya and senior zidan and ronald thanks  by: alfino - 082298624694, 085787443516"
                                        })
                                    }
                                ]
                            }
                        }
                    }, { quoted: fquoted.packSticker });
            }
            break
            case "mesinfo": {
                if (!m.quoted) return reply("harap reply ke sebuah pesan untuk mengecek mtype dan id-nya.");
             
                const type = m.quoted.mtype;
                const id = m.quoted.id;
                reply(`Pesan yang di-reply memiliki:\n- Tipe pesan: *${type}*\n- ID pesan: *${id}*`);
            }
            break;
            case "addowner": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                const ownerNumber = text || m.quoted?.text?.trim();
                if (!ownerNumber) return reply(`*usage:* ${prefix}addowner <nomor>\n*contoh:* ${prefix}addowner 6285787443516`);
                
                const formattedNumber = ownerNumber.includes('@') ? ownerNumber : ownerNumber + '@s.whatsapp.net';
                if (listowner.owners.includes(formattedNumber)) return reply(`Owner ${formattedNumber} sudah ada di list.`);
                
                listowner.owners.push(formattedNumber);
                fs.writeFileSync(path.join(__dirname, 'database', 'listowner.js'), 
                    `module.exports = ${JSON.stringify(listowner, null, 4)}`
                );
                reply(`Berhasil menambahkan owner: *${formattedNumber}*`);
            }
            break;
            case "addcase": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                const code = text || m.quoted?.text?.trim();
                if (!code) return reply(`*usage:* ${prefix}addcase <code>\n\nContoh:\n${prefix}addcase case 'test': {\n    if (!isBot) return;\n    reply('Hello World');\n}\nbreak`);

                const caseMatch = code.match(/case\s+["']([^"']+)["']\s*:/);
                if (!caseMatch) return reply('Format kode tidak valid. Harus dimulai dengan case "nama": atau case \'nama\':');

                const caseId = caseMatch[1];
                if (!/^[a-zA-Z0-9_\-]+$/.test(caseId)) return reply(`Nama case hanya boleh berisi huruf, angka, _ dan -`);

                const sourceFile = fs.readFileSync(__filename, 'utf-8');
                const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const caseExists = new RegExp(`case\\s+["']${escapeRegex(caseId)}["']\\s*:\\s*`, 'g');
                if (caseExists.test(sourceFile)) return reply(`Case *${caseId}* sudah ada di message.js.`);

                if (!code.trim().endsWith('break') && !code.trim().endsWith('break;')) return reply('Kode harus diakhiri dengan break atau break;');

                const insertionPoint = sourceFile.lastIndexOf('default:');
                if (insertionPoint === -1) return reply('Tidak dapat menemukan posisi penyisipan case baru.');

                const formattedCode = code.replace(/\n/g, '\n            ') + '\n\n';
                const newSource = sourceFile.slice(0, insertionPoint) + formattedCode + sourceFile.slice(insertionPoint);
                fs.writeFileSync(__filename, newSource, 'utf-8');
                reply(`Berhasil menambahkan case: *${caseId}* ke message.js`);
            }
            break;
            case "listowner": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                if (listowner.owners.length === 0) return reply('Tidak ada owner terdaftar.');
                reply(`Daftar Owner:\n${listowner.owners.map((o, i) => `${i + 1}. ${o}`).join('\n')}`);
            }
            break;
            case "delcase": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                const caseId = text || m.quoted?.text?.trim();
                if (!caseId) return reply(`*usage:* ${prefix}delcase <caseId>`);

                const sourceFile = fs.readFileSync(__filename, 'utf-8');
                const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`case\\s+["']${escapeRegex(caseId)}["']\\s*:\\s*\\{`, 'g');
                const match = regex.exec(sourceFile);
                if (!match) return reply(`Case dengan id *${caseId}* tidak ditemukan di message.js.`);

                let start = match.index;
                let braceIndex = sourceFile.indexOf('{', match.index);
                let depth = 1;
                let end = braceIndex + 1;

                while (end < sourceFile.length && depth > 0) {
                    if (sourceFile[end] === '{') depth++;
                    else if (sourceFile[end] === '}') depth--;
                    end++;
                }

                if (depth !== 0) return reply(`Gagal menghapus case *${caseId}*. Struktur kode tidak valid.`);

                const remaining = sourceFile.slice(end);
                const breakMatch = remaining.match(/^\s*break\s*;\s*/);
                if (breakMatch) {
                    end += breakMatch[0].length;
                }

                const newSource = sourceFile.slice(0, start) + sourceFile.slice(end);
                fs.writeFileSync(__filename, newSource, 'utf-8');

                reply(`Berhasil menghapus case: *${caseId}* dari message.js`);
            }
            break;
            case "listcase": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                const cases = listCaseCommands();
                if (!cases.length) return reply('Tidak ada case yang ditemukan di message.js.');
                reply(`Daftar case di message.js:\n${cases.map((c, i) => `${i + 1}. ${c}`).join('\n')}`);
            }
            break;
            case "listjadwal": {
                const jadwals = listjadwal.jadwal || [];
                const shifts = listjadwal.shifts || {};
                const peserta = listorangpkl.orang || [];
                
                if (!peserta.length) return reply('Belum ada data orang PKL. Silakan tambahkan dulu.');

                // Get today's date
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][today.getDay()];
                
                // Get current time
                const jam = String(today.getHours()).padStart(2, '0') + ':' + String(today.getMinutes()).padStart(2, '0');

                if (!text) {
                    // Build rows with today's shift info
                    const rows = peserta.map((item, index) => {
                        const label = item.split(' - ')[0].trim() || item;
                        
                        // Find today's schedule for this person
                        const personData = jadwals.find(p => p.nama?.toLowerCase() === label.toLowerCase());
                        let todayShift = '-';
                        let shiftInfo = null;
                        
                        if (personData && personData.schedule) {
                            const todaySchedule = personData.schedule.find(s => s.tanggal === todayStr);
                            if (todaySchedule) {
                                todayShift = todaySchedule.shift;
                                shiftInfo = shifts[todayShift];
                            }
                        }
                        
                        const description = shiftInfo 
                            ? `${shiftInfo.nama} | ${shiftInfo.waktu} | ${shiftInfo.lokasi}`
                            : `Tidak ada jadwal hari ini`;
                        
                        return {
                            title: `${index + 1}. ${label}`,
                            description: description,
                            id: `${prefix}listjadwal ${item}`
                        };
                    });

                    // Get all people working today
                    let workingToday = [];
                    jadwals.forEach(person => {
                        const todaySchedule = person.schedule?.find(s => s.tanggal === todayStr);
                        if (todaySchedule && todaySchedule.shift !== 'L' && todaySchedule.shift !== 'S') {
                            const shiftInfo = shifts[todaySchedule.shift];
                            const isNightShift = todaySchedule.shift === 'M1' || todaySchedule.shift === 'M2' ? '🌙' : '✓';
                            workingToday.push({
                                nama: person.nama,
                                shift: todaySchedule.shift,
                                shiftNama: shiftInfo?.nama || todaySchedule.shift,
                                waktu: shiftInfo?.waktu || '-',
                                lokasi: shiftInfo?.lokasi || '-',
                                isNight: isNightShift
                            });
                        }
                    });

                    let headerText = `📅 *JADWAL HARI INI* (${todayStr} - ${hari})\n⏰ Jam: ${jam}\n\n`;
                    
                    if (workingToday.length > 0) {
                        headerText += `👷 *Yang Sedang PKL Hari Ini:*\n`;
                        workingToday.forEach(w => {
                            headerText += `• ${w.nama} - ${w.shiftNama} ${w.isNight} (${w.waktu})\n`;
                        });
                        headerText += `📍 Lokasi: ${workingToday[0].lokasi}\n\n`;
                    } else {
                        headerText += `Tidak ada yang PKL hari ini\n\n`;
                    }
                    
                    headerText += `Pilih nama untuk detail jadwal mingguan:`;

                    return client.sendMessage(m.chat, {
                        interactiveMessage: {
                            title: headerText,
                            footer: config.settings.footer,
                            nativeFlowMessage: {
                                messageParamsJson: JSON.stringify({
                                    limited_time_offer: {
                                        text: 'Pilih nama untuk melihat jadwal PKL',
                                        url: 'https://t.me/sh3nnmine',
                                        copy_code: 'Pilih nama',
                                        expiration_time: Date.now() + 1000 * 60 * 5
                                    },
                                    bottom_sheet: {
                                        in_thread_buttons_limit: 2,
                                        divider_indices: [1, 2, 3, 4, 999],
                                        list_title: 'Nama PKL',
                                        button_title: 'Pilih Nama'
                                    },
                                    tap_target_configuration: {
                                        title: 'Pilih Anak PKL',
                                        description: 'Lihat jadwal PKL berdasarkan nama anak',
                                        canonical_url: 'https://t.me/sh3nnmine',
                                        domain: 't.me',
                                        button_index: 0
                                    }
                                }),
                                buttons: [
                                    {
                                        name: 'single_select',
                                        buttonParamsJson: JSON.stringify({
                                            title: 'Pilih Nama',
                                            sections: [
                                                {
                                                    title: 'Nama PKL',
                                                    rows,
                                                    highlight_label: 'pilih'
                                                }
                                            ],
                                            has_multiple_buttons: true
                                        })
                                    }
                                ]
                            }
                        }
                    }, { quoted: m });
                }

                const requestedName = text.split(' - ')[0].trim().toLowerCase();
                const pesertaData = jadwals.find(p => p.nama?.toLowerCase().includes(requestedName));
                
                if (!pesertaData || !pesertaData.schedule) return reply(`Jadwal untuk *${text.split(' - ')[0].trim()}* tidak ditemukan.`);

                let msg = `📅 *JADWAL PKL* - ${pesertaData.nama} (${pesertaData.sekolah})\n`;
                msg += `${'='.repeat(50)}\n\n`;
                
                pesertaData.schedule.forEach((item, index) => {
                    const shiftInfo = shifts[item.shift] || { nama: item.shift, waktu: '-', lokasi: '-' };
                    const isNightShift = item.shift === 'M1' || item.shift === 'M2' ? ' 🌙' : '';
                    const isToday = item.tanggal === todayStr ? ' ⭐ (HARI INI)' : '';
                    
                    msg += `${index + 1}. ${item.tanggal} (${item.hari})${isToday}\n`;
                    msg += `   Shift: ${shiftInfo.nama}${isNightShift}\n`;
                    msg += `   Waktu: ${shiftInfo.waktu}\n`;
                    msg += `   Lokasi: ${shiftInfo.lokasi}\n\n`;
                });
                
                reply(msg);
            }
            break;
            
            case "getcase": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                const caseId = text || m.quoted?.text?.trim();
                if (!caseId) return reply(`*usage:* ${prefix}getcase <caseId>`);

                const sourceFile = fs.readFileSync(__filename, 'utf-8');
                const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '$&');
                const regex = new RegExp(`case\\s+["']${escapeRegex(caseId)}["']\\s*:\\s*\\{`, 'g');
                const match = regex.exec(sourceFile);
                if (!match) return reply(`Case dengan id *${caseId}* tidak ditemukan di message.js.`);

                let start = match.index;
                let braceIndex = sourceFile.indexOf('{', match.index);
                let depth = 1;
                let end = braceIndex + 1;
                while (end < sourceFile.length && depth > 0) {
                    if (sourceFile[end] === '{') depth++;
                    else if (sourceFile[end] === '}') depth--;
                    end++;
                }
                if (depth !== 0) return reply(`Gagal mengambil case *${caseId}*. Struktur kode tidak valid.`);

                const remaining = sourceFile.slice(end);
                const breakMatch = remaining.match(/^\s*break\s*;\s*/);
                if (breakMatch) {
                    end += breakMatch[0].length;
                }

                const code = sourceFile.slice(start, end).trim();
                reply(`Kode case *${caseId}:*\n\n\`\`\`js\n${code}\n\n\`\`\``);
            }
            break;
            case "get":{
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                if (!/^https?:\/\//.test(text)) return reply(`*ex:* ${prefix + command} https://kyuurzy.site`);
                const ajg = await fetch(text);
                await reaction(m.chat, "⚡")
                
                if (ajg.headers.get("content-length") > 100 * 1024 * 1024) {
                    throw `Content-Length: ${ajg.headers.get("content-length")}`;
                }

                const contentType = ajg.headers.get("content-type");
                if (contentType.startsWith("image/")) {
                    return client.sendMessage(m.chat, {
                        image: { url: text }
                    }, { quoted: fquoted.packSticker });
                }
        
                if (contentType.startsWith("video/")) {
                    return client.sendMessage(m.chat, {
                        video: { url: text } 
                    }, { quoted: fquoted.packSticker });
                }
                
                if (contentType.startsWith("audio/")) {
                    return client.sendMessage(m.chat, {
                        audio: { url: text },
                        mimetype: 'audio/mpeg', 
                        ptt: true
                    }, { quoted: fquoted.packSticker });
                }
        
                let alak = await ajg.buffer();
                try {
                    alak = util.format(JSON.parse(alak + ""));
                } catch (e) {
                    alak = alak + "";
                } finally {
                    return reply(alak.slice(0, 65536));
                }
            }
            break;
            case "insp": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                if (!text && !m.quoted) return reply(`*reply:* ${prefix + command}`);
                let quotedType = m.quoted?.mtype || '';
                let penis = JSON.stringify({ [quotedType]: m.quoted }, null, 2);
                const acak = `insp-${crypto.randomBytes(6).toString('hex')}.json`;
                
                await client.sendMessage(m.chat, {
                    document: Buffer.from(penis),
                    fileName: acak,
                    mimetype: "application/json"
                }, { quoted: fquoted.packSticker })
            }
            break
            
            break
            case "exec": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                if (!budy.startsWith(".exec")) return;
                
                const { exec } = require("child_process");
                const args = budy.trim().split(' ').slice(1).join(' ');
                if (!args) return reply(`*ex:* ${prefix + command} ls`);
                exec(args, (err, stdout) => {
                    if (err) return reply(String(err));
                    if (stdout) return reply(stdout);
                });
            }
            break;
            
            case "eval": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                if (!budy.startsWith(".eval")) return;
                
                const args = budy.trim().split(' ').slice(1).join(' ');
                if (!args) return reply(`*ex:* ${prefix + command} m.chat`);
                let teks;
                try {
                    teks = await eval(`(async () => { ${args.startsWith("return") ? "" : "return"} ${args} })()`);
                } catch (e) {
                    teks = e;
                } finally {
                    await reply(require('util').format(teks));
                }
            }
            break;
            
            case "setupalertgroup": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                const groupId = text.trim();
                if (!groupId) return reply(`*usage:* ${prefix}setupalertgroup <GROUP_ID>\n\nContoh:\n${prefix}setupalertgroup 120363H7mKPII7BjyIeMK5ao3XYv@g.us`);
                
                // Save to config file
                const configPath = path.join(__dirname, '.env.alert');
                fs.writeFileSync(configPath, `ALERT_GROUP_ID=${groupId}`);
                reply(`✓ Alert group ID berhasil disimpan!\n\nGroup ID: *${groupId}*\n\nSekarang gunakan *${prefix}startalert* untuk mulai sistem alert.`);
            }
            break;

            case "startalert": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                const action = text.toLowerCase().trim();
                
                if (!action || (action !== 'on' && action !== 'off')) {
                    return reply(`*usage:* ${prefix}startalert <on|off>\n\nContoh:\n${prefix}startalert on\n${prefix}startalert off`);
                }
                
                const configPath = path.join(__dirname, '.env.alert');
                
                if (action === 'on') {
                    // Check if group ID is set
                    if (!fs.existsSync(configPath)) {
                        return reply(`⚠️ Alert group ID belum di-setup!\n\nGunakan terlebih dahulu:\n${prefix}setupalertgroup <GROUP_ID>`);
                    }
                    
                    // Start alert system by creating marker file
                    fs.writeFileSync(path.join(__dirname, '.alert.active'), 'true');
                    if (typeof client.startAbsenceAlerts === 'function') client.startAbsenceAlerts();
                    reply(`✓ Sistem alert *AKTIF*\n\n📢 Alert akan dikirim:\n• 50 menit sebelum jam kerja\n• 10 menit sebelum jam kerja`);
                } else {
                    // Stop alert system
                    if (fs.existsSync(path.join(__dirname, '.alert.active'))) {
                        fs.unlinkSync(path.join(__dirname, '.alert.active'));
                    }
                    reply(`✓ Sistem alert *NONAKTIF*`);
                }
            }
            break;
            case "alertsim": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                const inputTime = text.trim();
                if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(inputTime)) {
                    return reply(`*usage:* ${prefix}alertsim <HH:MM>\n\nContoh:\n${prefix}alertsim 09:15`);
                }
                
                const alertModule = require('./lib/absenceAlert');
                const result = await alertModule.checkAndSendAlerts(client, config, { packSticker: require('./w-shennmine/lib/fquoted').fquoted.packSticker }, inputTime);
                const manualResult = await alertModule.sendManualScheduleAlert(client, config, { packSticker: require('./w-shennmine/lib/fquoted').fquoted.packSticker }, inputTime);
                
                if (result.error) {
                    return reply(`⚠️ Gagal menjalankan simulasi: ${result.error}`);
                }
                if (manualResult.error) {
                    console.warn('Manual schedule alert error:', manualResult.error);
                }
                
                const totalSent = (result.sent || 0) + (manualResult.sent || 0);
                if (totalSent > 0) {
                    reply(`✅ Simulasi alert pada jam *${inputTime}* berhasil. Total pesan terkirim: *${totalSent}*`);
                } else {
                    let details = `⚠️ Simulasi alert pada jam *${inputTime}* selesai, tetapi tidak ada alert yang cocok pada waktu itu.`;
                    if (result.summary && result.summary.length) {
                        details += `\n\n*Jadwal alert hari ini:*
`;
                        result.summary.forEach(item => {
                            details += `• *${item.nama}* (${item.shiftName}) - ${item.shiftTime}\n`;
                            details += `  • 50 menit sebelum: ${item.alert50}\n`;
                            details += `  • 10 menit sebelum: ${item.alert10}\n`;
                        });
                    }
                    reply(details);
                }
            }
            break;

            case "setalert": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                const inputTime = text.trim();
                if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(inputTime)) {
                    return reply(`*usage:* ${prefix}setalert <HH:MM>\n\nContoh:\n${prefix}setalert 12:40`);
                }

                const alertPath = path.join(__dirname, '.alert.direct.json');
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                let directAlerts = [];
                if (fs.existsSync(alertPath)) {
                    try {
                        directAlerts = JSON.parse(fs.readFileSync(alertPath, 'utf-8')) || [];
                    } catch (e) {
                        directAlerts = [];
                    }
                }

                const existingIndex = directAlerts.findIndex(a => a.date === todayStr && a.time === inputTime);
                if (existingIndex === -1) {
                    directAlerts.push({ date: todayStr, time: inputTime });
                }
                fs.writeFileSync(alertPath, JSON.stringify(directAlerts, null, 2), 'utf-8');
                reply(`✅ Alert jam *${inputTime}* sudah disimpan untuk hari ini (${todayStr}).\nKetik *${prefix}tessim* atau tunggu jam tersebut agar notifikasi dikirim.`);
            }
            break;

            case "listalert": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                const alertPath = path.join(__dirname, '.alert.direct.json');
                if (!fs.existsSync(alertPath)) return reply(`⚠️ Belum ada alert direct yang disimpan.`);
                const directAlerts = JSON.parse(fs.readFileSync(alertPath, 'utf-8')) || [];
                if (!directAlerts.length) return reply(`⚠️ Belum ada alert direct yang disimpan.`);
                let textList = `📌 Alert direct yang disimpan:\n`;
                directAlerts.forEach(a => {
                    textList += `• ${a.date} ${a.time}\n`;
                });
                reply(textList);
            }
            break;

            case "clearalert": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                const alertPath = path.join(__dirname, '.alert.direct.json');
                if (fs.existsSync(alertPath)) {
                    fs.unlinkSync(alertPath);
                    reply(`✅ Semua alert direct telah dihapus.`);
                } else {
                    reply(`⚠️ Tidak ada alert direct untuk dihapus.`);
                }
            }
            break;

            case "tessim": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                const savedTimePath = path.join(__dirname, '.alert.time');
                let inputTime = text.trim();
                let loadedFromFile = false;

                if (!inputTime) {
                    if (!fs.existsSync(savedTimePath)) {
                        return reply(`*usage:* ${prefix}tessim <HH:MM>\n\nContoh:\n${prefix}tessim 09:10\n\nKetik tanpa argumen setelah waktu disimpan.`);
                    }
                    inputTime = fs.readFileSync(savedTimePath, 'utf-8').trim();
                    loadedFromFile = true;
                } else {
                    if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(inputTime)) {
                        return reply(`*usage:* ${prefix}tessim <HH:MM>\n\nContoh:\n${prefix}tessim 09:10`);
                    }
                    fs.writeFileSync(savedTimePath, inputTime, 'utf-8');
                }

                const alertModule = require('./lib/absenceAlert');
                const result = await alertModule.checkAndSendAlerts(client, config, { packSticker: require('./w-shennmine/lib/fquoted').fquoted.packSticker }, inputTime);
                const manualResult = await alertModule.sendManualScheduleAlert(client, config, { packSticker: require('./w-shennmine/lib/fquoted').fquoted.packSticker }, inputTime);

                if (result.error) {
                    return reply(`⚠️ Gagal menjalankan simulasi: ${result.error}`);
                }
                if (manualResult.error) {
                    console.warn('Manual schedule alert error:', manualResult.error);
                }

                const totalSent = (result.sent || 0) + (manualResult.sent || 0);
                let header = loadedFromFile
                    ? `🔎 Menjalankan simulasi alert dari waktu tersimpan *${inputTime}* ...`
                    : `🔎 Simulasi alert pada jam *${inputTime}* berhasil disimpan dan dijalankan.`;

                if (totalSent > 0) {
                    return reply(`${header}\n✅ Total alert dikirim: *${totalSent}*`);
                }

                let details = `${header}\n⚠️ Tidak ada alert yang cocok pada waktu itu.`;
                if (result.summary && result.summary.length) {
                    details += `\n\n*Jadwal alert hari ini:*\n`;
                    result.summary.forEach(item => {
                        details += `• *${item.nama}* (${item.shiftName}) - ${item.shiftTime}\n`;
                        details += `  • 50 menit sebelum: ${item.alert50}\n`;
                        details += `  • 10 menit sebelum: ${item.alert10}\n`;
                    });
                }
                reply(details);
            }
            break;

            case "testgroup": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                const configPath = path.join(__dirname, '.env.alert');
                if (!fs.existsSync(configPath)) {
                    return reply(`⚠️ Alert group belum di-setup!\n\nGunakan: ${prefix}setupalertgroup <GROUP_ID>`);
                }
                const groupId = fs.readFileSync(configPath, 'utf-8').match(/ALERT_GROUP_ID=(.+)/)?.[1]?.trim();
                if (!groupId) {
                    return reply(`⚠️ Group ID tidak valid di .env.alert`);
                }
                
                const testMsg = `🧪 *TEST ALERT GROUP*\n\nIni adalah pesan test untuk memastikan bot dapat mengirim ke group alert.\n\nGroup ID: ${groupId}\nWaktu: ${new Date().toLocaleString('id-ID')}`;
                
                try {
                    await client.sendMessage(groupId, { text: testMsg });
                    reply(`✅ Test berhasil dikirim ke group alert!\n\nGroup ID: ${groupId}`);
                } catch (error) {
                    reply(`❌ Gagal mengirim test ke group:\n${error.message}\n\nGroup ID: ${groupId}`);
                }
            }
            break;

            case "setjadwal": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                const args = text.split('|').map(s => s.trim());
                if (args.length < 3) {
                    return reply(`*usage:* ${prefix}setjadwal <nama>|<tanggal>|<shift>\n\nContoh:\n${prefix}setjadwal TestUser|2026-05-15|A2\n\nShift tersedia: A2, C4, PA2, PC4, SA2, SC4, dll.`);
                }
                
                const [nama, tanggal, shift] = args;
                const testSchedulePath = path.join(__dirname, '.test.schedule.json');
                
                let testSchedule = [];
                if (fs.existsSync(testSchedulePath)) {
                    try {
                        testSchedule = JSON.parse(fs.readFileSync(testSchedulePath, 'utf-8'));
                    } catch (e) {
                        testSchedule = [];
                    }
                }
                
                // Check if shift exists
                const listjadwal = require('./database/listjadwal');
                if (!listjadwal.shifts[shift]) {
                    const availableShifts = Object.keys(listjadwal.shifts).join(', ');
                    return reply(`⚠️ Shift '${shift}' tidak ditemukan!\n\nShift tersedia: ${availableShifts}`);
                }
                
                // Add or update schedule
                const existingIndex = testSchedule.findIndex(s => s.nama === nama && s.tanggal === tanggal);
                if (existingIndex >= 0) {
                    testSchedule[existingIndex].shift = shift;
                } else {
                    testSchedule.push({ nama, tanggal, shift });
                }
                
                fs.writeFileSync(testSchedulePath, JSON.stringify(testSchedule, null, 2));
                reply(`✅ Jadwal test berhasil disimpan!\n\n👤 *${nama}*\n📅 ${tanggal}\n⏰ Shift: ${shift} (${listjadwal.shifts[shift].nama})`);
            }
            break;

            case "clearjadwal": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                const testSchedulePath = path.join(__dirname, '.test.schedule.json');
                if (fs.existsSync(testSchedulePath)) {
                    fs.unlinkSync(testSchedulePath);
                    reply(`✅ Jadwal test berhasil dihapus. Sistem kembali menggunakan jadwal asli.`);
                } else {
                    reply(`⚠️ Tidak ada jadwal test yang aktif.`);
                }
            }
            break;

            case "testalert": {
                if (!listowner.owners.includes(sender)) return reply('Khusus owner!');
                const timeArg = text.trim();
                if (!timeArg || !/^\d{1,2}:\d{2}$/.test(timeArg)) {
                    return reply(`*usage:* ${prefix}testalert <HH:MM>\nContoh:\n${prefix}testalert 09:15`);
                }
                reply(`🔎 Simulasi alert pada jam *${timeArg}* ...`);
                await checkAndSendAlerts(client, config, { packSticker: require('./w-shennmine/lib/fquoted').fquoted.packSticker }, timeArg);
            }
            break;
            
            ///////////////////////////////////////////CASE YANG DI TAMBAHKAN AKAN DITEMPATKAN DI BAWAH INI, JANGAN LETAKKAN CASE DI LUAR SWITCH INI///////////////////////////////////////////

             
            
            
            


            

            case 'tagall': {
                const textMessage = args.join(" ") || "nothing";
                let teks = `tagall message :\n> *${textMessage}*\n\n`;
                const groupMetadata = await client.groupMetadata(m.chat);
                const participants = groupMetadata.participants || [];
                for (let mem of participants) {
                    teks += `@${mem.id.split("@")[0]}\n`;
                }
                
                client.sendMessage(m.chat, {
                    text: teks,
                    mentions: participants.map((a) => a.id)
                }, { quoted: fquoted.packSticker });
            }
            break;

            default:
        }
    } catch (err) {
        console.log(require("util").format(err));
    }
};
 


/////////////////////////////////////////case yang ditambahkan akan ditempatkan di atas ini, jangan letakkan case di bawah switch default ini/////////////////////////////////////////