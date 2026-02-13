// ==================== 1. ຕັ້ງຄ່າຂໍ້ມູນ ====================
const CONFIG = {
    passcode: "5700",
    // ຍ້ອນຫຼັງໄປ 2 ອາທິດ (31 ມັງກອນ 2026)
    startDate: "2026-01-31", 
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
    
    gsap.to(hideEl, { opacity: 0, scale: 0.8, duration: 0.4, onComplete: () => {
        hideEl.classList.add('hidden');
        showEl.classList.remove('hidden');
        gsap.fromTo(showEl, { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 0.5 });
    }});
}

function openEnvelope() {
    document.querySelector('.envelope-wrapper').classList.add('open');
    setTimeout(() => {
        document.getElementById('start-btn').style.display = "block";
        gsap.from('#start-btn', { y: 20, opacity: 0, duration: 0.5 });
    }, 800);
}

// Stage 2: ປຸ່ມ No ແລ່ນໜີ
const noBtn = document.getElementById('no-btn');
function runAway(e) {
    if(e) e.preventDefault();
    const newX = (Math.random() - 0.5) * 180;
    const newY = (Math.random() - 0.5) * 80;
    gsap.to(noBtn, { x: newX, y: newY, duration: 0.2, ease: "power2.out" });
}
// ຮອງຮັບການແຕະໃນມືຖື 100%
noBtn.addEventListener('touchstart', runAway, {passive: false});
noBtn.addEventListener('mouseenter', runAway);

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

// ==================== Stage 5: Gallery (Hammer.js Swipe) ====================
function loadGallery() {
    nextStage('#stage-timer', '#stage-gallery');
    const container = document.getElementById('tinder-cards');
    container.innerHTML = '';
    
    // ສ້າງຮູບ
    CONFIG.photos.forEach((url, i) => {
        const card = document.createElement('div');
        card.className = 'tinder-card';
        card.innerHTML = `<img src="${url}" draggable="false">`;
        
        const rot = (Math.random() - 0.5) * 10;
        card.style.transform = `rotate(${rot}deg)`;
        card.dataset.rot = rot;
        card.style.zIndex = CONFIG.photos.length - i; // ຮູບທຳອິດຢູ່ເທິງສຸດ
        
        container.appendChild(card);
        gsap.from(card, { y: -500, opacity: 0, duration: 0.8, delay: i * 0.1, ease: "back.out(1.2)" });
    });

    setTimeout(initHammerSwipe, 1000);
}

function initHammerSwipe() {
    const cards = document.querySelectorAll('.tinder-card');
    if (cards.length === 0) {
        // ປັດໝົດແລ້ວ ໂຊປຸ່ມໄປຕໍ່
        document.getElementById('btn-to-scratch').style.display = 'block';
        return;
    }

    // ຮູບທີ່ຢູ່ເທິງສຸດຄື cards[0]
    const topCard = cards[0];
    const hammer = new Hammer(topCard);

    hammer.on('pan', (e) => {
        topCard.style.transition = 'none';
        const rotate = (e.deltaX * 0.05) + parseFloat(topCard.dataset.rot);
        topCard.style.transform = `translate(${e.deltaX}px, ${e.deltaY}px) rotate(${rotate}deg)`;
    });

    hammer.on('panend', (e) => {
        // ຖ້າປັດຊ້າຍ ຫຼື ຂວາ ເກີນ 100px
        if (Math.abs(e.deltaX) > 100) {
            topCard.style.transition = 'transform 0.4s ease-out';
            const goX = e.deltaX > 0 ? window.innerWidth + 200 : -window.innerWidth - 200;
            topCard.style.transform = `translate(${goX}px, ${e.deltaY}px) rotate(${e.deltaX * 0.1}deg)`;
            
            setTimeout(() => {
                topCard.remove();
                initHammerSwipe(); // ເປີດລະບົບປັດໃຫ້ຮູບຕໍ່ໄປ
            }, 300);
        } else {
            // ເດັ້ງກັບບ່ອນເກົ່າ
            topCard.style.transition = 'transform 0.3s ease';
            topCard.style.transform = `rotate(${topCard.dataset.rot}deg)`;
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
    scCtx.fillStyle = '#555'; scCtx.font = 'bold 24px Noto Sans Lao'; 
    scCtx.textAlign = 'center'; scCtx.fillText("ຂູດບ່ອນນີ້ເລີຍ!", scCanvas.width/2, scCanvas.height/2 + 8);
}

let isDrawing = false;
function scratch(x, y) {
    scCtx.globalCompositeOperation = 'destination-out';
    scCtx.beginPath(); scCtx.arc(x, y, 20, 0, Math.PI * 2); scCtx.fill();
    if(Math.random() > 0.98) confetti({ particleCount: 15, spread: 40, origin: { y: 0.8 } });
}

// ປ້ອງກັນການເລື່ອນໜ້າຈໍໃນໂທລະສັບຕອນຂູດ
function getPos(e) {
    const rect = scCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
}

scCanvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(getPos(e).x, getPos(e).y); });
scCanvas.addEventListener('mousemove', (e) => { if (isDrawing) scratch(getPos(e).x, getPos(e).y); });
scCanvas.addEventListener('mouseup', () => isDrawing = false);

scCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); isDrawing = true; scratch(getPos(e).x, getPos(e).y); }, {passive: false});
scCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (isDrawing) scratch(getPos(e).x, getPos(e).y); }, {passive: false});
scCanvas.addEventListener('touchend', () => isDrawing = false);