import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase Yapılandırması
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

// HTML Elemanları
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
const authLink = document.getElementById("authLink");

// Emoji Paneli Elemanları
const emojiToggleBtn = document.getElementById("emojiToggleBtn");
const emojiPicker = document.getElementById("emojiPicker");

let activePhotoId = null;
let currentImageUrls = []; 
let currentImageIndex = 0; 
let currentUser = null;
let activePhotoData = null; // Aktif fotoğrafın tüm verilerini tutmak için

// Kullanıcı oturum durumunu takip et
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user && authLink) {
        authLink.innerText = `${user.email.split('@')[0]} (Çıkış Yap)`;
        authLink.href = "#";
        authLink.onclick = (e) => {
            e.preventDefault();
            signOut(auth).then(() => { 
                alert("Çıkış yapıldı"); 
                location.reload(); 
            });
        };
    } else if (authLink) {
        authLink.innerText = "Giriş Yap / Üye Ol";
        authLink.href = "giris.html";
        authLink.onclick = null;
    }
});

// Sayfa açıldığında fotoğrafları Firebase'den çek
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
            
            const imageUrls = data.imageUrls || (data.imageUrl ? [data.imageUrl] : []);
            if (imageUrls.length === 0) return;

            const coverImage = imageUrls[0]; 
            const desc = data.description || "Açıklama girilmemiş.";
            const likesCount = data.likes || 0;
            const commentsCount = data.comments ? data.comments.length : 0;

            const itemDiv = document.createElement("div");
            itemDiv.className = "gallery-item";
            
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
                openModal(photoId, data);
            });

            galleryGrid.appendChild(itemDiv);
        });

    } catch (error) {
        console.error("Arşiv yüklenirken hata oluştu:", error);
        galleryGrid.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: red;">Fotoğraflar yüklenirken bir hata oluştu.</p>`;
    }
}

// Modalı açma fonksiyonu
function openModal(id, data) {
    activePhotoId = id;
    activePhotoData = data;
    currentImageUrls = data.imageUrls || (data.imageUrl ? [data.imageUrl] : []);
    currentImageIndex = 0; 
    
    modal.style.display = "flex";
    updateModalImage();
    
    modalDesc.innerHTML = `<p>${data.description || "Açıklama girilmemiş."}</p>`;
    modalLikes.innerText = data.likes || 0;
    
    // Kullanıcı bu fotoğrafı daha önce beğendiyse kalp butonunun stilini güncelle
    updateLikeButtonState(data);

    renderComments(data.comments || []);
    document.body.style.overflow = "hidden";
}

// Beğeni butonunun aktif/pasif görünümünü ayarlayan fonksiyon
function updateLikeButtonState(data) {
    const likedUsers = data.likedUsers || [];
    if (currentUser && likedUsers.includes(currentUser.uid)) {
        modalLikeBtn.style.color = "#ff3b30"; // Beğenilmişse kırmızı yap
        modalLikeBtn.style.fontWeight = "bold";
    } else {
        modalLikeBtn.style.color = "inherit";
        modalLikeBtn.style.fontWeight = "normal";
    }
}

// Görsel değiştirme (Sağa sola oklar)
window.changeSlide = function(direction) {
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) {
        currentImageIndex = currentImageUrls.length - 1; 
    } else if (currentImageIndex >= currentImageUrls.length) {
        currentImageIndex = 0; 
    }
    
    updateModalImage();
}

function updateModalImage() {
    modalImg.src = currentImageUrls[currentImageIndex];
    
    if (currentImageUrls.length > 1) {
        prevBtn.style.display = "block";
        nextBtn.style.display = "block";
    } else {
        prevBtn.style.display = "none";
        nextBtn.style.display = "none";
    }
}

// Yorumları ekrana basma
function renderComments(comments) {
    commentList.innerHTML = "";
    if (!comments || comments.length === 0) {
        commentList.innerHTML = `<p style="color: #888; font-style: italic;">İlk yorumu sen yaz!</p>`;
        return;
    }
    comments.forEach(c => {
        renderSingleComment(c);
    });
}

function renderSingleComment(c) {
    const p = document.createElement("p");
    const username = c.user ? c.user : "Ziyaretçi";
    const text = c.text ? c.text : c;
    
    p.innerHTML = `<strong>${username}:</strong> ${text}`;
    if (commentList.querySelector("p style")) {
        commentList.innerHTML = "";
    }
    commentList.appendChild(p);
}

// Beğeni Butonu İşlevi (Üye Kontrollü & Tek Seferlik)
modalLikeBtn.onclick = async () => {
    if (!currentUser) {
        alert("Fotoğrafları beğenebilmek için önce giriş yapmalısınız!");
        window.location.href = "giris.html";
        return;
    }

    if (!activePhotoId || !activePhotoData) return;

    const photoRef = doc(db, "fotograflar", activePhotoId);
    const likedUsers = activePhotoData.likedUsers || [];
    const hasLiked = likedUsers.includes(currentUser.uid);

    try {
        if (hasLiked) {
            // Zaten beğenmişse beğeniyi geri al (Toggle özelliği)
            await updateDoc(photoRef, {
                likes: increment(-1),
                likedUsers: arrayRemove(currentUser.uid)
            });
            activePhotoData.likes = (activePhotoData.likes || 1) - 1;
            activePhotoData.likedUsers = likedUsers.filter(uid => uid !== currentUser.uid);
            
            modalLikes.innerText = activePhotoData.likes;
            modalLikeBtn.style.color = "inherit";
            modalLikeBtn.style.fontWeight = "normal";
        } else {
            // İlk kez beğeniyorsa ekle
            await updateDoc(photoRef, {
                likes: increment(1),
                likedUsers: arrayUnion(currentUser.uid)
            });
            if (!activePhotoData.likedUsers) activePhotoData.likedUsers = [];
            activePhotoData.likedUsers.push(currentUser.uid);
            activePhotoData.likes = (activePhotoData.likes || 0) + 1;

            modalLikes.innerText = activePhotoData.likes;
            modalLikeBtn.style.color = "#ff3b30";
            modalLikeBtn.style.fontWeight = "bold";
        }
    } catch (e) { 
        console.error("Beğeni güncellenirken hata oluştu:", e); 
    }
};

// Yorum Gönderme İşlevi
sendCommentBtn.onclick = async () => {
    if (!currentUser) {
        alert("Yorum yapmak için önce giriş yapmalısınız!");
        window.location.href = "giris.html";
        return;
    }

    const commentText = commentInputText.value.trim();
    if (!commentText || !activePhotoId) return;

    const commentObject = {
        user: currentUser.email.split('@')[0],
        text: commentText
    };

    try {
        const photoRef = doc(db, "fotograflar", activePhotoId);
        await updateDoc(photoRef, {
            comments: arrayUnion(commentObject)
        });

        if (!activePhotoData.comments) activePhotoData.comments = [];
        activePhotoData.comments.push(commentObject);

        renderSingleComment(commentObject);
        commentInputText.value = "";
        
        // Emoji panelini gönderim sonrası kapat
        if (emojiPicker) emojiPicker.style.display = "none";
    } catch (e) {
        console.error("Yorum ekleme hatası:", e);
    }
};

// Emoji Paneli Açma / Kapatma İşlemleri
if (emojiToggleBtn && emojiPicker) {
    emojiToggleBtn.onclick = (e) => {
        e.stopPropagation();
        if (emojiPicker.style.display === "flex") {
            emojiPicker.style.display = "none";
        } else {
            emojiPicker.style.display = "flex";
        }
    };

    // Sayfada başka bir yere tıklandığında paneli kapat
    document.addEventListener("click", (e) => {
        if (!emojiPicker.contains(e.target) && e.target !== emojiToggleBtn) {
            emojiPicker.style.display = "none";
        }
    });
}

// Seçilen Emlojiye Göre Metin Kutusuna Ekleme
window.addEmoji = function(emoji) {
    const start = commentInputText.selectionStart;
    const end = commentInputText.selectionEnd;
    const text = commentInputText.value;
    
    commentInputText.value = text.substring(0, start) + emoji + text.substring(end);
    commentInputText.focus();
    commentInputText.setSelectionRange(start + emoji.length, start + emoji.length);
}

// Modalı Kapatma
window.closeModal = function() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    activePhotoId = null;
    activePhotoData = null;
    if (emojiPicker) emojiPicker.style.display = "none";
    loadGallery(); 
}

window.onclick = function(event) {
    if (event.target == modal) {
        window.closeModal();
    }
}

// Sayfa yüklendiğinde galeriyi çalıştır
loadGallery();
