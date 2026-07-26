import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

document.addEventListener("DOMContentLoaded", () => {
    const authLink = document.getElementById("authLink");
    if (!authLink) return;

    // Önce tarayıcı belleğine hızlıca bak (Sayfa geçişlerinde anında gösterir)
    const cachedEmail = sessionStorage.getItem("userEmail");
    if (cachedEmail) {
        const name = cachedEmail.split('@')[0];
        authLink.innerText = `${name} (Çıkış Yap)`;
        authLink.href = "#";
        authLink.onclick = (e) => {
            e.preventDefault();
            signOut(auth).then(() => {
                sessionStorage.removeItem("userEmail");
                alert("Çıkış yapıldı");
                location.href = "index.html";
            });
        };
    }

    // Firebase'in kendi ana kontrolü ile doğrula
    onAuthStateChanged(auth, (user) => {
        if (user) {
            sessionStorage.setItem("userEmail", user.email);
            const name = user.email.split('@')[0];
            authLink.innerText = `${name} (Çıkış Yap)`;
            authLink.href = "#";
            authLink.onclick = (e) => {
                e.preventDefault();
                signOut(auth).then(() => {
                    sessionStorage.removeItem("userEmail");
                    alert("Çıkış yapıldı");
                    location.href = "index.html";
                });
            };
        } else {
            sessionStorage.removeItem("userEmail");
            authLink.innerText = "Giriş Yap / Üye Ol";
            authLink.href = "giris.html";
            authLink.onclick = null;
        }
    });
});
