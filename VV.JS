// ==================== 1. ຕັ້ງຄ່າຂໍ້ມູນຢູ່ບ່ອນນີ້ ====================
const CONFIG = {
    passcode: "1402", // ລະຫັດປົດລັອກ
    // ຕັ້ງຄ່າຍ້ອນຫຼັງໄປປະມານ 2 ອາທິດ (ຕົວຢ່າງ: ຖ້າມື້ນີ້ແມ່ນ 14 ກຸມພາ, ກໍຕັ້ງເປັນ 31 ມັງກອນ)
    startDate: "2026-01-31", // ວັນທີ່ເລີ່ມຄົບ (ປີ-ເດືອນ-ວັນ)
    // ຊື່ຮູບໃນ Folder
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
    constructor() {
        this.x = Math.random() * cvs.width;
        this.y = cvs.height + Math.random() * 100;
        this.size = Math.random() * 15 + 5;
        this.speed = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.3;
    }
    update() {
        this.y -= this.speed;
        if (this.y < -50) this.y = cvs.height + 50;
    }
    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.font = `${this.size}px Arial`;
        ctx.fillText("❤️", this.x, this.y);
    }
}
for (let i = 0; i < 50; i++) hearts.push(new Heart());
function animateHearts() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    hearts.forEach(h => { h.update(); h.draw(); });
    requestAnimationFrame(animateHearts);
}
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

// Stage 2: Ask Button (ແກ້ໄຂໃຫ້ແລ່ນໜີໃນໂທລະສັບ)
const noBtn = document.getElementById('no-btn');

// ສ້າງ Function ແຍກເພື່ອໃຫ້ເອີ້ນໃຊ້ງ່າຍ
function runAway() {
    // ຄຳນວນຕຳແໜ່ງແບບ Random (ໃຫ້ມັນແລ່ນໄປມາໃກ້ໆປຸ່ມ Yes)
    const containerWidth = 200; // ຄວາມກວ້າງທີ່ໃຫ້ປຸ່ມແລ່ນໄດ້
    const containerHeight = 100; // ຄວາມສູງທີ່ໃຫ້ປຸ່ມແລ່ນໄດ້
    
    // Random ຕຳແໜ່ງໃໝ່
    const newX = (Math.random() - 0.5) * containerWidth;
    const newY = (Math.random() - 0.5) * containerHeight;
    
    gsap.to(noBtn, { x: newX, y: newY, duration: 0.2, ease: "power2.out" });
}

// ຮອງຮັບທັງເມົາສ໌ໃນຄອມ ແລະ ການແຕະໃນໂທລະສັບ
noBtn.addEventListener('mouseenter', runAway);
noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault(); // ປ້ອງກັນບໍ່ໃຫ້ມັນກົດຕິດ
    runAway();
});


// Stage 3: Passcode
let inputPass = "";
function pressKey(num) {
    if (inputPass.length < 4) {
        inputPass += num;
        updateDots();
        if (inputPass.length === 4) checkPass();
    }
}
function clearKey() { inputPass = inputPass.slice(0, -1); updateDots(); }
function updateDots() {
    document.querySelectorAll('.dot').forEach((dot, i) => {
        if (i < inputPass.length) dot.classList.add('active');
        else dot.classList.remove('active');
    });
}
function checkPass() {
    if (inputPass === CONFIG.passcode) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => { 
            nextStage('#stage-passcode', '#stage-timer'); 
            startTimer(); 
        }, 1000);
    } else {
        gsap.to('.passcode-dots', { x: 10, duration: 0.1, yoyo: true, repeat: 5 });
        inputPass = ""; setTimeout(updateDots, 500);
    }
}

// Stage 4: Timer
function startTimer() {
    // ວັນທີ່ເລີ່ມຕົ້ນຖືກຕັ້ງຄ່າຢູ່ຂ້າງເທິງແລ້ວ
    const start = new Date(CONFIG.startDate).getTime();
    setInterval(() => {
        const now = new Date().getTime();
        const diff = now - start;
        document.getElementById('days').innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
        document.getElementById('hours').innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById('minutes').innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById('seconds').innerText = Math.floor((diff % (1000 * 60)) / 1000);
    }, 1000);
}

// Stage 5: Gallery (ແກ້ໄຂໃຫ້ປັດຮູບໄດ້)
function loadGallery() {
    nextStage('#stage-timer', '#stage-gallery');
    const container = document.querySelector('.gallery-container');
    container.innerHTML = ''; // ລ້າງຮູບເກົ່າຖ້າມີ
    let zIndex = CONFIG.photos.length;

    // ສ້າງຮູບຂຶ້ນມາ
    CONFIG.photos.forEach((url, i) => {
        const div = document.createElement('div');
        div.className = 'polaroid';
        div.id = 'photo-' + i;
        
        // Random ມຸມອຽງໃຫ້ເບິ່ງເປັນທຳມະຊາດ
        const rotation = (Math.random() - 0.5) * 20; 
        div.style.setProperty('--r', `${rotation}deg`);
        div.style.transform = `rotate(${rotation}deg)`;
        
        // ໃຫ້ຮູບທຳອິດຢູ່ເທິງສຸດ
        div.style.zIndex = zIndex--; 
        div.innerHTML = `<img src="${url}">`;
        container.appendChild(div);

        // Animation ຕອນຮູບຫຼົ່ນລົງມາ
        gsap.from(div, { y: -600, rotation: rotation + 90, duration: 1, delay: i * 0.2, ease: "bounce.out" });
    });

    // ສ້າງລະບົບປັດຮູບ (Draggable) ຫຼັງຈາກ Animation ຫຼົ່ນສຳເລັດ
    setTimeout(() => {
        createDraggableCards();
    }, CONFIG.photos.length * 200 + 1000);
}

function createDraggableCards() {
    const cards = document.querySelectorAll('.polaroid');
    let cardsRemaining = cards.length;

    Draggable.create(cards, {
        type: "x,y",
        edgeResistance: 0.65,
        bounds: null, // ປ່ອຍໃຫ້ປັດອອກນອກຈໍໄດ້
        onDragEnd: function() {
            // ຖ້າປັດໄປໄກເກີນ 100px ທັງຊ້າຍຫຼືຂວາ ໃຫ້ປິວອອກໄປເລີຍ
            if (Math.abs(this.x) > 100) {
                const direction = this.x > 0 ? 1 : -1;
                gsap.to(this.target, {
                    x: direction * window.innerWidth, // ປິວອອກນອກຈໍ
                    rotation: direction * 45,
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        this.target.style.display = 'none'; // ເຊື່ອງຮູບ
                        cardsRemaining--;
                        // ຖ້າປັດຮູບໝົດແລ້ວ ໃຫ້ໂຊປຸ່ມໄປຕໍ່
                        if (cardsRemaining === 0) {
                            const btn = document.getElementById('btn-to-scratch');
                            btn.style.display = 'block';
                            gsap.from(btn, { opacity: 0, y: 20, duration: 0.5 });
                        }
                    }
                });
            } else {
                // ຖ້າປັດບໍ່ໄກພໍ ໃຫ້ກັບມາບ່ອນເກົ່າ
                gsap.to(this.target, { x: 0, y: 0, rotation: this.target.style.getPropertyValue('--r'), duration: 0.3, ease: "power2.out" });
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
    scCtx.textAlign = 'center';
    scCtx.fillText("ຂູດບ່ອນນີ້ເລີຍ!", scCanvas.width/2, scCanvas.height/2 + 8);
}

let isDrawing = false;
function scratch(x, y) {
    scCtx.globalCompositeOperation = 'destination-out';
    scCtx.beginPath(); scCtx.arc(x, y, 20, 0, Math.PI * 2); scCtx.fill();
    
    // Confetti ຕອນຂູດ
    if(Math.random() > 0.98) {
        confetti({ particleCount: 15, spread: 40, origin: { y: 0.8 } });
    }
}

scCanvas.addEventListener('mousedown', () => isDrawing = true);
scCanvas.addEventListener('mouseup', () => isDrawing = false);
scCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const rect = scCanvas.getBoundingClientRect();
    scratch(e.clientX - rect.left, e.clientY - rect.top);
});
scCanvas.addEventListener('touchstart', (e) => {
    isDrawing = true;
    e.preventDefault(); // ກັນບໍ່ໃຫ້ໜ້າຈໍເລື່ອນຕອນຂູດ
});
scCanvas.addEventListener('touchend', () => isDrawing = false);
scCanvas.addEventListener('touchmove', (e) => {
    if (!isDrawing) return;
    e.preventDefault(); // ກັນບໍ່ໃຫ້ໜ້າຈໍເລື່ອນຕອນຂູດ
    const rect = scCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    scratch(touch.clientX - rect.left, touch.clientY - rect.top);
});