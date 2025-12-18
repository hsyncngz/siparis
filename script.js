async function verileriGetir() {
    try {
        const response = await fetch('./veriler.json?v=' + Math.random());
        return await response.json();
    } catch (error) {
        console.error("Veri hatası:", error);
        return null;
    }
}

async function girisYap() {
    const userInp = document.getElementById('username').value.trim();
    const passInp = document.getElementById('password').value.trim();
    
    const data = await verileriGetir();
    if (!data) return;

    const user = data.daireler.find(d => d.username === userInp && d.password === passInp);

    if (user) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-panel').style.display = 'block';
        panelDoldur(user, data);
    } else {
        alert("Hatalı kullanıcı adı veya şifre!");
    }
}

function panelDoldur(user, data) {
    // Borç Bilgileri
    document.getElementById('welcome-name').innerText = `Sn. ${user.sahibi}`;
    document.getElementById('aidat').innerText = user.aidatBorcu + " TL";
    document.getElementById('yakit').innerText = user.yakitBorcu + " TL";
    document.getElementById('diger').innerText = user.digerBorc + " TL";

    // Forum Listesi
    const forumList = document.getElementById('forum-list');
    forumList.innerHTML = "";
    data.forumMesajlari.forEach(m => {
        forumList.innerHTML += `<div class="forum-msg"><strong>${m.kisi}:</strong> ${m.mesaj} <br><small>${m.tarih}</small></div>`;
    });

    // Mesaj Yazma Saat Kontrolü (09:00 - 22:00)
    const su an = new Date();
    const saat = su an.getHours();
    const mesajAlani = document.getElementById('mesaj-yazma-alani');

    if (saat >= 9 && saat < 22) {
        mesajAlani.innerHTML = `
            <textarea id="yeni-mesaj" placeholder="Yönetime veya foruma iletmek istediğiniz mesajı yazın..." style="width:100%; height:80px; margin-top:10px;"></textarea>
            <button class="btn btn-main" onclick="mesajGonder('${user.sahibi}')">Mesajı İlet</button>
        `;
    } else {
        mesajAlani.innerHTML = `<p style="color:red; font-size:0.9em; font-weight:bold;">⚠️ Forum saat 22:00'den sonra mesaj alımına kapanmaktadır. Sabah 09:00'da tekrar açılacaktır.</p>`;
    }
}

function mesajGonder(isim) {
    const mesaj = document.getElementById('yeni-mesaj').value;
    if(mesaj.length < 5) {
        alert("Lütfen geçerli bir mesaj yazın.");
        return;
    }
    
    // GitHub statik olduğu için burası doğrudan JSON'u değiştiremez.
    // Sakini bir Google Form'a yönlendirmek en sağlıklı çözümdür:
    const formLink = "https://docs.google.com/forms/d/e/FORUM_ID_BURAYA/viewform?entry.12345=" + encodeURIComponent(isim + ": " + mesaj);
    window.open(formLink, '_blank');
    alert("Mesajınız iletilmek üzere Google Formlar'a yönlendiriliyor. Onaylandığında forumda yayınlanacaktır.");
}
