import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, arrayUnion, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// !!! DİKKAT: BURAYA KİMLİK BİLGİLERİNİ YİNE GİR !!!
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

const galleryGrid = document.getElementById("galleryGrid");
const modal = document.getElementById("photoModal");
const modalImg = document.getElementById("modalImg");
const modalDesc = document.getElementById("modalDesc");
const modalLikes = document.getElementById("modalLikes");
const modalLikeBtn = document.getElementById("modalLikeBtn");
const commentList = document.getElementById("commentList");
const commentInputText = document.getElementById("commentInputText");
const sendCommentBtn = document.getElementById("sendCommentBtn");

let activePhotoId = null; // Şu an açık olan fotoğrafın ID'si

// Sayfa açıldığında fotoğrafları Firebase'den çek
async function loadGallery() {
    try {
        const querySnapshot = await getDocs(collection(db, "fotograflar"));
        galleryGrid.innerHTML = ""; // "Yükleniyor..." yazısını temizle

        if (querySnapshot.empty) {
            galleryGrid.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; padding: 40px; color: #666;">Henüz arşive fotoğraf eklenmemiş.</p>`;
            return;
        }

        querySnapshot.forEach((documentSnapshot) => {
            const data = documentSnapshot.data();
            const photoId = documentSnapshot.id;
            const imageUrl = data.imageUrl || "";
            const desc = data.description || "Açıklama girilmemiş.";
            const likesCount = data.likes || 0;
            const commentsCount = data.comments ? data.comments.length : 0;

            // Her fotoğraf için bir HTML kutusu oluştur
            const itemDiv = document.createElement("div");
            itemDiv.className = "gallery-item";
            itemDiv.innerHTML = `
                <img src="${imageUrl}" alt="Erdek Tarihi">
                <div class="item-overlay">
                    <span>❤️ ${likesCount}</span>
                    <span>💬 ${commentsCount}</span>
                </div>
            `;

            // Fotoğrafa tıklandığında modalı aç
            itemDiv.addEventListener("click", () => {
                openModal(photoId, imageUrl, desc, likesCount, data.comments || []);
            });

            galleryGrid.appendChild(itemDiv);
        });

    } catch (error) {
        console.error("Arşiv yüklenirken hata oluştu:", error);
        galleryGrid.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: red;">Fotoğraflar yüklenirken bir hata oluştu.</p>`;
    }
}

// Modalı açma fonksiyonu
function openModal(id, imageUrl, description, likes, comments) {
    activePhotoId = id;
    modal.style.display = "flex";
    modalImg.src = imageUrl;
    modalDesc.innerText = description;
    modalLikes.innerText = likes;
    
    // Yorumları listele
    renderComments(comments);
    document.body.style.overflow = "hidden";
}

// Yorumları ekrana basma
function renderComments(comments) {
    commentList.innerHTML = "";
    if (comments.length === 0) {
        commentList.innerHTML = `<p style="color: #888; font-style: italic;">İlk yorumu sen yaz!</p>`;
        return;
    }
    comments.forEach(c => {
        const p = document.createElement("p");
        p.innerHTML = `<strong>Ziyaretçi:</strong> ${c}`;
        commentList.appendChild(p);
    });
}

// Beğeni Butonu İşlevi
modalLikeBtn.onclick = async () => {
    if (!activePhotoId) return;
    try {
        const photoRef = doc(db, "fotograflar", activePhotoId);
        await updateDoc(photoRef, {
            likes: increment(1)
        });
        
        // Ekranda sayıyı artır
        const currentLikes = parseInt(modalLikes.innerText) || 0;
        modalLikes.innerText = currentLikes + 1;
    } catch (e) {
        console.error("Beğeni hatası:", e);
    }
};

// Yorum Gönderme İşlevi
sendCommentBtn.onclick = async () => {
    const commentText = commentInputText.value.trim();
    if (!commentText || !activePhotoId) return;

    try {
        const photoRef = doc(db, "fotograflar", activePhotoId);
        await updateDoc(photoRef, {
            comments: arrayUnion(commentText)
        });

        // Arayüze hemen ekle
        const p = document.createElement("p");
        p.innerHTML = `<strong>Ziyaretçi:</strong> ${commentText}`;
        if (commentList.querySelector("p style")) {
            commentList.innerHTML = ""; // "İlk yorumu sen yaz" yazısını sil
        }
        commentList.appendChild(p);
        commentInputText.value = "";
    } catch (e) {
        console.error("Yorum ekleme hatası:", e);
    }
};

// Modalı Kapatma
window.closeModal = function() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    activePhotoId = null;
    loadGallery(); // Kapatıldığında beğenileri/yorumları güncellemek için arşivi tazele
}

window.onclick = function(event) {
    if (event.target == modal) {
        window.closeModal();
    }
}

// Sayfa yüklendiğinde galeriyi çalıştır
loadGallery();