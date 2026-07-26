// Modal elemanlarını seçiyoruz
const modal = document.getElementById("photoModal");
const modalImg = document.getElementById("modalImg");
const modalDesc = document.getElementById("modalDesc");
const modalLikes = document.getElementById("modalLikes");

// Fotoğrafa tıklandığında pencereyi açan fonksiyon
function openModal(imageSrc, description, likes) {
    modal.style.display = "flex";
    modalImg.src = imageSrc;
    modalDesc.innerText = description;
    modalLikes.innerText = likes;
    
    // Arkadaki sayfanın kaymasını engelle
    document.body.style.overflow = "hidden";
}

// Çarpıya basıldığında pencereyi kapatan fonksiyon
function closeModal() {
    modal.style.display = "none";
    
    // Sayfanın tekrar kaydırılabilmesini sağla
    document.body.style.overflow = "auto";
}

// Pencerenin dışındaki siyah alana tıklanınca da kapat
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}