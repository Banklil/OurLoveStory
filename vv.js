// ==================== 1. ຕັ້ງຄ່າຂໍ້ມູນ ====================
const CONFIG = {
    passcode: "5700",
    startDate: "2026-01-31", // ຍ້ອນຫຼັງໄປ 2 ອາທິດ
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
function nextStage(hideId, showId, onCompleteCallback) {
    const hideEl = document.querySelector(hideId);
    const showEl = document.querySelector(showId);
    
    gsap.to(hideEl, { opacity: 0, scale: 0.8, duration: 0.4, onComplete: () => {
        hideEl.classList.add('hidden');
        showEl.classList.remove('hidden');
        gsap.fromTo(showEl, { opacity: 0, scale: 1.1 }, { 
            opacity: 1, 
            scale: 1, 
            duration: 0.5,
            onComplete: () => {
                if(onCompleteCallback) onCompleteCallback();
            }
        });
    }});
}

function openEnvelope() {
    document.querySelector('.envelope-wrapper').classList.add('open');
    setTimeout(() => {
        document.getElementById('start-btn').style.display = "block";
        gsap.from('#start-btn', { y: 20, opacity: 0, duration: 0.5 });
    }, 800);
}

// ==================== Stage 2: ປຸ່ມ No ແລ່ນໜີ ====================
const noBtn = document.getElementById('no-btn');
function runAway(e) {
    if(e) e.preventDefault();
    // ໃຫ້ແລ່ນໄປມາໃນລັດສະໝີ 120px ເພື່ອບໍ່ໃຫ້ຫຼຸດອອກຈາກຈໍ
    const newX = (Math.random() - 0.5) * 150;
    const newY = (Math.random() - 0.5) * 150;
    
    gsap.to(noBtn, { x: newX, y: newY, duration: 0.2, ease: "power2.out" });
}
noBtn.addEventListener('touchstart', runAway, {passive: false});
noBtn.addEventListener('mouseenter', runAway);

// ==================== Stage 3: Passcode ====================
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

// ==================== Stage 4: Timer ====================
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

// ==================== Stage 5: Gallery (Swipe) ====================
function loadGallery() {
    nextStage('#stage-timer', '#stage-gallery');
    const container = document.getElementById('tinder-cards');
    container.innerHTML = '';
    
    // ເອົາຮູບມາໃສ່ ໂດຍໃຫ້ຮູບທຳອິດຢູ່ເທິງສຸດ
    const reversedPhotos = [...CONFIG.photos].reverse();
    reversedPhotos.forEach((url, i) => {
        const card = document.createElement('div');
        card.className = 'tinder-card';
        card.innerHTML = `<img src="${url}" draggable="false" onerror="this.src='https://via.placeholder.com/280x380?text=Image+Not+Found'">`;
        
        const rot = (Math.random() - 0.5) * 8; // ອຽງນ້ອຍໆ
        card.style.transform = `rotate(${rot}deg)`;
        card.dataset.rot = rot;
        
        container.appendChild(card);
    });

    // ເອີ້ນໃຊ້ Hammer.js ເພື່ອໃຫ້ປັດໄດ້ໃນມືຖື
    setTimeout(initHammerSwipe, 500);
}

function initHammerSwipe() {
    const cards = document.querySelectorAll('.tinder-card');
    if (cards.length === 0) {
        // ຖ້າປັດໝົດທຸກຮູບແລ້ວ
        document.getElementById('btn-to-scratch').style.display = 'block';
        return;
    }

    const topCard = cards[cards.length - 1]; // ເລືອກຮູບເທິງສຸດ
    const hammer = new Hammer(topCard);

    hammer.on('pan', (e) => {
        topCard.style.transition = 'none';
        const rotate = (e.deltaX * 0.05) + parseFloat(topCard.dataset.rot);
        topCard.style.transform = `translate(${e.deltaX}px, ${e.deltaY}px) rotate(${rotate}deg)`;
    });

    hammer.on('panend', (e) => {
        if (Math.abs(e.deltaX) > 80) { // ຖ້າປັດຊ້າຍ/ຂວາ ເກີນ 80px ໃຫ້ປິວອອກໄປ
            topCard.style.transition = 'transform 0.4s ease-out';
            const goX = e.deltaX > 0 ? window.innerWidth : -window.innerWidth;
            topCard.style.transform = `translate(${goX}px, ${e.deltaY}px) rotate(${e.deltaX * 0.1}deg)`;
            
            setTimeout(() => {
                topCard.remove();
                initHammerSwipe(); // ຕັ້ງຄ່າໃຫ້ຮູບຕໍ່ໄປປັດໄດ້
            }, 300);
        } else { // ຖ້າປັດບໍ່ແຮງພໍ ໃຫ້ກັບມາບ່ອນເກົ່າ
            topCard.style.transition = 'transform 0.3s ease';
            topCard.style.transform = `translate(0px, 0px) rotate(${topCard.dataset.rot}deg)`;
        }
    });
}

// ==================== Stage 6: Scratch Card ====================
function goToScratch() {
    // ຍ້າຍໄປໜ້າ Scratch ແລະ "ລໍຖ້າໃຫ້ມັນໂຊຂຶ້ນມາກ່ອນ" ຈຶ່ງທາສີປິດ!
    // ນີ້ຄືການແກ້ບັກທີ່ເຮັດໃຫ້ເຫັນຕົວໜັງສືກ່ອນຂູດ
    nextStage('#stage-gallery', '#stage-scratch', () => {
        initScratch();
    });
}

const scCanvas = document.getElementById('scratch-canvas');
const scCtx = scCanvas.getContext('2d');
const scWrapper = document.querySelector('.scratch-wrapper');

function initScratch() {
    // ຕັ້ງຄ່າຂະໜາດ Canvas ໃຫ້ເທົ່າກັບກ່ອງພໍດີ
    scCanvas.width = scWrapper.offsetWidth; 
    scCanvas.height = scWrapper.offsetHeight;
    
    // ທາສີເທົາປິດ 100% ມິດງຽບ!
    scCtx.fillStyle = '#C0C0C0'; 
    scCtx.fillRect(0, 0, scCanvas.width, scCanvas.height);
    
    // ຂຽນໜັງສືບອກໃຫ້ຂູດ
    scCtx.fillStyle = '#555'; 
    scCtx.font = 'bold 20px Noto Sans Lao'; 
    scCtx.textAlign = 'center'; 
    scCtx.fillText("ຂູດບ່ອນນີ້ເລີຍ!", scCanvas.width/2, scCanvas.height/2 + 8);
}

let isDrawing = false;
function scratch(x, y) {
    scCtx.globalCompositeOperation = 'destination-out';
    scCtx.beginPath(); 
    scCtx.arc(x, y, 25, 0, Math.PI * 2); // ຂະໜາດຫົວແປງຂູດ
    scCtx.fill();
    
    // ຍິງພຸຕອນກຳລັງຂູດ
    if(Math.random() > 0.96) confetti({ particleCount: 10, spread: 40, origin: { y: 0.8 } });
}

function getPos(e) {
    const rect = scCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
}

// ສຳລັບເມົາສ໌ (ຄອມພິວເຕີ)
scCanvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(getPos(e).x, getPos(e).y); });
scCanvas.addEventListener('mousemove', (e) => { if (isDrawing) scratch(getPos(e).x, getPos(e).y); });
scCanvas.addEventListener('mouseup', () => isDrawing = false);

// ສຳລັບນິ້ວມື (ໂທລະສັບ)
scCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); isDrawing = true; scratch(getPos(e).x, getPos(e).y); }, {passive: false});
scCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (isDrawing) scratch(getPos(e).x, getPos(e).y); }, {passive: false});
scCanvas.addEventListener('touchend', () => isDrawing = false);
