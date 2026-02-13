// ==================== 1. ຕັ້ງຄ່າຂໍ້ມູນ ====================
const CONFIG = {
    passcode: "1402",
    startDate: "2026-01-31", // ຕັ້ງວັນທີຍ້ອນຫຼັງຕາມຕ້ອງການ
    photos: [
        "cc1.jpeg",
        "cc2.jpeg",
        "cc3.jpeg",
        "cc4.jpeg"
        // ໃສ່ຮູບເພີ່ມໄດ້ຕາມສະບາຍ
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
    gsap.to(hideId, { opacity: 0, scale: 0.8, duration: 0.5, onComplete: () => {
        document.querySelector(hideId).classList.add('hidden');
        const next = document.querySelector(showId);
        next.classList.remove('hidden');
        gsap.fromTo(next, { opacity: 0, scale: 1.2 }, { opacity: 1, scale: 1, duration: 0.5 });
    }});
}

// Stage 1: Envelope
function openEnvelope() {
    document.querySelector('.envelope-wrapper').classList.add('open');
    setTimeout(() => {
        const btn = document.getElementById('start-btn');
        btn.style.display = "block";
        gsap.from(btn, { y: 20, opacity: 0, duration: 0.5 });
    }, 800);
}

// Stage 2: Ask Button (ແກ້ໄຂໃຫ້ແລ່ນໜີໃນມືຖື)
const noBtn = document.getElementById('no-btn');
function runAway(e) {
    if(e) e.preventDefault();
    const containerW = 200; const containerH = 100;
    const newX = (Math.random() - 0.5) * containerW;
    const newY = (Math.random() - 0.5) * containerH;
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
        setTimeout(() => { nextStage('#stage-passcode', '#stage-timer'); startTimer(); }, 1000);
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

// Stage 5: Gallery (ລະບົບປັດຮູບ Tinder-style)
let cardsRemaining = CONFIG.photos.length;

function loadGallery() {
    nextStage('#stage-timer', '#stage-gallery');
    const container = document.querySelector('.gallery-container');
    container.innerHTML = ''; // ລ້າງຂອງເກົ່າ
    cardsRemaining = CONFIG.photos.length;

    // ສ້າງຮູບຈາກຫຼັງມາໜ້າ ເພື່ອໃຫ້ຮູບທຳອິດຢູ່ເທິງສຸດ
    [...CONFIG.photos].reverse().forEach((url, i) => {
        const actualIndex = CONFIG.photos.length - 1 - i;
        const div = document.createElement('div');
        div.className = 'polaroid';
        
        // ເກັບຄ່າ rotation ເບື້ອງຕົ້ນໄວ້ໃນ data attribute
        const baseRotation = (Math.random() - 0.5) * 10;
        div.dataset.baseRotation = baseRotation;
        
        div.style.zIndex = i; // ຮູບທຳອິດ (index 0) ຈະມີ z-index ສູງສຸດ
        div.innerHTML = `<img src="${url}" draggable="false">`;
        container.appendChild(div);

        // Animation ຕອນຮູບເຂົ້າມາ
        gsap.fromTo(div, 
            { y: -1000, rotation: baseRotation + (Math.random()-0.5)*60, opacity: 0 },
            { y: 0, rotation: baseRotation, opacity: 1, duration: 0.8, delay: actualIndex * 0.2, ease: "back.out(0.8)" }
        );
    });

    // ລໍຖ້າໃຫ້ຮູບມາຄົບແລ້ວຈຶ່ງໃສ່ລະບົບປັດ
    setTimeout(initSwipeableCards, CONFIG.photos.length * 200 + 800);
}

function initSwipeableCards() {
    const cards = Array.from(document.querySelectorAll('.polaroid'));
    // ໃຫ້ປັດໄດ້ສະເພາະຮູບທີ່ຢູ່ເທິງສຸດເທົ່ານັ້ນ
    const topCard = cards[cards.length - 1];

    if (!topCard) return; // ຖ້າບໍ່ມີຮູບແລ້ວ ກໍອອກໄປ

    Draggable.create(topCard, {
        type: "x,y",
        edgeResistance: 0.7,
        bounds: window,
        zIndexBoost: false, // ບໍ່ຕ້ອງເພີ່ມ z-index ຕອນລາກ
        onDrag: function() {
            // ໝຸນຮູບຕາມທິດທາງທີ່ລາກ
            const rotation = parseFloat(this.target.dataset.baseRotation) + (this.x * 0.05);
            gsap.set(this.target, { rotation: rotation });
        },
        onDragEnd: function() {
            const threshold = 100; // ໄລຍະທາງທີ່ຕ້ອງລາກເກີນເພື່ອໃຫ້ປັດອອກ
            const currentRotation = parseFloat(this.target.dataset.baseRotation);

            // ຖ້າລາກໄປຊ້າຍ ຫຼື ຂວາ ໄກພໍ
            if (Math.abs(this.x) > threshold) {
                const direction = this.x > 0 ? 1 : -1; // 1=ຂວາ, -1=ຊ້າຍ
                const screenW = window.innerWidth;

                // Animation ປັດຮູບອອກໄປນອກຈໍ
                gsap.to(this.target, {
                    x: direction * (screenW + 200),
                    y: this.y + (Math.random() - 0.5) * 200,
                    rotation: currentRotation + (direction * 45),
                    opacity: 0,
                    duration: 0.5,
                    ease: "power1.in",
                    onComplete: () => {
                        this.target.remove(); // ລຶບຮູບອອກຈາກ DOM
                        cardsRemaining--;
                        this.kill(); // ຢຸດ Draggable ຂອງຮູບນີ້

                        // ຖ້າຮູບໝົດແລ້ວ ໂຊປຸ່ມໄປຕໍ່
                        if (cardsRemaining === 0) {
                            const btn = document.getElementById('btn-to-scratch');
                            btn.style.display = 'block';
                            gsap.from(btn, { opacity: 0, y: 20, duration: 0.5 });
                        } else {
                            // ຖ້າຍັງມີຮູບ ໃຫ້ initialize ຮູບຕໍ່ໄປໃຫ້ປັດໄດ້
                            initSwipeableCards();
                        }
                    }
                });
            } else {
                // ຖ້າລາກບໍ່ໄກພໍ ໃຫ້ເດັ້ງກັບມາບ່ອນເກົ່າ
                gsap.to(this.target, {
                    x: 0,
                    y: 0,
                    rotation: currentRotation,
                    duration: 0.4,
                    ease: "back.out(1.5)"
                });
            }
        }
    });
}


// Stage 6: Scratch Card
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
// Mouse Events
scCanvas.addEventListener('mousedown', () => isDrawing = true);
scCanvas.addEventListener('mouseup', () => isDrawing = false);
scCanvas.addEventListener('mousemove', (e) => { if (!isDrawing) return; const rect = scCanvas.getBoundingClientRect(); scratch(e.clientX - rect.left, e.clientY - rect.top); });
// Touch Events (ແກ້ໄຂໃຫ້ຂູດໄດ້ໃນມືຖື)
scCanvas.addEventListener('touchstart', (e) => { isDrawing = true; e.preventDefault(); });
scCanvas.addEventListener('touchend', () => isDrawing = false);
scCanvas.addEventListener('touchmove', (e) => {
    if (!isDrawing) return; e.preventDefault();
    const rect = scCanvas.getBoundingClientRect(); const touch = e.touches[0];
    scratch(touch.clientX - rect.left, touch.clientY - rect.top);
});