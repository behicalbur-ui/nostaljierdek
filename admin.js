import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBAiG08P8M_a6yaAAhJbYMCUqVPmn7KVE4",
  authDomain: "nostaljierdek-60f5b.firebaseapp.com",
  projectId: "nostaljierdek-60f5b",
  storageBucket: "nostaljierdek-60f5b.firebasestorage.app",
  messagingSenderId: "671939663155",
  appId: "1:671939663155:web:a01245b5a353b1f35e5a46"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// !!! BURAYA KENDİ E-POSTA ADRESİNİ YAZ (Yönetici e-postası) !!!
const ADMIN_EMAIL = "behicalbur@gmail.com"; 

const authCheckScreen = document.getElementById("authCheckScreen");
const adminPanelContent = document.getElementById("adminPanelContent");

// Oturum ve Yetki Kontrolü
onAuthStateChanged(auth, (user) => {
    if (!user) {
        alert("Yönetim paneline erişmek için önce giriş yapmalısınız!");
        window.location.href = "giris.html";
        return;
    }

    if (user.email !== ADMIN_EMAIL) {
        alert("Bu sayfaya erişim yetkiniz yok!");
        window.location.href = "arsiv.html";
        return;
    }

    // Eğer giriş yapan kişi admin ise ekranı göster ve verileri yükle
    authCheckScreen.style.display = "none";
    adminPanelContent.classList.remove("hidden-admin");
    loadAdminPosts();
});

const cloudName = "uxk86ov1"; 
const uploadPreset = "nostalji-erdek";

const uploadBtn = document.getElementById("uploadBtn");
const imageFilesInput = document.getElementById("imageFiles");
const imageDescInput = document.getElementById("imageDesc");
const statusMessage = document.getElementById("statusMessage");
const adminPostList = document.getElementById("adminPostList");

// Gönderileri listeleme ve silme
async function loadAdminPosts() {
    try {
        const querySnapshot = await getDocs(collection(db, "fotograflar"));
        adminPostList.innerHTML = "";

        if (querySnapshot.empty) {
            adminPostList.innerHTML = "<p>Arşivde hiç gönderi yok.</p>";
            return;
        }

        querySnapshot.forEach((documentSnapshot) => {
            const data = documentSnapshot.data();
            const postId = documentSnapshot.id;
            const imageUrls = data.imageUrls || (data.imageUrl ? [data.imageUrl] : []);
            const coverImg = imageUrls[0] || "";
            const desc = data.description ? data.description.substring(0, 40) + "..." : "Açıklama yok";

            const postRow = document.createElement("div");
            postRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;";
            
            postRow.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${coverImg}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                    <span style="font-size: 0.9rem; color: #333;">${desc}</span>
                </div>
                <button data-id="${postId}" class="delete-post-btn" style="background: #ff4d4d; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Sil</button>
            `;

            postRow.querySelector(".delete-post-btn").addEventListener("click", async () => {
                if (confirm("Bu gönderiyi silmek istediğine emin misin?")) {
                    await deleteDoc(doc(db, "fotograflar", postId));
                    alert("Gönderi silindi!");
                    loadAdminPosts();
                }
            });

            adminPostList.appendChild(postRow);
        });
    } catch (e) {
        console.error("Hata:", e);
    }
}

// Fotoğraf Yükleme İşlemi
uploadBtn.addEventListener("click", async () => {
    const files = imageFilesInput.files;
    const desc = imageDescInput.value;

    if (files.length === 0) {
        alert("Lütfen en az bir fotoğraf seçin!");
        return;
    }

    try {
        uploadBtn.innerText = `Yükleniyor (0/${files.length})...`;
        uploadBtn.disabled = true;

        const imageUrls = [];
        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append("file", files[i]);
            formData.append("upload_preset", uploadPreset);

            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST", body: formData
            });
            const data = await res.json();
            imageUrls.push(data.secure_url);
            uploadBtn.innerText = `Yükleniyor (${i + 1}/${files.length})...`;
        }

        await addDoc(collection(db, "fotograflar"), {
            imageUrls: imageUrls,
            description: desc,
            likes: 0,
            comments: [],
            timestamp: serverTimestamp()
        });

        statusMessage.innerText = "Başarıyla arşive eklendi!";
        imageFilesInput.value = "";
        imageDescInput.value = "";
        loadAdminPosts();

    } catch (error) {
        alert("Yükleme sırasında hata oluştu.");
    } finally {
        uploadBtn.innerText = "Yükle ve Arşive Gönder";
        uploadBtn.disabled = false;
        setTimeout(() => { statusMessage.innerText = ""; }, 3000);
    }
});
