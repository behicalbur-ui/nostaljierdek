import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Kendi Firebase bilgilerini buraya girdiğinden emin ol
const firebaseConfig = {
  apiKey: "AIzaSyBAiG08P8M_a6yaAAhJbYMCUqVPmn7KVE4",
  authDomain: "nostaljierdek-60f5b.firebaseapp.com",
  projectId: "nostaljierdek-60f5b",
  storageBucket: "nostaljierdek-60f5b.firebasestorage.app",
  messagingSenderId: "671939663155",
  appId: "1:671939663155:web:a01245b5a353b1f35e5a46"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Sayfa yüklendiğinde çalışır ve sağ üstteki butonu ayarlar
document.addEventListener("DOMContentLoaded", () => {
    const authLink = document.getElementById("authLink");
    
    onAuthStateChanged(auth, (user) => {
        if (!authLink) return;

        if (user) {
            // Kullanıcı giriş yapmışsa ismi yaz ve çıkış yapma özelliği ver
            const userName = user.email ? user.email.split('@')[0] : "Kullanıcı";
            authLink.innerText = `${userName} (Çıkış Yap)`;
            authLink.href = "#";
            authLink.onclick = (e) => {
                e.preventDefault();
                signOut(auth).then(() => { 
                    alert("Çıkış yapıldı"); 
                    location.href = "index.html"; 
                });
            };
        } else {
            // Giriş yapılmamışsa
            authLink.innerText = "Giriş Yap / Üye Ol";
            authLink.href = "giris.html";
            authLink.onclick = null;
        }
    });
});
