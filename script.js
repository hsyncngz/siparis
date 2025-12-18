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
            verileriYukle(user);
        } else {
            alert("Kullanıcı adı veya şifre hatalı!");
        }
    } catch (e) {
        alert("Bağlantı hatası!");
    }
}

async function verileriYukle(user) {
    // Kişisel bilgiler
    document.getElementById('welcome-msg').innerText = `Sn. ${user.sahibi} (Daire ${user.daireNo})`;
    document.getElementById('aidat').innerText = user.aidatBorcu + " TL";
    document.getElementById('yakit').innerText = user.yakitBorcu + " TL";
    document.getElementById('diger').innerText = user.digerBorc + " TL";

    try {
        const res = await fetch('./forum.json?v=' + Math.random());
        const forumData = await res.json();

        // Duyurular
        const dDiv = document.getElementById('duyuru-alani');
        dDiv.innerHTML = "";
        forumData.duyurular.forEach(msg => {
            dDiv.innerHTML += `<div class="announcement">📢 ${msg}</div>`;
        });

        // Forum Mesajları
        const fList = document.getElementById('forum-list');
        fList.innerHTML = "";
        forumData.mesajlar.reverse().forEach(m => { // En yeni mesaj en üstte
            fList.innerHTML += `
                <div class="forum-item">
                    <strong>${m.kisi}</strong>
                    <div>${m.mesaj}</div>
                    <small>${m.tarih}</small>
                </div>`;
        });

        saatKontrolu(user.sahibi);
    } catch (e) {
        console.log("Forum verisi çekilemedi.");
    }
}

function saatKontrolu(kisi) {
    const saat = new Date().getHours();
    const alan = document.getElementById('mesaj-yazma-alani');
    
    // 09:00 - 22:00 Arası Açık
    if (saat >= 9 && saat < 22) {
        alan.innerHTML = `
            <textarea id="msg-text" placeholder="Mesajınızı buraya yazın..."></textarea>
            <button class="btn btn-primary" style="margin-top:10px" onclick="mesajGonder('${kisi}')">Mesaj Gönder</button>
        `;
    } else {
        alan.innerHTML = `<div class="time-badge">⚠️ Forum 22:00 - 09:00 arası mesajlara kapalıdır.</div>`;
    }
}

function mesajGonder(kisi) {
    const txt = document.getElementById('msg-text').value;
    if(txt.length < 5) return alert("Lütfen daha uzun bir mesaj yazın.");
    
    // Statik sistemde mesaj doğrudan dosyaya yazılamaz, Google Form linki üretilir.
    const formUrl = "https://docs.google.com/forms/d/e/FORM_ID_BURAYA/viewform?entry.1=" + encodeURIComponent(kisi) + "&entry.2=" + encodeURIComponent(txt);
    window.open(formUrl, '_blank');
    alert("Mesajınız yönetici onayına iletildi.");
}
