// Google Sheets CSV Linkin
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRrCjNVASPnz9j40KxsZ7nCoIMBuqQLmxLiXmUM-CXTAp0cW03lM0YlJQMf7IJ054QmTvlTXp3iLMYj/pub?output=csv";

async function girisYap() {
    console.log("Giriş tuşuna basıldı..."); // Tuşun çalışıp çalışmadığını konsoldan görmek için
    
    const uInp = document.getElementById('username').value.trim();
    const pInp = document.getElementById('password').value.trim();

    if (!uInp || !pInp) {
        alert("Lütfen tüm alanları doldurun.");
        return;
    }

    try {
        console.log("Veriler çekiliyor...");
        const response = await fetch(sheetUrl + "&cache=" + Math.random());
        const text = await response.text();
        
        // CSV Parçalama
        const rows = text.split('\n').filter(row => row.trim() !== '');
        const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        
        const daireler = rows.slice(1).map(row => {
            const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            let obj = {};
            headers.forEach((header, i) => {
                obj[header] = values[i] || "";
            });
            return obj;
        });

        console.log("Tablo verisi işlendi:", daireler);

        // Kullanıcıyı bul
        const user = daireler.find(d => d.username === uInp && d.password === pInp);

        if (user) {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-panel').style.display = 'block';
            
            document.getElementById('welcome-msg').innerText = `Sn. ${user.sahibi}`;
            document.getElementById('aidat').innerText = (user.aidatBorcu || "0") + " TL";
            document.getElementById('yakit').innerText = (user.yakitBorcu || "0") + " TL";
            document.getElementById('diger').innerText = (user.digerBorc || "0") + " TL";
            
            // Forumu yükle (Hata alsa bile girişi engellemez)
            forumYukle(user.sahibi).catch(e => console.log("Forum yüklenemedi"));
        } else {
            alert("Kullanıcı adı veya şifre yanlış!");
        }
    } catch (e) {
        console.error("Hata detayı:", e);
        alert("Bağlantı hatası oluştu. Konsol kaydını kontrol edin.");
    }
}

async function forumYukle(kisiAdi) {
    const res = await fetch('./forum.json?v=' + Math.random());
    const fData = await res.json();
    document.getElementById('duyuru-alani').innerHTML = fData.duyurular.map(m => `<div class="announcement">📢 ${m}</div>`).join('');
    document.getElementById('forum-list').innerHTML = fData.mesajlar.reverse().map(m => `<div class="forum-item"><strong>${m.kisi}</strong>: ${m.mesaj}<small>${m.tarih}</small></div>`).join('');
    saatKontrolu(kisiAdi);
}

function saatKontrolu(kisi) {
    const saat = new Date().getHours();
    const alan = document.getElementById('mesaj-yazma-alani');
    if (saat >= 9 && saat < 22) {
        alan.innerHTML = `<textarea id="msg-text" placeholder="Mesajınızı yazın..."></textarea><button class="btn btn-primary" onclick="mesajGonder('${kisi}')">Gönder</button>`;
    } else {
        alan.innerHTML = `<div class="time-badge">⚠️ Mesaj sistemi 09:00 - 22:00 arası aktiftir.</div>`;
    }
}

function mesajGonder(kisi) {
    const txt = document.getElementById('msg-text').value;
    if(txt.length < 5) return alert("Mesaj çok kısa.");
    window.open(`https://docs.google.com/forms/d/e/FORM_ID/viewform?entry.1=${encodeURIComponent(kisi)}&entry.2=${encodeURIComponent(txt)}`, '_blank');
}
