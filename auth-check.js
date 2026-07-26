import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// !!! Kendi Firebase bilgilerini buraya yaz !!!
const firebaseConfig = {
  apiKey: "SENIN_API_KEY_BURAYA",
  authDomain: "nostalji-erdek.firebaseapp.com",
  projectId: "nostalji-erdek",
  storageBucket: "nostalji-erdek.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456:web:abcd123"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Sayfa yüklendiğinde tüm sayfalardaki authLink'leri kontrol et
document.addEventListener("DOMContentLoaded", () => {
    const authLink = document.getElementById("authLink");
    if (!authLink) return;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            authLink.innerText = `${user.email.split('@')[0]} (Çıkış Yap)`;
            authLink.href = "#";
            authLink.onclick = (e) => {
                e.preventDefault();
                signOut(auth).then(() => { 
                    alert("Çıkış yapıldı"); 
                    location.reload(); 
                });
            };
        } else {
            authLink.innerText = "Giriş Yap / Üye Ol";
            authLink.href = "giris.html";
            authLink.onclick = null;
        }
    });
});
