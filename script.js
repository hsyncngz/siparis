const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRrCjNVASPnz9j40KxsZ7nCoIMBuqQLmxLiXmUM-CXTAp0cW03lM0YlJQMf7IJ054QmTvlTXp3iLMYj/pub?output=csv";
const scriptUrl = "https://script.google.com/macros/s/BURAYA_SCRIPT_URL_GELECEK/exec";

let aktifKullanici = null;

async function girisYap() {
    console.log("Giriş denemesi başlatıldı...");
    const uInp = document.getElementById('username').value.trim();
    const pInp = document.getElementById('password').value.trim();

    if (!uInp || !pInp) {
        alert("Lütfen tüm alanları doldurun.");
        return;
    }

    try {
        const response = await fetch(sheetUrl + "&cache=" + Math.random());
        const text = await response.text();
        
        const rows = text.split('\n').filter(row => row.trim() !== '');
        const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        
        const daireler = rows.slice(1).map(row => {
            const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            let obj = {};
            headers.forEach((header, i) => { obj[header] = values[i] || ""; });
            return obj;
        });

        const user = daireler.find(d => d.username === uInp && d.password === pInp);

        if (user) {
            aktifKullanici = user; // Kullanıcıyı belleğe al
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-panel').style.display = 'block';
            
            document.getElementById('welcome-msg').innerText = `Sn. ${user.sahibi}`;
            document.getElementById('aidat').innerText = (user.aidatBorcu || "0") + " TL";
            document.getElementById('yakit').innerText = (user.yakitBorcu || "0") + " TL";
            document.getElementById('diger').innerText = (user.digerBorc || "0") + " TL";
            
            // Duyuru ve Forumu Yükle
            forumYukle(user.sahibi).catch(e => console.log("Forum hatası"));
            
            // Başarılı girişi logla
            logGonder(user.daireNo, "basarili");
        } else {
            alert("Kullanıcı adı veya şifre yanlış!");
            logGonder(uInp, "basarisiz");
        }
    } catch (e) {
        console.error("Hata:", e);
        alert("Bağlantı hatası oluştu.");
    }
}

// Google Sheets'e Arıza/Talep Gönderen Fonksiyon
async function talepGonder() {
    const konu = document.getElementById('talep-konu').value;
    const mesaj = document.getElementById('talep-text').value.trim();

    if (mesaj.length < 5) return alert("Lütfen daha detaylı bir açıklama yazın.");

    try {
        await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                islem: "talepKaydet",
                daireNo: aktifKullanici.daireNo,
                konu: konu,
                mesaj: mesaj
            })
        });
        alert("Talebiniz yönetime iletildi.");
        document.getElementById('talep-text').value = "";
    } catch (e) {
        alert("Gönderilemedi, lütfen tekrar deneyin.");
    }
}

async function logGonder(dNo, durum) {
    fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ daireNo: dNo, durum: durum })
    });
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
    // Eğer saatler arasındaysa mesaj kutusunu göster (Arıza bildirimi her zaman açık kalabilir)
    if (saat >= 9 && saat < 22) {
        alan.innerHTML = `<textarea id="msg-text" placeholder="Forum mesajınızı yazın..."></textarea><button class="btn btn-primary" onclick="mesajGonder('${kisi}')">Forumda Paylaş</button>`;
    } else {
        alan.innerHTML = `<div class="time-badge">⚠️ Forum mesaj sistemi 09:00 - 22:00 arası aktiftir.</div>`;
    }
}
