import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const cloudName = "uxk86ov1"; 
const uploadPreset = "nostalji-erdek";

const uploadBtn = document.getElementById("uploadBtn");
const imageFilesInput = document.getElementById("imageFiles"); // ID'yi güncelledik
const imageDescInput = document.getElementById("imageDesc");
const statusMessage = document.getElementById("statusMessage");

uploadBtn.addEventListener("click", async () => {
    const files = imageFilesInput.files;
    const desc = imageDescInput.value;

    if (files.length === 0) {
        alert("Lütfen en az bir fotoğraf seçin!");
        return;
    }

    try {
        uploadBtn.innerText = `Fotoğraflar yükleniyor (0/${files.length})...`;
        uploadBtn.disabled = true;

        const imageUrls = [];

        // Seçilen her bir fotoğrafı döngüye sokup Cloudinary'ye yüklüyoruz
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", uploadPreset);

            const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: formData
            });
            
            const cloudinaryData = await cloudinaryResponse.json();
            imageUrls.push(cloudinaryData.secure_url); // Linki listeye ekle
            
            uploadBtn.innerText = `Yükleniyor (${i + 1}/${files.length})...`;
        }

        uploadBtn.innerText = "Veritabanına Kaydediliyor...";

        // Tüm fotoğrafların linklerini içeren diziyi (imageUrls) tek bir gönderi olarak Firestore'a kaydet
        await addDoc(collection(db, "fotograflar"), {
            imageUrls: imageUrls, // Artık tek bir string yerine resimler dizisi kaydediyoruz
            description: desc,
            likes: 0,
            timestamp: serverTimestamp()
        });

        statusMessage.innerText = "Albüm başarıyla arşive eklendi!";
        imageFilesInput.value = "";
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
