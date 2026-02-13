// ==================== 1. ຕັ້ງຄ່າຂໍ້ມູນຢູ່ບ່ອນນີ້ ====================
const CONFIG = {
    passcode: "1402", // ລະຫັດປົດລັອກ
    startDate: "2023-02-14", // ວັນທີ່ເລີ່ມຄົບ (ປີ-ເດືອນ-ວັນ)
    // ປ່ຽນລິ້ງເປັນຊື່ໄຟລ໌ຮູບໃນເຄື່ອງຂອງເຈົ້າ
    photos: [
        "cc1.jpeg", 
        "cc2.jpeg",
        "cc3.jpeg",
        "cc4.jpeg" 
        // ສາມາດເພີ່ມຮູບໄດ້ຕາມຕ້ອງການ
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

// Stage 2: Ask Button
const noBtn = document.getElementById('no-btn');
noBtn.addEventListener('mouseover', () => {
    const x = (Math.random() - 0.5) * 200;
    const y = (Math.random() - 0.5) * 200;
    gsap.to(noBtn, { x: x, y: y, duration: 0.2 });
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

// Stage 5: Gallery
function loadGallery() {
    nextStage('#stage-timer', '#stage-gallery');
    const container = document.querySelector('.gallery-container');
    CONFIG.photos.forEach((url, i) => {
        const div = document.createElement('div');
        div.className = 'polaroid';
        div.style.setProperty('--r', `${(Math.random() - 0.5) * 30}deg`);
        div.style.zIndex = i;
        div.innerHTML = `<img src="${url}">`;
        container.appendChild(div);
        gsap.from(div, { y: -600, rotation: 180, duration: 1, delay: i * 0.3, ease: "bounce.out" });
    });
}

// Stage 6: Scratch Card
const scCanvas = document.getElementById('scratch-canvas');
const scCtx = scCanvas.getContext('2d');
const scWrapper = document.querySelector('.scratch-wrapper');

function initScratch() {
    scCanvas.width = scWrapper.offsetWidth; scCanvas.height = scWrapper.offsetHeight;
    scCtx.fillStyle = '#C0C0C0'; scCtx.fillRect(0, 0, scCanvas.width, scCanvas.height);
    scCtx.fillStyle = '#555'; scCtx.font = '20px Noto Sans Lao'; 
    scCtx.fillText("ຂູດບ່ອນນີ້ເລີຍ!", scCanvas.width/2 - 60, scCanvas.height/2);
}

let isDrawing = false;
function scratch(x, y) {
    scCtx.globalCompositeOperation = 'destination-out';
    scCtx.beginPath(); scCtx.arc(x, y, 20, 0, Math.PI * 2); scCtx.fill();
}
scCanvas.addEventListener('mousedown', () => isDrawing = true);
scCanvas.addEventListener('mouseup', () => isDrawing = false);
scCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const rect = scCanvas.getBoundingClientRect();
    scratch(e.clientX - rect.left, e.clientY - rect.top);
});
scCanvas.addEventListener('touchstart', () => isDrawing = true);
scCanvas.addEventListener('touchend', () => isDrawing = false);
scCanvas.addEventListener('touchmove', (e) => {
    if (!isDrawing) return;
    const rect = scCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    scratch(touch.clientX - rect.left, touch.clientY - rect.top);
});

// Initialize scratch on gallery exit
document.querySelector('#stage-gallery .next-btn').addEventListener('click', initScratch);