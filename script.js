async function girisYap() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();

    try {
        const response = await fetch('./veriler.json?v=' + Math.random());
        const data = await response.json();
        const user = data.daireler.find(d => d.username === u && d.password === p);

        if (user) {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-panel').style.display = 'block';
            
            // Borç bilgilerini hemen yazdır
            document.getElementById('welcome-msg').innerText = `Sn. ${user.sahibi}`;
            document.getElementById('aidat').innerText = user.aidatBorcu + " TL";
            document.getElementById('yakit').innerText = user.yakitBorcu + " TL";
            document.getElementById('diger').innerText = user.digerBorc + " TL";
            
            // Forum ve Duyuruları getir
            forumYukle(user.sahibi);
        } else {
            alert("Hatalı giriş!");
        }
    } catch (e) {
        alert("Sistem hatası: Veriler okunamadı.");
    }
}

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
        console.error("Forum dosyası bulunamadı.");
    }
}

function saatKontrolu(kisi) {
    const saat = new Date().getHours();
    const alan = document.getElementById('mesaj-yazma-alani');
    
    if (saat >= 9 && saat < 22) {
        alan.innerHTML = `
            <textarea id="msg-text" placeholder="Mesajınızı yazın..."></textarea>
            <button class="btn btn-primary" onclick="mesajGonder('${kisi}')">Gönder</button>`;
    } else {
        alan.innerHTML = `<div class="time-badge">⚠️ Mesaj sistemi 09:00 - 22:00 arası aktiftir.</div>`;
    }
}

function mesajGonder(kisi) {
    const txt = document.getElementById('msg-text').value;
    if(txt.length < 5) return alert("Lütfen biraz daha detay yazın.");
    
    // Google Form yönlendirmesi (Buraya kendi Form linkini koymalısın)
    const formUrl = `https://docs.google.com/forms/d/e/FORM_ID/viewform?entry.1=${encodeURIComponent(kisi)}&entry.2=${encodeURIComponent(txt)}`;
    window.open(formUrl, '_blank');
}
