async function girisYap() {
    const userInp = document.getElementById('username').value;
    const passInp = document.getElementById('password').value;

    try {
        // JSON dosyasını okuyoruz
        const response = await fetch('veriler.json');
        const data = await response.json();

        // Kullanıcıyı buluyoruz
        const user = data.users.find(u => u.username === userInp && u.password === passInp);

        if (user) {
            // Başarılı giriş
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            
            document.getElementById('welcome-msg').innerText = `Hoş geldin, ${user.name}!`;
            document.getElementById('user-data').innerText = user.privateData;
        } else {
            alert("Hatalı kullanıcı adı veya şifre!");
        }
    } catch (error) {
        console.error("Veri okuma hatası:", error);
    }
}

function cikisYap() {
    location.reload(); // Sayfayı yenileyerek oturumu kapatır
}