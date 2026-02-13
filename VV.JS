// ==================== 1. ຕັ້ງຄ່າຂໍ້ມູນ ====================
const CONFIG = {
    passcode: "1402",
    startDate: "2026-01-31", // ວັນທີ່ເລີ່ມຄົບ
    photos: [
        "cc1.jpeg",
        "cc2.jpeg",
        "cc3.jpeg",
        "cc4.jpeg"
    ]
};

// ==================== 2. Background Hearts ====================
const cvs = document.getElementById('heart-canvas');
const ctx = cvs.getContext('2d');
cvs.width = window.innerWidth; cvs.height = window.innerHeight;
let hearts = [];
class Heart {
    constructor() { this.x = Math.random() * cvs.width; this.y = cvs.height + Math.random() * 100; this.size = Math.random() * 15 + 5; this.speed = Math.random() * 2 + 1; this.opacity = Math.random() * 0.5 + 0.3; }
    update() { this.y -= this.speed; if (this.y < -50) this.y = cvs.height + 50; }
    draw() { ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`; ctx.font = `${this.size}px Arial`; ctx.fillText("❤️", this.x, this.y); }
}
for (let i = 0; i < 50; i++) hearts.push(new Heart());
function animateHearts() { ctx.clearRect(0, 0, cvs.width, cvs.height); hearts.forEach(h => { h.update(); h.draw(); }); requestAnimationFrame(animateHearts); }
animateHearts();

// ==================== 3. Stage Management ====================
function nextStage(hideId, showId) {
    const hideEl = document.querySelector(hideId);
    const showEl = document.querySelector(showId);
    
    hideEl.classList.add('hidden');
    showEl.classList.remove('hidden');
    gsap.fromTo(showEl, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5 });
}

// Stage 1: Envelope
function openEnvelope() {
    document.querySelector('.envelope-wrapper').classList.add('open');
    setTimeout(() => {
        document.getElementById('start-btn').style.display = "block";
    }, 800);
}

// Stage 2: Ask Button (ແລ່ນໜີ)
const noBtn = document.getElementById('no-btn');
function runAway(e) {
    if(e) e.preventDefault();
    const newX = (Math.random() - 0.5) * 150;
    const newY = (Math.random() - 0.5) * 80;
    gsap.to(noBtn, { x: newX, y: newY, duration: 0.2, ease: "power2.out" });
}
noBtn.addEventListener('mouseenter', runAway);
noBtn.addEventListener('touchstart', runAway);

// Stage 3: Passcode
let inputPass = "";
function pressKey(num) { if (inputPass.length < 4) { inputPass += num; updateDots(); if (inputPass.length === 4) checkPass(); } }
function clearKey() { inputPass = inputPass.slice(0, -1); updateDots(); }
function updateDots() { document.querySelectorAll('.dot').forEach((dot, i) => { if (i < inputPass.length) dot.classList.add('active'); else dot.classList.remove('active'); }); }
function checkPass() {
    if (inputPass === CONFIG.passcode) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => { nextStage('#stage-passcode', '#stage-timer'); startTimer(); }, 800);
    } else {
        gsap.to('.passcode-dots', { x: 10, duration: 0.1, yoyo: true, repeat: 5 }); inputPass = ""; setTimeout(updateDots, 500);
    }
}

// Stage 4: Timer
function startTimer() {
    const start = new Date(CONFIG.startDate).getTime();
    setInterval(() => {
        const now = new Date().getTime(); const diff = now - start;
        document.getElementById('days').innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
        document.getElementById('hours').innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById('minutes').innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById('seconds').innerText = Math.floor((diff % (1000 * 60)) / 1000);
    }, 1000);
}

// ==================== Stage 5: Swipeable Gallery (Tinder Style) ====================
function loadGallery() {
    nextStage('#stage-timer', '#stage-gallery');
    initCards();
}

function initCards() {
    const cardsContainer = document.querySelector('.tinder-cards');
    cardsContainer.innerHTML = '';
    
    // ສ້າງຮູບ (ຫຼັງມາໜ້າ) ເພື່ອໃຫ້ຮູບທຳອິດຢູ່ເທິງ
    const reversedPhotos = [...CONFIG.photos].reverse();
    
    reversedPhotos.forEach((url, index) => {
        const card = document.createElement('div');
        card.classList.add('tinder-card');
        card.innerHTML = `<img src="${url}">`;
        
        // Random ມຸມອຽງນ້ອຍໆ
        const randomRot = (Math.random() - 0.5) * 10;
        card.style.transform = `rotate(${randomRot}deg)`;
        card.dataset.rot = randomRot; // ເກັບຄ່າໄວ້
        
        cardsContainer.appendChild(card);
    });

    // ເລີ່ມຕົ້ນລະບົບປັດໃຫ້ຮູບເທິງສຸດ
    setupTopCard();
}

function setupTopCard() {
    const cards = document.querySelectorAll('.tinder-card:not(.removed)');
    if (cards.length === 0) {
        // ຖ້າປັດໝົດແລ້ວ ໂຊປຸ່ມໄປຕໍ່
        document.getElementById('btn-to-scratch').style.display = 'block';
        return;
    }

    // ເລືອກຮູບທີ່ຢູ່ເທິງສຸດ (ໂຕສຸດທ້າຍໃນ NodeList)
    const topCard = cards[cards.length - 1];
    
    // ໃຊ້ Hammer.js ຈັດການການປັດ (Swipe/Pan)
    const hammer = new Hammer(topCard);
    
    hammer.on('pan', function (event) {
        topCard.classList.add('moving');
        // ລາກໄປທາງໃດ ໃຫ້ຮູບຍ້າຍ ແລະ ໝຸນຕາມນັ້ນ
        const xMulti = event.deltaX * 0.05;
        const yMulti = event.deltaY / 80;
        const rotate = xMulti * yMulti + parseFloat(topCard.dataset.rot);

        topCard.style.transform = `translate(${event.deltaX}px, ${event.deltaY}px) rotate(${rotate}deg)`;
    });

    hammer.on('panend', function (event) {
        topCard.classList.remove('moving');
        
        // ຖ້າປັດໄປໄກກວ່າ 100px (ຊ້າຍ ຫຼື ຂວາ) ຖືວ່າປັດອອກ
        const keep = Math.abs(event.deltaX) < 100;
        
        if (keep) {
            // ເດັ້ງກັບມາບ່ອນເກົ່າ
            topCard.style.transform = `rotate(${topCard.dataset.rot}deg)`;
        } else {
            // ປິວອອກໄປນອກຈໍ
            const endX = Math.max(Math.abs(event.velocityX) * 1000, 1000);
            const toX = event.deltaX > 0 ? endX : -endX;
            const endY = Math.abs(event.velocityY) * 1000;
            const toY = event.deltaY > 0 ? endY : -endY;
            
            topCard.style.transition = 'transform 0.5s ease-out';
            topCard.style.transform = `translate(${toX}px, ${toY + event.deltaY}px)`;
            
            topCard.classList.add('removed');
            
            // ລຶບ Event ແລ້ວຕັ້ງຄ່າໃຫ້ຮູບຕໍ່ໄປ
            setTimeout(() => {
                topCard.remove();
                setupTopCard();
            }, 500);
        }
    });
}


// ==================== Stage 6: Scratch Card ====================
const scCanvas = document.getElementById('scratch-canvas');
const scCtx = scCanvas.getContext('2d');
const scWrapper = document.querySelector('.scratch-wrapper');

function initScratch() {
    scCanvas.width = scWrapper.offsetWidth; scCanvas.height = scWrapper.offsetHeight;
    scCtx.fillStyle = '#C0C0C0'; scCtx.fillRect(0, 0, scCanvas.width, scCanvas.height);
    scCtx.fillStyle = '#555'; scCtx.font = 'bold 24px Noto Sans Lao, sans-serif'; 
    scCtx.textAlign = 'center'; scCtx.fillText("ຂູດບ່ອນນີ້ເລີຍ!", scCanvas.width/2, scCanvas.height/2 + 8);
}

let isDrawing = false;
function scratch(x, y) {
    scCtx.globalCompositeOperation = 'destination-out';
    scCtx.beginPath(); scCtx.arc(x, y, 20, 0, Math.PI * 2); scCtx.fill();
    if(Math.random() > 0.98) confetti({ particleCount: 15, spread: 40, origin: { y: 0.8 } });
}
scCanvas.addEventListener('mousedown', () => isDrawing = true);
scCanvas.addEventListener('mouseup', () => isDrawing = false);
scCanvas.addEventListener('mousemove', (e) => { if (!isDrawing) return; const rect = scCanvas.getBoundingClientRect(); scratch(e.clientX - rect.left, e.clientY - rect.top); });
scCanvas.addEventListener('touchstart', (e) => { isDrawing = true; e.preventDefault(); });
scCanvas.addEventListener('touchend', () => isDrawing = false);
scCanvas.addEventListener('touchmove', (e) => {
    if (!isDrawing) return; e.preventDefault();
    const rect = scCanvas.getBoundingClientRect(); const touch = e.touches[0];
    scratch(touch.clientX - rect.left, touch.clientY - rect.top);
});