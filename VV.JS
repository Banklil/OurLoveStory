// ==================== 1. ຕັ້ງຄ່າຂໍ້ມູນ ແລະ Supabase ====================
const supabaseUrl = 'https://fxhmjhwhpbvtflrhsofq.supabase.co'; 
const supabaseKey = 'sb_publishable_sEN55L7TBNlWnsXd3_cnfg_6t3_p0w9'; 
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const CONFIG = {
    passcode: "1402",
    startDate: "2025-01-10"
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
        gsap.fromTo(showEl, { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 0.5, onComplete: () => { if(onCompleteCallback) onCompleteCallback(); } });
    }});
}

function openEnvelope() {
    document.querySelector('.envelope-wrapper').classList.add('open');
    setTimeout(() => { document.getElementById('start-btn').style.display = "block"; gsap.from('#start-btn', { y: 20, opacity: 0, duration: 0.5 }); }, 800);
}

// ==================== Stage 2: ປຸ່ມ No ແລ່ນໜີ ====================
const noBtn = document.getElementById('no-btn');
function runAway(e) {
    if(e) e.preventDefault();
    const newX = (Math.random() - 0.5) * 150; const newY = (Math.random() - 0.5) * 150;
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

// ==================== Stage 5: Supabase Gallery + ຂໍ້ຄວາມ ====================
async function loadGallery() {
    nextStage('#stage-timer', '#stage-gallery');
    const container = document.getElementById('tinder-cards');
    container.innerHTML = '<h3 style="margin-top: 50px; color: white;">ກຳລັງໂຫຼດຮູບ... ⏳</h3>';
    
    const { data, error } = await supabase.from('photos').select('*').order('created_at', { ascending: true });
    
    container.innerHTML = '';
    document.getElementById('gallery-controls').style.display = 'flex'; 

    if (error) { alert('ດຶງຂໍ້ມູນຜິດພາດ: ' + error.message); return; }

    if (data.length === 0) {
        container.innerHTML = '<p id="no-img-text" style="color:white; margin-top:50px; font-size:1.2rem;">ຍັງບໍ່ມີຮູບພາບເທື່ອ!<br>ກົດປຸ່ມເພີ່ມຮູບເລີຍ 👆</p>';
        document.getElementById('btn-to-scratch').style.display = 'block';
    } else {
        data.forEach((photo) => { createCard(photo, false); });
        setTimeout(initHammerSwipe, 500);
    }
}

function createCard(photoData, isNewUpload) {
    const noImg = document.getElementById('no-img-text');
    if(noImg) noImg.remove(); 

    const container = document.getElementById('tinder-cards');
    const card = document.createElement('div');
    card.className = 'tinder-card';
    card.dataset.id = photoData.id;
    card.dataset.url = photoData.image_url;
    
    // ດຶງຂໍ້ຄວາມມາສະແດງ (ຖ້າບໍ່ມີໃຫ້ເປັນຄ່າຫວ່າງ)
    const captionText = photoData.caption ? photoData.caption : "";
    
    // ຈັດໂຄງສ້າງຮູບແບບ Polaroid (ຮູບຢູ່ເທິງ ຂໍ້ຄວາມຢູ່ກ້ອງ)
    card.innerHTML = `
        <img src="${photoData.image_url}" draggable="false" onerror="this.src='https://via.placeholder.com/280x380?text=Error'">
        <p style="position: absolute; bottom: 12px; left: 0; width: 100%; text-align: center; margin: 0; font-family: 'Noto Sans Lao', sans-serif; font-size: 1.1rem; font-weight: 600; color: #590d22; padding: 0 10px; box-sizing: border-box;">
            ${captionText}
        </p>
    `;
    
    const rot = (Math.random() - 0.5) * 8; 
    card.style.transform = `rotate(${rot}deg)`;
    card.dataset.rot = rot;
    
    container.appendChild(card);

    if(isNewUpload) {
        gsap.from(card, { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(1.5)" });
        initHammerSwipe(); 
    }
}

function initHammerSwipe() {
    const cards = document.querySelectorAll('.tinder-card');
    if (cards.length === 0) {
        document.getElementById('btn-to-scratch').style.display = 'block';
        return;
    }

    const topCard = cards[cards.length - 1]; 
    const hammer = new Hammer(topCard);

    hammer.on('pan', (e) => {
        topCard.style.transition = 'none';
        const rotate = (e.deltaX * 0.05) + parseFloat(topCard.dataset.rot);
        topCard.style.transform = `translate(${e.deltaX}px, ${e.deltaY}px) rotate(${rotate}deg)`;
    });

    hammer.on('panend', (e) => {
        if (Math.abs(e.deltaX) > 80) { 
            topCard.style.transition = 'transform 0.4s ease-out';
            const goX = e.deltaX > 0 ? window.innerWidth : -window.innerWidth;
            topCard.style.transform = `translate(${goX}px, ${e.deltaY}px) rotate(${e.deltaX * 0.1}deg)`;
            setTimeout(() => { topCard.remove(); initHammerSwipe(); }, 300);
        } else { 
            topCard.style.transition = 'transform 0.3s ease';
            topCard.style.transform = `translate(0px, 0px) rotate(${topCard.dataset.rot}deg)`;
        }
    });
}

// --- ຟັງຊັນອັບໂຫຼດຮູບ + ໃຫ້ຂຽນຂໍ້ຄວາມ ---
async function uploadCard(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // ໃຫ້ຜູ້ໃຊ້ພິມຂໍ້ຄວາມຄວາມຊົງຈຳ ຫຼັງຈາກເລືອກຮູບແລ້ວ
    const userCaption = prompt("ພິມຄວາມຊົງຈຳສຳລັບຮູບນີ້ (ຖ້າບໍ່ມີໃຫ້ປະຫວ່າງໄວ້ແລ້ວກົດ OK):") || "";
    
    const label = document.getElementById('upload-label');
    label.innerText = '⏳ ກຳລັງໂຫຼດ...'; 
    
    const fileName = Date.now() + '_' + Math.random().toString(36).substring(7) + '.jpg';

    // 1. ອັບໂຫຼດເຂົ້າ Storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from('memories').upload(fileName, file);
    if (uploadError) { 
        alert('ອັບໂຫຼດບໍ່ສຳເລັດ: ' + uploadError.message); 
        label.innerText = '⬆️ ເພີ່ມຮູບ'; 
        event.target.value = '';
        return; 
    }

    // 2. ດຶງເອົາລິ້ງຮູບ
    const { data: publicUrlData } = supabase.storage.from('memories').getPublicUrl(fileName);
    const publicUrl = publicUrlData.publicUrl;

    // 3. ບັນທຶກລິ້ງຮູບ ພ້ອມກັບ ຂໍ້ຄວາມ (Caption) ລົງຖານຂໍ້ມູນ
    const { data: dbData, error: dbError } = await supabase.from('photos').insert([{ 
        image_url: publicUrl,
        caption: userCaption // ບັນທຶກຂໍ້ຄວາມລົງໄປພ້ອມ
    }]).select();
    
    if (dbError) { 
        alert('ບັນທຶກບໍ່ສຳເລັດ: ' + dbError.message); 
    } else {
        createCard(dbData[0], true);
        document.getElementById('btn-to-scratch').style.display = 'none'; 
    }
    
    label.innerText = '⬆️ ເພີ່ມຮູບ';
    event.target.value = ''; 
}

// --- ຟັງຊັນລຶບຮູບ ---
async function deleteCard() {
    const cards = document.querySelectorAll('.tinder-card');
    if (cards.length === 0) return;
    
    const confirmDel = confirm('ຕ້ອງການລຶບຮູບນີ້ແທ້ບໍ່?');
    if(!confirmDel) return;

    const topCard = cards[cards.length - 1];
    const id = topCard.dataset.id;
    const url = topCard.dataset.url;
    const fileName = url.split('/').pop(); 

    await supabase.from('photos').delete().eq('id', id);
    await supabase.storage.from('memories').remove([fileName]);
    
    gsap.to(topCard, { scale: 0, opacity: 0, duration: 0.3, onComplete: () => {
        topCard.remove();
        initHammerSwipe();
    }});
}

// --- ຟັງຊັນດາວໂຫຼດຮູບ ---
function downloadCard() {
    const cards = document.querySelectorAll('.tinder-card');
    if (cards.length === 0) return;
    const topCard = cards[cards.length - 1];
    const url = topCard.dataset.url;
    window.open(url, '_blank');
}

// ==================== Stage 6: Scratch Card ====================
function goToScratch() { nextStage('#stage-gallery', '#stage-scratch', () => { initScratch(); }); }

const scCanvas = document.getElementById('scratch-canvas');
const scCtx = scCanvas.getContext('2d');
const scWrapper = document.querySelector('.scratch-wrapper');

function initScratch() {
    scCanvas.width = scWrapper.offsetWidth; scCanvas.height = scWrapper.offsetHeight;
    scCtx.fillStyle = '#C0C0C0'; scCtx.fillRect(0, 0, scCanvas.width, scCanvas.height);
    scCtx.fillStyle = '#555'; scCtx.font = 'bold 20px Noto Sans Lao'; 
    scCtx.textAlign = 'center'; scCtx.fillText("ຂູດບ່ອນນີ້ເລີຍ!", scCanvas.width/2, scCanvas.height/2 + 8);
}

let isDrawing = false;
function scratch(x, y) {
    scCtx.globalCompositeOperation = 'destination-out';
    scCtx.beginPath(); scCtx.arc(x, y, 25, 0, Math.PI * 2); scCtx.fill();
    if(Math.random() > 0.96) confetti({ particleCount: 10, spread: 40, origin: { y: 0.8 } });
}
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