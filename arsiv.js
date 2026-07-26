import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, arrayUnion, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let activePhotoId = null;
let currentImageUrls = []; // Aktif gönderideki tüm fotoğrafların listesi
let currentImageIndex = 0; // Şu an ekranda görünen fotoğrafın sırası

async function loadGallery() {
    try {
        const querySnapshot = await getDocs(collection(db, "fotograflar"));
        galleryGrid.innerHTML = "";

        if (querySnapshot.empty) {
            galleryGrid.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; padding: 40px; color: #666;">Henüz arşive fotoğraf eklenmemiş.</p>`;
            return;
        }

        querySnapshot.forEach((documentSnapshot) => {
            const data = documentSnapshot.data();
            const photoId = documentSnapshot.id;
            
            // Eski tekil resimlerle uyumlu olması için kontrol (Geriye dönük uyumluluk)
            const imageUrls = data.imageUrls || (data.imageUrl ? [data.imageUrl] : []);
            if (imageUrls.length === 0) return;

            const coverImage = imageUrls[0]; // Kapak için ilk fotoğraf
            const desc = data.description || "Açıklama girilmemiş.";
            const likesCount = data.likes || 0;
            const commentsCount = data.comments ? data.comments.length : 0;

            const itemDiv = document.createElement("div");
            itemDiv.className = "gallery-item";
            
            // Eğer birden fazla fotoğraf varsa köşeye albüm simgesi koy
            let badgeHtml = imageUrls.length > 1 ? `<div class="album-badge">📑 ${imageUrls.length}</div>` : "";

            itemDiv.innerHTML = `
                <img src="${coverImage}" alt="Erdek Tarihi">
                ${badgeHtml}
                <div class="item-overlay">
                    <span>❤️ ${likesCount}</span>
                    <span>💬 ${commentsCount}</span>
                </div>
            `;

            itemDiv.addEventListener("click", () => {
                openModal(photoId, imageUrls, desc, likesCount, data.comments || []);
            });

            galleryGrid.appendChild(itemDiv);
        });

    } catch (error) {
        console.error("Arşiv yüklenirken hata oluştu:", error);
        galleryGrid.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: red;">Fotoğraflar yüklenirken bir hata oluştu.</p>`;
    }
}

function openModal(id, imageUrls, description, likes, comments) {
    activePhotoId = id;
    currentImageUrls = imageUrls;
    currentImageIndex = 0; // Her açıldığında ilk fotoğraftan başla
    
    modal.style.display = "flex";
    updateModalImage();
    
    modalDesc.innerText = description;
    modalLikes.innerText = likes;
    renderComments(comments);
    document.body.style.overflow = "hidden";
}

// Görsel değiştirme (Sağa sola oklar)
window.changeSlide = function(direction) {
    currentImageIndex += direction;
    
    // Sınır kontrolü (Döngüsel veya sabit)
    if (currentImageIndex < 0) {
        currentImageIndex = currentImageUrls.length - 1; // En son fotoğrafa git
    } else if (currentImageIndex >= currentImageUrls.length) {
        currentImageIndex = 0; // Başa dön
    }
    
    updateModalImage();
}

function updateModalImage() {
    modalImg.src = currentImageUrls[currentImageIndex];
    
    // Eğer sadece 1 fotoğraf varsa okları gizle, birden fazla varsa göster
    if (currentImageUrls.length > 1) {
        prevBtn.style.display = "block";
        nextBtn.style.display = "block";
    } else {
        prevBtn.style.display = "none";
        nextBtn.style.display = "none";
    }
}

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

modalLikeBtn.onclick = async () => {
    if (!activePhotoId) return;
    try {
        const photoRef = doc(db, "fotograflar", activePhotoId);
        await updateDoc(photoRef, { likes: increment(1) });
        modalLikes.innerText = parseInt(modalLikes.innerText) + 1;
    } catch (e) { console.error("Beğeni hatası:", e); }
};

sendCommentBtn.onclick = async () => {
    const commentText = commentInputText.value.trim();
    if (!commentText || !activePhotoId) return;

    try {
        const photoRef = doc(db, "fotograflar", activePhotoId);
        await updateDoc(photoRef, { comments: arrayUnion(commentText) });

        const p = document.createElement("p");
        p.innerHTML = `<strong>Ziyaretçi:</strong> ${commentText}`;
        if (commentList.querySelector("p style")) {
            commentList.innerHTML = "";
        }
        commentList.appendChild(p);
        commentInputText.value = "";
    } catch (e) { console.error("Yorum hatası:", e); }
};

window.closeModal = function() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    activePhotoId = null;
    loadGallery();
}

window.onclick = function(event) {
    if (event.target == modal) {
        window.closeModal();
    }
}

loadGallery();
