const { Telegraf, Markup } = require('telegraf');
const axios = require('axios')

// Inisialisasi Bot dengan Token dari Environment Variable
const bot = new Telegraf("8593168699:AAHJD7PGbcTxT-oMZ6i-97IpUUfx7nzbVVY");

// Pesan saat bot baru dimulai
bot.start((ctx) => ctx.reply('Halo! Ketik /menu untuk melihat daftar perintah.'));

// Inti dari bot: Mendengarkan semua pesan teks

bot.on('text', async (ctx) => {
const body = ctx.message.text;
    const user = ctx.from;
    const userId = user.id;
    const username = user.username ? `@${user.username}` : 'No Username';
    const firstName = user.first_name;
    const time = new Date().toLocaleString("id-ID", {timeZone: "Asia/Jakarta"});

    // LOG REAL-TIME (Muncul di terminal Railway/VSCode)
    console.log(`[${time}] -> [${userId}] ${firstName} (${username}) : ${body}`);
    const prefix = /^[./!#]/gi.test(body) ? body.match(/^[./!#]/gi) : '#';
    const isCmd = body.startsWith(prefix);
    const command = isCmd ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : null;
    const args = body.trim().split(/ +/).slice(1);
    const text = args.join(" ");
    
    // Informasi User (Mirip sender di WA)
    const senderName = user.first_name;
    const sendMessage = async (ctx, text) => {
    const maxLength = 4000; // Ambil aman di bawah 4096
    if (text.length <= maxLength) {
        return await ctx.reply(text, { parse_mode: 'HTML' });
    }

    const messages = [];
    while (text.length > 0) {
        messages.push(text.substring(0, maxLength));
        text = text.substring(maxLength);
    }

    for (const msg of messages) {
        await ctx.reply(msg, { parse_mode: 'HTML' });
    }
};

    // Struktur Case (Mirip Bot WA)
    if (isCmd) {
        switch (command) {
        case 'sdetail': {
    if (!text) return ctx.reply(`Contoh: ${prefix}sdetail 54855`);
    
    // Cek apakah args (text) adalah angka
    if (isNaN(text)) return ctx.reply('❌ Mohon masukkan ID yang valid (harus berupa angka).');

    await ctx.reply('🔍 Sedang mengambil detail, mohon tunggu...');

    try {
        const response = await axios.get(`https://rynekoo-api.hf.space/dsc/nekopoi/v2/detail?id=${text}`);
        const data = response.data;

        if (!data.success || !data.result) {
            return ctx.reply('❌ Data tidak ditemukan untuk ID tersebut.');
        }

        const res = data.result;

        // Menyusun pesan utama
        let caption = `<b>🎬 ${res.title}</b>\n\n`;
        caption += `📅 <b>Date:</b> ${res.date}\n`;
        caption += `📝 <b>Note:</b> ${res.note || '-'}\n\n`;
        
        // Menyusun Link Streaming
        if (res.stream && res.stream.length > 0) {
            caption += `<b>📺 Streaming Links:</b>\n`;
            res.stream.forEach((s, i) => {
                caption += `- <a href="${s.link}">Stream ${i + 1}</a>\n`;
            });
            caption += `\n`;
        }

        // Menyusun Link Download
        if (res.download && res.download.length > 0) {
            caption += `<b>📥 Download Links:</b>\n`;
            res.download.forEach(dl => {
                caption += `• <b>Resolusi ${dl.type}P:</b>\n`;
                dl.links.forEach(l => {
                    caption += `  - <a href="${l.link}">${l.name}</a>\n`;
                });
            });
        }

        // Mengirim gambar cover dengan caption detail
        // Jika gambar error, bot akan mengirim teks saja
        await ctx.replyWithPhoto(res.image, {
            caption: caption,
            parse_mode: 'HTML'
        }).catch(async () => {
            // Fallback jika URL gambar dari API mati/error
            await sendMessage(ctx, caption);
        });

    } catch (e) {
        console.error(e);
        ctx.reply('⚠️ Terjadi kesalahan saat mengambil detail dari API.');
    }
    break;
}
                case 'sxnxx': {
    if (!text) return ctx.reply(`Contoh: ${prefix}sxnxx wuthering waves`);
    await ctx.reply('🔍 Mencari video, mohon tunggu...');

    try {
        const response = await axios.get(`https://rynekoo-api.hf.space/dsc/xnxx/search?q=${encodeURIComponent(text)}`);
        const data = response.data;

        if (!data.success || !data.result || data.result.length === 0) {
            return ctx.reply('❌ Video tidak ditemukan.');
        }

        const results = data.result.slice(0, 10); // Batasi 10 hasil
        let caption = `<b>🔞 XNXX Search: ${text}</b>\n\n`;
        
        const buttons = [];
        for (let i = 0; i < results.length; i += 2) {
            const row = [];
            row.push(Markup.button.callback(`${i + 1}`, `xnxxdl_${i}`));
            if (results[i + 1]) {
                row.push(Markup.button.callback(`${i + 2}`, `xnxxdl_${i + 1}`));
            }
            buttons.push(row);
        }

        const listText = results.map((v, i) => {
            return `<b>${i + 1}.</b> ${v.title}\n👁‍🗨 ${v.views} | 🕒 ${v.duration} | 📺 ${v.resolution}`;
        }).join('\n\n');

       await ctx.reply(`${caption}${listText}`, {
            parse_mode: 'HTML',
            disable_web_page_preview: true, // Agar tidak muncul kotak link preview yang mengganggu
            ...Markup.inlineKeyboard(buttons)
        });

    } catch (e) {
        console.error(e);
        ctx.reply('⚠️ Terjadi kesalahan pada API Pencarian.');
    }
    break;
}
        case 'sneko': {
    if (!text) return ctx.reply(`Contoh: ${prefix}sneko wuthering waves`);
    
    await ctx.reply('🔍 Sedang mencari, mohon tunggu...');

    try {
        const response = await axios.get(`https://rynekoo-api.hf.space/dsc/nekopoi/v2/search?q=${encodeURIComponent(text)}`);
        const data = response.data;

        if (!data.success || !data.result.result) {
            return ctx.reply('❌ Hasil tidak ditemukan.');
        }

        const filteredResult = data.result.result.filter(item => item.type === 'post');

        if (filteredResult.length === 0) {
            return ctx.reply('❌ Hasil ditemukan, namun semua konten bertipe hentai (disembunyikan).');
        }

        // 1. Buat teks caption
        let caption = `<b>Hasil Pencarian: ${text}</b>\n`;
        caption += `<i>(Menampilkan ${filteredResult.length} hasil tipe post)</i>\n\n`;
        
        filteredResult.forEach((v, i) => {
            caption += `<b>${i + 1}. ${v.title}</b>\n`;
            caption += `📅 Date: ${v.date}\n`;
            caption += `🆔 ID: <code>${v.id}</code>\n\n`;
        });

// 2. Buat daftar button (Kiri-Kanan / 2 Kolom)
        const buttons = [];
        for (let i = 0; i < filteredResult.length; i += 2) {
            const row = [];
            
            // Tombol pertama (Kiri)
            const title1 = filteredResult[i].title;
            const shortTitle1 = title1.length > 15 ? title1.substring(0, 15) + ".." : title1;
            row.push(Markup.button.callback(shortTitle1, `sdetail_click_${filteredResult[i].id}`));

            // Tombol kedua (Kanan) - Jika ada
            if (filteredResult[i + 1]) {
                const title2 = filteredResult[i + 1].title;
                const shortTitle2 = title2.length > 15 ? title2.substring(0, 15) + ".." : title2;
                row.push(Markup.button.callback(shortTitle2, `sdetail_click_${filteredResult[i + 1].id}`));
            }

            buttons.push(row);
        }

        // 3. Kirim pesan
        // Gunakan sendMessage helper jika caption sangat panjang, 
        // tapi jika ingin pakai button, kirim via ctx.reply
        await ctx.reply(caption, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard(buttons)
        });

    } catch (e) {
        console.error(e);
        ctx.reply('⚠️ Terjadi kesalahan saat mengambil data dari API.');
    }
    break;
}
case 'scosplay': {
    if (!text) return ctx.reply(`Contoh: ${prefix}scosplay wuthering waves`);
    await ctx.reply('🔍 Mencari album cosplay...');

    try {
        const response = await axios.get(`https://rynekoo-api.hf.space/dsc/cosplaytele/search?q=${encodeURIComponent(text)}`);
        const data = response.data;

        if (!data.success || !data.result || data.result.length === 0) {
            return ctx.reply('❌ Hasil tidak ditemukan.');
        }

        const results = data.result;
        // Kita tampilkan 10 hasil saja supaya button tidak kepanjangan
        const limitedResults = results.slice(0, 10);

        let caption = `<b>📸 Cosplay Search: ${text}</b>\n`;
        caption += `Pilih album di bawah untuk melihat detail & foto:`;

        const buttons = [];
        for (let i = 0; i < limitedResults.length; i += 2) {
            const row = [];
            // Kita kirim URL detail di callback_data. 
            // NOTE: Telegram limit callback_data 64 byte, jadi kita pakai index saja agar aman.
            row.push(Markup.button.callback(`${i + 1}`, `scos_choice_${i}`));
            if (limitedResults[i + 1]) {
                row.push(Markup.button.callback(`${i + 2}`, `scos_choice_${i + 1}`));
            }
            buttons.push(row);
        }

        // Tampilkan daftar teksnya supaya user tau angka 1 itu judul apa
        let listText = limitedResults.map((v, i) => `${i + 1}. ${v.title}`).join('\n');
        
        // Simpan sementara hasil pencarian ini di context state (opsional) atau panggil ulang di callback
        await ctx.replyWithPhoto(limitedResults[0].cover, {
            caption: `${caption}\n\n${listText}`,
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard(buttons)
        });

    } catch (e) {
        ctx.reply('⚠️ Error saat mengambil data.');
    }
    break;
}

case 'menu':
case 'help': {
    const senderName = ctx.from.first_name;
    const botName = ctx.botInfo.first_name;

    // Logika Waktu & Salam
// 1. Ambil jam (dalam angka 0-23) berdasarkan zona waktu Jakarta
const jam = parseInt(new Date().toLocaleTimeString('id-ID', { 
    timeZone: 'Asia/Jakarta', 
    hour: '2-digit', 
    hour12: false 
}));

// 2. Ambil string waktu lengkap untuk tampilan di menu
const waktu = new Date().toLocaleTimeString('id-ID', { 
    timeZone: "Asia/Jakarta" 
});

// Sekarang kamu bisa pakai logika salam
let salam = "Selamat Malam 🌙";
if (jam >= 4 && jam < 11) salam = "Selamat Pagi ☀️";
else if (jam >= 11 && jam < 15) salam = "Selamat Siang 🌤️";
else if (jam >= 15 && jam < 19) salam = "Selamat Sore 🌅";

const sekarang = new Date()

    const hari = sekarang.toLocaleDateString('id-ID', { 
    timeZone: 'Asia/Jakarta', 
    weekday: 'long' 
});

// 4. Ambil Tanggal Lengkap (WIB)
const tanggal = sekarang.toLocaleDateString('id-ID', { 
    timeZone: 'Asia/Jakarta', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
});

// 5. Ambil Waktu/Jam Menit (WIB)
const jamMenit = sekarang.toLocaleTimeString('id-ID', { 
    timeZone: 'Asia/Jakarta', 
    hour: '2-digit', 
    minute: '2-digit' 
});

    let menuMsg = `╔═════ೋღ🌺ღೋ═════╗\n`;
    menuMsg += `║   <b>${botName.toUpperCase()} MENU</b>   ║\n`;
    menuMsg += `╚═════ೋღ🌺ღೋ═════╝\n\n`;
    
    menuMsg += `👋 <i>${salam}, ${senderName}!</i>\n`;
    menuMsg += `📅 <b>Hari:</b> ${hari}\n`;
    menuMsg += `🗓️ <b>Tanggal:</b> ${tanggal}\n`;
    menuMsg += `⌚ <b>Waktu:</b> ${jamMenit} WIB\n\n`;

    // Perbaikan: Menggunakan &lt; dan &gt; agar tidak error
    menuMsg += `┏━━━〔 <b>NEKOPOI</b> 〕━━━┓\n`;
    menuMsg += `┃ 🐾 <code>/sneko</code> &lt;query&gt;\n`;
    menuMsg += `┃ 📑 <code>/sdetail</code> &lt;id&gt;\n`;
    menuMsg += `┃ 🐾 <code>/sxnxx</code> &lt;query&gt;\n`;
    menuMsg += `┗━━━━━━━━━━━━━━━━━━┛\n\n`;

    menuMsg += `┏━━━〔 <b>COSPLAY</b> 〕━━━┓\n`;
    menuMsg += `┃ 📸 <code>/scosplay</code> &lt;query&gt;\n`;
    menuMsg += `┗━━━━━━━━━━━━━━━━━━┛\n\n`;

    menuMsg += `┏━━━〔 <b>INFO</b> 〕━━━┓\n`;
    menuMsg += `┃ 👤 <code>/owner</code>\n`;
    menuMsg += `┃ 📜 <code>/menu</code>\n`;
    menuMsg += `┗━━━━━━━━━━━━━━━━━━┛\n\n`;

    menuMsg += `<i>Powered by @Railway</i>`;

    const menuButtons = [
        [
            Markup.button.callback('🔍 Search Neko', 'btn_sneko'),
            Markup.button.callback('📸 Search Cosplay', 'btn_scosplay')
        ],
        [
            Markup.button.callback('👑 Owner', 'btn_owner')
        ]
    ];

    await ctx.reply(menuMsg, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard(menuButtons)
    });
    break;
}
case 'ch': {
await ctx.telegram.sendMessage("-1003415118065", "Hai", {
            parse_mode: 'HTML'
        });
}
break
case 'owner': {
    await ctx.reply(`👤 <b>Owner Information</b>\n\nNama: Alfa\nTelegram: @allolipop\n\n<i>Silakan hubungi jika ada kendala pada bot.</i>`, { parse_mode: 'HTML' });
    break;
}

            default:
                // Jika command tidak ditemukan, tidak melakukan apa-apa atau beri respon
                break;
        }
    }
});
bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data; 
    const user = ctx.from;
    const time = new Date().toLocaleString("id-ID", {timeZone: "Asia/Jakarta"});

    // LOG CLICK BUTTON
    console.log(`[${time}] -> [BUTTON CLICK] ${user.first_name} : ${data}`);
// Tambahkan di dalam listener callback_query yang sudah ada
    if (data.startsWith('xnxxdl_')) {
    const index = parseInt(data.split('_')[1]);
    
    // Ambil query dari caption pesan sebelumnya
    const queryMatch = ctx.callbackQuery.message.caption.match(/Search: (.*)\n/);
    const query = queryMatch ? queryMatch[1] : '';

    await ctx.answerCbQuery('Sedang mengirim video...');

    try {
        // 1. Ambil URL video dari hasil pencarian
        const searchRes = await axios.get(`https://rynekoo-api.hf.space/dsc/xnxx/search?q=${encodeURIComponent(query)}`);
        const targetUrl = searchRes.data.result[index].url;
        const title = searchRes.data.result[index].title;

        // 2. Tembak API Download
        const dlRes = await axios.get(`https://rynekoo-api.hf.space/dwn/xnxx?url=${encodeURIComponent(targetUrl)}`);
        const videoData = dlRes.data.result.videos;
        const highResUrl = videoData.high;

        // 3. Kirim Video Langsung
        await ctx.replyWithVideo({ url: highResUrl }, {
            caption: `<b>🎬 ${title}</b>\n\n✅ <i>Berhasil dikirim langsung!</i>`,
            parse_mode: 'HTML'
        }).catch(async (err) => {
            // Jika error (biasanya karena ukuran > 50MB atau server TG lambat)
            console.log("Gagal kirim video langsung, mengirim link...");
            
            let caption = `<b>🎬 ${title}</b>\n\n`;
            caption += `⚠️ <b>Gagal Kirim Langsung:</b> Ukuran video mungkin lebih dari 50MB (Limit Bot).\n\n`;
            caption += `👇 <b>Silakan klik link di bawah:</b>`;

            await ctx.reply(caption, {
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                ...Markup.inlineKeyboard([
                    [Markup.button.url('📥 Download / Stream (High)', highResUrl)],
                    [Markup.button.url('📥 Alternative (Low)', videoData.low)]
                ])
            })
        });

    } catch (e) {
        console.error(e);
        ctx.reply('⚠️ Terjadi kesalahan saat memproses video.');
    }
}
if (data === 'btn_sneko') {
    await ctx.answerCbQuery();
    await ctx.reply('Silakan gunakan format: /sneko [judul]');
}
if (data === 'btn_scosplay') {
    await ctx.answerCbQuery();
    await ctx.reply('Silakan gunakan format: /scosplay [judul]');
}
if (data === 'btn_owner') {
    await ctx.answerCbQuery();
    await ctx.reply('Owner bot ini adalah: @allolipop');
}
    if (data.startsWith('sdetail_click_')) {
        const id = data.split('_')[2]; // Mengambil ID dari "sdetail_click_54855"
        
        // 1. Hilangkan loading jam pasir di tombol
        await ctx.answerCbQuery('Loading detail...'); 

        try {
            // 2. Tembak API Detail
            const response = await axios.get(`https://rynekoo-api.hf.space/dsc/nekopoi/v2/detail?id=${id}`);
            const res = response.data.result;

            if (!res) return ctx.reply('❌ Detail tidak ditemukan.');

            // 3. Susun Teks (Sama seperti logika sdetail kamu)
            let caption = `<b>🎬 ${res.title}</b>\n\n`;
            caption += `📅 <b>Date:</b> ${res.date}\n`;
            caption += `📝 <b>Note:</b> ${res.note || '-'}\n\n`;
            
            if (res.stream && res.stream.length > 0) {
                caption += `<b>📺 Streaming Links:</b>\n`;
                res.stream.forEach((s, i) => {
                    caption += `- <a href="${s.link}">Stream ${i + 1}</a>\n`;
                });
                caption += `\n`;
            }

            if (res.download && res.download.length > 0) {
                caption += `<b>📥 Download Links:</b>\n`;
                res.download.forEach(dl => {
                    caption += `• <b>Resolusi ${dl.type}P:</b>\n`;
                    dl.links.forEach(l => {
                        caption += `  - <a href="${l.link}">${l.name}</a>\n`;
                    });
                });
            }

            // 4. Kirim hasil (Foto + Caption)
            await ctx.replyWithPhoto(res.image, {
                caption: caption,
                parse_mode: 'HTML'
            }).catch(async () => {
                await sendMessage(ctx, caption); // Fallback ke sendMessage jika gambar error
            });

        } catch (e) {
            console.error(e);
            await ctx.reply('⚠️ Gagal mengambil data detail dari server.');
        }
    }
    if (data.startsWith('scos_choice_')) {
        const index = parseInt(data.split('_')[2]);
        
        // Kita butuh query pencarian awal lagi. 
        // Untuk simpelnya kita ambil dari teks pesan lama (caption)
        const queryMatch = ctx.callbackQuery.message.caption.match(/Search: (.*)\n/);
        const query = queryMatch ? queryMatch[1] : '';

        await ctx.answerCbQuery('Sedang memproses detail...');

        try {
            // 1. Cari ulang untuk dapat URL spesifik berdasarkan index
            const searchRes = await axios.get(`https://rynekoo-api.hf.space/dsc/cosplaytele/search?q=${encodeURIComponent(query)}`);
            const targetUrl = searchRes.data.result[index].url;

            // 2. Tembak API detail
            const detailRes = await axios.get(`https://rynekoo-api.hf.space/dsc/cosplaytele/detail?url=${encodeURIComponent(targetUrl)}`);
            const res = detailRes.data.result;

            // 3. Kirim Info
            let caption = `<b>🎬 ${res.title}</b>\n\n`;
            caption += `👤 <b>Cosplayer:</b> ${res.cosplayer.name}\n`;
            caption += `📦 <b>Info:</b> ${res.info}\n`;
            caption += `🔑 <b>Pass:</b> <code>${res.unzip_password || '-'}</code>\n\n`;
            caption += `📥 <b>Download:</b>\n`;
            res.downloadUrl.forEach(dl => {
                caption += `- <a href="${dl.url}">${dl.provider}</a>\n`;
            });

            await ctx.reply(caption, { parse_mode: 'HTML', disable_web_page_preview: true });

            // 4. Kirim Album Foto (Batch per 10)
if (res.images && res.images.length > 0) {
    for (let i = 0; i < res.images.length; i += 10) {
        const batch = res.images.slice(i, i + 10).map((img, index) => ({ 
            type: 'photo', 
            media: img,
            // Opsional: Kasih caption di foto pertama tiap batch agar di CH ada judulnya
            caption: (i === 0 && index === 0) ? `📸 ${res.title}` : '' 
        }));

        // 1. Kirim ke user yang sedang chat (Private)
        await ctx.replyWithMediaGroup(batch).catch((e) => console.log("Gagal kirim ke user:", e.description));

        // 2. Kirim ke Channel (Menggunakan ctx.telegram)
        await ctx.telegram.sendMediaGroup("-1003415118065", batch).catch((e) => {
            console.log("Gagal kirim ke Channel. Cek apakah ID benar & Bot sudah Admin:", e.description);
        });
    }
}

        } catch (e) {
            console.error(e);
            ctx.reply('⚠️ Gagal mengambil detail album.');
        }
    }
})
// Menjalankan Bot
console.log('Sedang menghubungkan ke Telegram...');
console.log('====================================');
    console.log('🚀 BOT TELEGRAM STARTED');
    console.log('🛡️ Status: Online');
    // Paksa ke zona waktu Jakarta (WIB)
    const wibTime = new Date().toLocaleString("id-ID", {timeZone: "Asia/Jakarta"});
    console.log(`⏰ Time: ${wibTime} WIB`);
    console.log('====================================');
bot.launch({
    dropPendingUpdates: true // Menghapus pesan yang menumpuk saat bot mati
}).then(() => {
    
}).catch((err) => {
    console.error('❌ GAGAL START BOT:', err);
});

// Penanganan error agar bot tidak mati mendadak
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
