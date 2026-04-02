// ==================== 1. Setup Supabase ====================
// ໃຊ້ window object ເພື່ອປ້ອງກັນ Error redeclaration
if (typeof window.supabaseClient === 'undefined') {
    const supabaseUrl = 'https://fxhmjhwhpbvtflrhsofq.supabase.co';
    const supabaseKey = 'sb_publishable_sEN55L7TBNlWnsXd3_cnfg_6t3_p0w9';
    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
}

const CONFIG = { 
    passcode: "5700", 
    startDate: "2026-01-10" 
};

// ==================== 2. ເອົາຮູບ 6 ໃບມາລອຍ (ແກ້ໄຂແລ້ວ 100%) ====================
const cvs = document.getElementById('heart-canvas');
const ctx = cvs.getContext('2d');
let hearts = [];

// 💡 ໂຫຼດຮູບທັງ 6 ໄຟລ໌ໃຫ້ຖືກຕ້ອງ (ໃຊ້ Array ເກັບຮູບ)
const heartImages = [];
for (let i = 1; i <= 6; i++) {
    let img = new Image();
    img.src = `${i}.png`; // ມັນຈະດຶງຮູບ 1.png, 2.png, 3.png ໄປຈົນຮອດ 6.png ອັດຕະໂນມັດ
    heartImages.push(img);
}

if (cvs) {
    function resize() { cvs.width = window.innerWidth; cvs.height = window.innerHeight; }
    window.addEventListener('resize', resize); resize();

    class HeartPro {
        constructor() { this.reset(true); }
        reset(initial = false) {
            this.x = Math.random() * cvs.width;
            this.y = initial ? Math.random() * cvs.height : cvs.height + 100;
            
            // ປັບຂະໜາດຮູບ (ປັບຕົວເລກ 0.1 ຫາ 0.3 ໄດ້ຖ້າຢາກໃຫ້ໃຫຍ່/ນ້ອຍລົງ)
            this.size = Math.random() * 0.15 + 0.1; 
            
            this.speedY = Math.random() * 1.5 + 0.8;
            this.speedX = (Math.random() - 0.5) * 1.5;
            this.angle = Math.random() * 360;
            this.spinSpeed = (Math.random() - 0.5) * 1.5;
            
            // 💡 ສຸ່ມເລືອກຮູບ 1 ໃບ ຈາກທັງໝົດ 6 ໃບ ມາສະແດງ
            this.image = heartImages[Math.floor(Math.random() * heartImages.length)];
        }
        update() {
            this.y -= this.speedY;
            this.x += Math.sin(this.y * 0.01) * this.speedX;
            this.angle += this.spinSpeed;
            if (this.y < -100) this.reset();
        }
        draw() {
            // ຖ້າຮູບຍັງໂຫຼດບໍ່ສຳເລັດ ບໍ່ຕ້ອງແຕ້ມ
            if (!this.image.complete) return; 

            ctx.save(); 
            ctx.translate(this.x, this.y); 
            ctx.rotate(this.angle * Math.PI / 180); 
            ctx.scale(this.size, this.size);
            
            // ສັ່ງເອົາຮູບມາແຕ້ມລົງ Canvas
            ctx.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);
            
            ctx.restore();
        }
    }
    
    // ຈຳນວນຮູບທີ່ຢາກໃຫ້ລອຍ (ປະມານ 30 ກຳລັງງາມ)
    for (let i = 0; i < 30; i++) hearts.push(new HeartPro()); 
    
    function animate() { 
        ctx.clearRect(0, 0, cvs.width, cvs.height); 
        hearts.forEach(h => { h.update(); h.draw(); }); 
        requestAnimationFrame(animate); 
    }
    animate();
}

// ==================== 3. Navigation Logic ====================
function openEnvelope() {
    document.querySelector('.envelope-wrapper').classList.add('open');
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, shapes: ['heart'] });
    setTimeout(() => {
        const btn = document.getElementById('start-btn');
        btn.style.display = "block";
        gsap.from(btn, { y: 40, opacity: 0, scale: 0.5, duration: 1, ease: "elastic.out(1, 0.5)" });
    }, 800);
}

function nextStage(hideId, showId, onComplete) {
    const hideEl = document.querySelector(hideId);
    const showEl = document.querySelector(showId);
    let tl = gsap.timeline({ onComplete: () => { hideEl.classList.add('hidden'); if (onComplete) onComplete(); } });
    tl.to(hideEl.children, { y: -20, opacity: 0, stagger: 0.05, duration: 0.3 })
      .to(hideEl, { scale: 0.9, opacity: 0, duration: 0.3 }, "-=0.2")
      .add(() => { showEl.classList.remove('hidden'); })
      .fromTo(showEl, { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 0.5 })
      .fromTo(showEl.children, { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5 }, "-=0.2");
}

// Passcode Logic
let inputPass = "";
function pressKey(n) {
    if (inputPass.length < 4) {
        inputPass += n; updateDots();
        gsap.fromTo(event.target, {scale: 0.8}, {scale: 1, duration: 0.2});
        if (inputPass.length === 4) {
            if (inputPass === CONFIG.passcode) {
                confetti({ particleCount: 180 });
                setTimeout(() => { nextStage('#stage-passcode', '#stage-timer'); startTimer(); }, 600);
            } else {
                gsap.to('.passcode-dots', { x: 12, repeat: 5, yoyo: true, duration: 0.05 });
                inputPass = ""; setTimeout(updateDots, 500);
            }
        }
    }
}
function clearKey() { inputPass = inputPass.slice(0, -1); updateDots(); }
function updateDots() { document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i < inputPass.length)); }

// Timer Logic (ສົມບູນ)
function startTimer() {
    const start = new Date(CONFIG.startDate).getTime();
    setInterval(() => {
        const diff = Date.now() - start;
        document.getElementById('days').innerText = Math.floor(diff / 86400000);
        document.getElementById('hours').innerText = Math.floor((diff / 3600000) % 24);
        document.getElementById('minutes').innerText = Math.floor((diff / 60000) % 60);
        document.getElementById('seconds').innerText = Math.floor((diff / 1000) % 60);
    }, 1000);
}

// ==================== 4. Gallery Looping Swipe Logic ====================
let currentHammer = null;

async function loadGallery() {
    nextStage('#stage-timer', '#stage-gallery');
    document.getElementById('gallery-controls').style.display = "flex";
    document.getElementById('btn-to-scratch').style.display = "block";

    const container = document.getElementById('tinder-cards');
    container.innerHTML = '<p style="color:white; margin-top:100px;">ກຳລັງໂຫຼດຄວາມຊົງຈຳ... 💖</p>';

    const { data } = await window.supabaseClient.from('photos').select('*').order('created_at', { ascending: true });
    container.innerHTML = '';
    
    if (data && data.length > 0) {
        data.forEach(p => createCard(p));
        // Reset ຕຳແໜ່ງໃຫ້ຢູ່ກາງທຸກໃບ
        gsap.set('.tinder-card', { x: 0, y: 0, opacity: 1 });
        initHammer();
    } else {
        container.innerHTML = '<p style="color:white; margin-top:80px;">ຍັງບໍ່ມີຮູບພາບເທື່ອ... 👆</p>';
    }
}

function createCard(p) {
    const card = document.createElement('div');
    card.className = 'tinder-card'; card.dataset.id = p.id;
    
    // 💡 ລະບົບປັບຂະໜາດໂຕໜັງສືອັດຕະໂນມັດ ຕາມຄວາມຍາວຂອງຂໍ້ຄວາມ
    let text = p.caption ? p.caption : 'you a mine';
    let fSize = '1.5rem'; // ຂະໜາດປົກກະຕິ (ສຳລັບຂໍ້ຄວາມສັ້ນໆ)
    
    if (text.length > 80) {
        fSize = '0.9rem'; // ຖ້າພິມຍາວຫຼາຍ (ກາຍ 80 ຕົວອັກສອນ) ໃຫ້ນ້ອຍລົງສຸດ
    } else if (text.length > 35) {
        fSize = '1.15rem'; // ຖ້າພິມຍາວກາງໆ ໃຫ້ນ້ອຍລົງໜ້ອຍໜຶ່ງ
    }

    // ເອົາຂະໜາດທີ່ຄຳນວນໄດ້ ມາໃສ່ໃນ <p>
    const captionHtml = `<p style="font-size: ${fSize};">${text}</p>`;
    card.innerHTML = `<img src="${p.image_url}" draggable="false">${captionHtml}`;
    
    gsap.set(card, { rotation: (Math.random() - 0.5) * 8 });
    document.getElementById('tinder-cards').appendChild(card);
}

function initHammer() {
    const container = document.getElementById('tinder-cards');
    const cards = container.querySelectorAll('.tinder-card');
    if (!cards.length) return;

    // ທຳລາຍ Hammer Instance ເກົ່າຖ້າມີ
    if (currentHammer) currentHammer.destroy();

    const topCard = cards[cards.length - 1];
    currentHammer = new Hammer(topCard);

    currentHammer.on('pan', (e) => {
        const rotate = e.deltaX / 15;
        topCard.style.transform = `translate(${e.deltaX}px, ${e.deltaY}px) rotate(${rotate}deg)`;
        topCard.style.transition = 'none';
    });

    currentHammer.on('panend', (e) => {
        const threshold = 120;
        const keep = Math.abs(e.deltaX) < threshold && Math.abs(e.velocityX) < 0.5;

        if (!keep) {
            const moveOutWidth = document.body.clientWidth;
            const endX = e.deltaX > 0 ? moveOutWidth : -moveOutWidth;

            gsap.to(topCard, {
                x: endX, opacity: 0, rotation: e.deltaX / 5, duration: 0.4,
                onComplete: () => {
                    // Looping: ຍ້າຍໄປໄວ້ທາງລຸ່ມສຸດຂອງ Stack (prepend ໃນ DOM)
                    container.prepend(topCard);
                    gsap.set(topCard, { x: 0, y: 0, rotation: (Math.random() - 0.5) * 10, opacity: 1 });
                    initHammer(); // ເລີ່ມຕົ້ນກັບໃບໃໝ່ທີ່ຢູ່ເທິງສຸດ
                }
            });
        } else {
            gsap.to(topCard, { x: 0, y: 0, rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.6)" });
        }
    });
}

// Gallery Actions
// ແທນທີ່ຟັງຊັນ uploadCard ອັນເກົ່າດ້ວຍອັນນີ້
async function uploadCard(e) {
    const file = e.target.files[0];
    if (!file) return;
    const cap = prompt("ຂຽນຄວາມຊົງຈຳ:");
    if (cap === null) return;
    
    const label = document.getElementById('upload-label');
    const originalText = label.innerHTML; 
    label.innerText = "⏳ ກຳລັງໂຫຼດ...";
    
    // 💡 ວິທີແກ້: ດຶງເອົານາມສະກຸນໄຟລ໌ແທ້ໆຂອງຮູບ ແລະ ບອກປະເພດໄຟລ໌ໃຫ້ Supabase ຮູ້
    const ext = file.name.split('.').pop();
    const name = `${Date.now()}.${ext}`;
    
    try {
        // ເພີ່ມການຕັ້ງຄ່າ contentType
        await window.supabaseClient.storage.from('memories').upload(name, file, {
            contentType: file.type,
            upsert: false
        });
        
        const { data: url } = window.supabaseClient.storage.from('memories').getPublicUrl(name);
        
        // ບັນທຶກລົງຖານຂໍ້ມູນ
        await window.supabaseClient.from('photos').insert([{ image_url: url.publicUrl, caption: cap }]);
        
        loadGallery();
    } catch (err) { 
        alert("Error: " + err.message); 
    } finally { 
        label.innerHTML = originalText; 
    }
}

async function deleteCard() {
    const cards = document.querySelectorAll('.tinder-card');
    if (!cards.length || !confirm("ລຶບຮູບນີ້ບໍ?")) return;
    const top = cards[cards.length - 1];
    await window.supabaseClient.from('photos').delete().eq('id', top.dataset.id);
    top.remove(); initHammer();
}

function downloadCard() {
    const cards = document.querySelectorAll('.tinder-card');
    if (!cards.length) return;
    window.open(cards[cards.length - 1].querySelector('img').src, '_blank');
}

// ==================== 5. Scratch Card Logic (Clean) ====================
function goToScratch() { nextStage('#stage-gallery', '#stage-scratch', initScratch); }
function initScratch() {
    const sc = document.getElementById('scratch-canvas');
    const sctx = sc.getContext('2d');
    sc.width = sc.parentNode.offsetWidth; sc.height = sc.parentNode.offsetHeight;
    let grad = sctx.createLinearGradient(0, 0, sc.width, sc.height);
    grad.addColorStop(0, '#D3D3D3'); grad.addColorStop(0.5, '#A9A9A9'); grad.addColorStop(1, '#D3D3D3');
    sctx.fillStyle = grad; sctx.fillRect(0, 0, sc.width, sc.height);
    sctx.fillStyle = "#555"; sctx.font = "bold 20px 'Noto Sans Lao'"; sctx.textAlign = "center";
    sctx.fillText("✨ ຂູດລຸ້ນຄວາມໃນໃຈ ✨", sc.width/2, sc.height/2);
    sctx.globalCompositeOperation = 'destination-out';
    const scratch = (x, y) => { sctx.beginPath(); sctx.arc(x, y, 35, 0, 6.28); sctx.fill(); };
    const getPos = (e) => { const rect = sc.getBoundingClientRect(); const cx = e.touches ? e.touches[0].clientX : e.clientX; const cy = e.touches ? e.touches[0].clientY : e.clientY; return { x: cx - rect.left, y: cy - rect.top }; };
    sc.addEventListener('mousemove', (e) => { if(e.buttons === 1) scratch(getPos(e).x, getPos(e).y); });
    sc.addEventListener('touchmove', (e) => { e.preventDefault(); scratch(getPos(e).x, getPos(e).y); }, {passive: false});
}

// No Button Interaction
const noBtn = document.getElementById('no-btn');
if (noBtn) { noBtn.addEventListener('mouseenter', () => { gsap.to(noBtn, { x: (Math.random()-0.5)*250, y: (Math.random()-0.5)*250, duration: 0.2 }); }); }