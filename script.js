// Google Sheets CSV Linkiniz
const googleSheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRrCjNVASPnz9j40KxsZ7nCoIMBuqQLmxLiXmUM-CXTAp0cW03lM0YlJQMf7IJ054QmTvlTXp3iLMYj/pub?output=csv";

async function anaGirisFonksiyonu() {
    const uIn = document.getElementById('username').value.trim();
    const pIn = document.getElementById('password').value.trim();
    const loader = document.getElementById('loader');
    const btn = document.getElementById('loginBtn');

    // 1. Alan Kontrolü
    if (!uIn || !pIn) {
        alert("Lütfen kullanıcı adı ve şifrenizi giriniz.");
        return;
    }

    // 2. Yükleniyor Durumu
    btn.disabled = true;
    btn.innerText = "Sorgulanıyor...";
    loader.style.display = "block";

    try {
        // 3. Şifre Doğrulama (sifreler.json)
        // t= parametresi tarayıcının eski şifreleri hatırlamasını (cache) engeller
        const sResp = await fetch('./sifreler.json?t=' + Date.now());
        if (!sResp.ok) throw new Error("Şifre dosyasına ulaşılamadı.");
        
        const sData = await sResp.json();
        const hesap = sData.hesaplar.find(h => h.username === uIn && String(h.password) === pIn);

        if (!hesap) {
            alert("Hatalı kullanıcı adı veya şifre!");
            sistemiSifirla(btn, loader);
            return;
        }

        // 4. Borç Bilgilerini Çekme (Google Sheets)
        const bResp = await fetch(googleSheetUrl + "&t=" + Date.now());
        if (!bResp.ok) throw new Error("Google Sheets verisine ulaşılamadı.");
        
        const csv = await bResp.text();
        
        // 5. CSV Parçalama Mantığı
        const rows = csv.split(/\r?\n/).filter(r => r.trim() !== '');
        const sep = rows[0].includes(';') ? ';' : ',';
        const headers = rows[0].split(sep).map(h => h.trim());
        
        const veriler = rows.slice(1).map(row => {
            const cols = row.split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
            let item = {};
            headers.forEach((h, i) => item[h] = cols[i] || "");
            return item;
        });

        // 6. Daire Eşleştirme
        const detay = veriler.find(d => String(d.daireNo) === String(hesap.daireNo));

        if (detay) {
            // Bilgileri Ekrana Yaz
            document.getElementById('display-name').innerText = "Sn. " + (detay.sahibi || "Sakin");
            document.getElementById('val-no').innerText = detay.daireNo;
            document.getElementById('val-aidat').innerText = (detay.aidatBorcu || "0") + " TL";
            document.getElementById('val-yakit').innerText = (detay.yakitBorcu || "0") + " TL";
            document.getElementById('val-diger').innerText = (detay.digerBorc || "0") + " TL";

            // Ekran Değiştir
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('info-panel').style.display = 'block';
        } else {
            alert("Dairenize ait borç kaydı bulunamadı. Lütfen yöneticiye danışın.");
            sistemiSifirla(btn, loader);
        }

    } catch (e) {
        console.error("Sistem Hatası:", e);
        alert("Bağlantı hatası! Lütfen internetinizi kontrol edin veya daha sonra tekrar deneyin.");
        sistemiSifirla(btn, loader);
    }
}

// Hata durumunda butonu eski haline getiren yardımcı fonksiyon
function sistemiSifirla(btn, loader) {
    btn.disabled = false;
    btn.innerText = "Sorgula";
    loader.style.display = "none";
}
