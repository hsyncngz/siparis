// Google Sheets Canlı CSV Linkin
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRrCjNVASPnz9j40KxsZ7nCoIMBuqQLmxLiXmUM-CXTAp0cW03lM0YlJQMf7IJ054QmTvlTXp3iLMYj/pub?output=csv";

async function csvToJson(url) {
    // Cache-busting: Verinin her zaman en güncel halini çekmek için rastgele sayı ekliyoruz
    const response = await fetch(url + "&cache=" + Math.random());
    const text = await response.text();
    
    // Satırları ayır (boş satırları filtrele)
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // İlk satır başlıkları içerir
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
        // Virgülle ayrılmış değerleri alırken tırnak içindeki virgülleri korumak için regex
        const data = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        return headers.reduce((obj, header, i) => {
            let val = data[i] ? data[i].replace(/^"|"$/g, '').trim() : "";
            obj[header.trim()] = val;
            return obj;
        }, {});
    });
}

async function girisYap() {
    const uInp = document.getElementById('username').value.trim();
    const pInp = document.getElementById('password').value.trim();

    if(!uInp || !pInp) {
        alert("Lütfen tüm alanları doldurun.");
        return;
    }

    try {
        const daireler = await csvToJson(sheetUrl);
        // Kullanıcı adı ve şifre kontrolü
        const user = daireler.find(d => d.username === uInp && d.password === pInp);

        if (user) {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-panel').style.display = 'block';
            
            // Bilgileri Ekrana Yazdır
            document.getElementById('welcome-msg').innerText = `Sn. ${user.sahibi}`;
            document.getElementById('aidat').innerText = (user.aidatBorcu || "0") + " TL";
            document.getElementById('yakit').innerText = (user.yakitBorcu || "0") + " TL";
            document.getElementById('diger').innerText = (user.digerBorc || "0") + " TL";
            
            // Forum ve Duyuruları hala forum.json'dan çekiyoruz
            forumYukle(user.sahibi);
        } else {
            alert("Hatalı kullanıcı adı veya şifre!");
        }
    } catch (e) {
        console.error(e);
        alert("Veritabanına bağlanılamadı. Lütfen internetinizi ve tablo linkini kontrol edin.");
    }
}

// Forum ve Duyuru Fonksiyonu (forum.json dosyan hazır olmalı)
async function forumYukle(kisiAdi) {
    try {
        const res = await fetch('./forum.json?v=' + Math.random());
        const fData = await res.json();

        // Duyurular
        const dDiv = document.getElementById('duyuru-alani');
        dDiv.innerHTML = fData.duyurular.map(m => `<div class="announcement">📢 ${m}</div>`).join('');

        // Forum
        const fList = document.getElementById('forum-list');
        fList.innerHTML = fData.mesajlar.reverse().map(m => `
            <div class="forum-item">
                <strong>${m.kisi}</strong>: ${m.mesaj}
                <small>${m.tarih}</small>
            </div>
        `).join('');

        saatKontrolu(kisiAdi);
    } catch (e) {
        console.warn("Forum verisi yüklenemedi, forum.json dosyasını kontrol edin.");
    }
}

function saatKontrolu(kisi) {
    const saat = new Date().getHours();
    const alan = document.getElementById('mesaj-yazma-alani');
    if (saat >= 9 && saat < 22) {
        alan.innerHTML = `
            <textarea id="msg-text" placeholder="Mes
            
