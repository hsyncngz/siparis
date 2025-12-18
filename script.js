// İki farklı JSON'u aynı anda okuyan ana fonksiyon
async function paneliHazirla(user) {
    try {
        // İki dosyayı da çekiyoruz
        const [borcRes, forumRes] = await Promise.all([
            fetch('./veriler.json?v=' + Math.random()),
            fetch('./forum.json?v=' + Math.random())
        ]);

        const borcData = await borcRes.json();
        const forumData = await forumRes.json();

        // 1. Borç Bilgilerini Yazdır (veriler.json'dan)
        document.getElementById('aidat').innerText = user.aidatBorcu + " TL";
        document.getElementById('yakit').innerText = user.yakitBorcu + " TL";
        document.getElementById('diger').innerText = user.digerBorc + " TL";

        // 2. Duyuruları Yazdır (forum.json'dan)
        const dDiv = document.getElementById('duyuru-alani');
        dDiv.innerHTML = "";
        forumData.duyurular.forEach(msg => {
            dDiv.innerHTML += `<div class="announcement">📢 ${msg}</div>`;
        });

        // 3. Forum Mesajlarını Yazdır (forum.json'dan)
        const fDiv = document.getElementById('forum-list');
        fDiv.innerHTML = "";
        forumData.mesajlar.forEach(m => {
            fDiv.innerHTML += `
                <div class="forum-msg">
                    <strong>${m.kisi}:</strong> ${m.mesaj} 
                    <br><small>${m.tarih}</small>
                </div>`;
        });

        saatKontrolu(user.sahibi);

    } catch (error) {
        console.error("Veri yükleme hatası:", error);
    }
}

function saatKontrolu(kullaniciAdi) {
    const suAn = new Date();
    const saat = suAn.getHours();
    const mesajAlani = document.getElementById('mesaj-yazma-alani');

    // 09:00 - 22:00 arası yazılabilir
    if (saat >= 9 && saat < 22) {
        mesajAlani.innerHTML = `
            <textarea id="yeni-mesaj" placeholder="Mesajınızı buraya yazın..." style="width:100%; height:80px; padding:10px; border-radius:8px; border:1px solid #ccc;"></textarea>
            <button class="btn btn-main" onclick="mesajGonder('${kullaniciAdi}')">Gönder</button>
        `;
    } else {
        mesajAlani.innerHTML = `<p style="color:#e74c3c; font-weight:bold; background:#ffebee; padding:10px; border-radius:8px;">
            ⚠️ Forum 22:00 - 09:00 saatleri arasında mesaj alımına kapalıdır.
        </p>`;
    }
}

function mesajGonder(isim) {
    const mesajText = document.getElementById('yeni-mesaj').value;
    if (mesajText.length < 5) {
        alert("Mesaj çok kısa.");
        return;
    }

    // Google Form yönlendirmesi
    const formUrl = "https://docs.google.com/forms/d/e/FORM_ID/viewform?entry.1= " + encodeURIComponent(isim) + "&entry.2=" + encodeURIComponent(mesajText);
    window.open(formUrl, '_blank');
    alert("Mesajınız yönetici onayına gönderildi.");
}
