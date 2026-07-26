// Sadece Firestore'u çağırıyoruz (Storage'ı sildik)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// !!! DİKKAT: BURAYA KENDİ FİREBASE BİLGİLERİNİ GİR !!!
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

// !!! DİKKAT: CLOUDINARY BİLGİLERİNİ BURAYA GİR !!!
const cloudName = "uxk86ov1"; 
const uploadPreset = "nostalji-erdek"; // Unsigned olarak ayarladığın preset adı

// HTML Elemanları
const uploadBtn = document.getElementById("uploadBtn");
const imageFileInput = document.getElementById("imageFile");
const imageDescInput = document.getElementById("imageDesc");
const statusMessage = document.getElementById("statusMessage");

uploadBtn.addEventListener("click", async () => {
    const file = imageFileInput.files[0];
    const desc = imageDescInput.value;

    if (!file) {
        alert("Lütfen önce bir fotoğraf seçin!");
        return;
    }

    try {
        uploadBtn.innerText = "Cloudinary'ye Yükleniyor...";
        uploadBtn.disabled = true;

        // 1. Fotoğrafı Cloudinary'ye Yükle
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        // Cloudinary API'sine resmi gönderiyoruz
        const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData
        });
        
        const cloudinaryData = await cloudinaryResponse.json();
        
        // 2. Güvenli Görsel Linkini Al (Otomatik optimize edilmiş URL)
        const imageUrl = cloudinaryData.secure_url;

        uploadBtn.innerText = "Veritabanına Kaydediliyor...";

        // 3. Linki ve açıklamayı Firestore veritabanına kaydet
        await addDoc(collection(db, "fotograflar"), {
            imageUrl: imageUrl,
            description: desc,
            likes: 0,
            timestamp: serverTimestamp()
        });

        statusMessage.innerText = "Fotoğraf başarıyla Cloudinary'ye ve Arşive eklendi!";
        imageFileInput.value = "";
        imageDescInput.value = "";

    } catch (error) {
        console.error("Hata:", error);
        alert("Bir hata oluştu. Lütfen konsolu kontrol edin.");
    } finally {
        uploadBtn.innerText = "Yükle ve Arşive Gönder";
        uploadBtn.disabled = false;
        setTimeout(() => { statusMessage.innerText = ""; }, 3000);
    }
});