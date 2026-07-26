import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// !!! Kendi Firebase bilgilerini buraya yaz !!!
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
