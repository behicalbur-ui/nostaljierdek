import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailAuthBtn = document.getElementById("emailAuthBtn");
const googleBtn = document.getElementById("googleBtn");
const toggleMode = document.getElementById("toggleMode");
const authTitle = document.getElementById("authTitle");

let isSignUp = false;

// Giriş / Kayıt modunu değiştirme
toggleMode.onclick = () => {
    isSignUp = !isSignUp;
    authTitle.innerText = isSignUp ? "Üye Ol" : "Giriş Yap";
    emailAuthBtn.innerText = isSignUp ? "Kayıt Ol" : "Giriş Yap";
    toggleMode.innerText = isSignUp ? "Zaten hesabın var mı? Giriş yap" : "Hesabın yok mu? Üye ol";
};

// E-posta ile giriş veya kayıt
emailAuthBtn.onclick = async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    try {
        if (isSignUp) {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Kayıt başarılı!");
        } else {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Giriş başarılı!");
        }
        window.location.href = "arsiv.html";
    } catch (error) {
        alert("Hata: " + error.message);
    }
};

// Google ile giriş
googleBtn.onclick = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        alert("Google ile giriş başarılı!");
        window.location.href = "arsiv.html";
    } catch (error) {
        alert("Google giriş hatası: " + error.message);
    }
};