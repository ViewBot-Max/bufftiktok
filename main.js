let currentService = 'Views';
let currentQuantity = 100;

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1459513490082365494/6sANPpkT-VjNS9vajuGsGiyLyQfa68X-g0TVtY5IFFRUbqB0hcZTu6Zez5IFR9GqU0Ve";
const COOLDOWN_TIME = 5 * 60 * 1000;

document.addEventListener('DOMContentLoaded', () => {
    initTyping();
    initStats();
    checkCooldown();
});

// HÀM KIỂM TRA LINK - ĐÃ THÊM HỖ TRỢ vt.tiktok.com
function isValidTikTokLink(url, type) {
    // Regex cho link rút gọn (vt.tiktok.com)
    const shortPattern = /^https:\/\/vt\.tiktok\.com\/[\w-]+\/?$/;
    // Regex cho link dài (tiktok.com/@user/video/...)
    const videoPattern = /^https:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/;
    // Regex cho link profile
    const profilePattern = /^https:\/\/(www\.)?tiktok\.com\/@[\w.-]+(\/)?$/;
    
    const cleanUrl = url.split('?')[0];

    if (type === 'Follower') {
        // Tăng follow chỉ chấp nhận link Profile dài
        return profilePattern.test(cleanUrl);
    } else {
        // View, Tim, Fav chấp nhận cả link dài HOẶC link rút gọn vt.tiktok.com
        return videoPattern.test(url) || shortPattern.test(url);
    }
}

function openServiceModal(name, qty) {
    currentService = name;
    currentQuantity = qty;

    const modal = document.getElementById('tiktokModal');
    const title = document.getElementById('modal-service-name-main');
    const instruction = document.getElementById('modal-instruction');
    const label = document.getElementById('input-label');
    const hint = document.getElementById('input-hint-desc');
    const input = document.getElementById('tiktok-link');

    input.value = ""; 

    if (name === 'Follower') {
        title.innerText = "Lượt theo dõi TikTok";
        instruction.innerText = `Nhận ngay ${qty} lượt theo dõi TikTok miễn phí`;
        label.innerText = "Link Profile TikTok của bạn";
        hint.innerText = "Dán liên kết Profile TikTok của bạn vào đây.";
        input.placeholder = "tiktok.com/@username";
    } else {
        let vnName = name === 'Views' ? 'xem' : (name === 'Tim' ? 'tim' : 'yêu thích');
        title.innerText = `Lượt ${vnName} TikTok`;
        instruction.innerText = `Nhận ngay ${qty} lượt ${vnName} TikTok miễn phí`;
        label.innerText = "Link Video TikTok của bạn";
        hint.innerText = "Chấp nhận link vt.tiktok.com hoặc link video dài.";
        input.placeholder = "https://vt.tiktok.com/ZS.../";
    }

    modal.classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

async function submitToDiscord() {
    const linkInput = document.getElementById('tiktok-link');
    const url = linkInput.value.trim();

    if (!url) {
        return Swal.fire({ title: 'Thiếu thông tin', text: 'Vui lòng dán link TikTok!', icon: 'warning' });
    }

    if (!isValidTikTokLink(url, currentService)) {
        let errorMsg = currentService === 'Follower' 
            ? 'Sai định dạng! Dùng link Profile dài (Ví dụ: https://www.tiktok.com/@username)' 
            : 'Sai định dạng! Chấp nhận link vt.tiktok.com hoặc link video dài.';
        return Swal.fire({ title: 'Link không hợp lệ', text: errorMsg, icon: 'error' });
    }

    const loading = document.getElementById('loadingOverlay');
    loading.classList.add('active');

    const payload = {
        username: "Hệ Thống ViralTikTok",
        embeds: [{
            title: "🚀 ĐƠN HÀNG MỚI (HỖ TRỢ LINK VT)",
            color: 16111914,
            fields: [
                { name: "Dịch vụ", value: "Tăng " + currentService, inline: true },
                { name: "Số lượng", value: currentQuantity.toString(), inline: true },
                { name: "Liên kết", value: "```" + url + "```" }
            ],
            footer: { text: "Yêu cầu lúc: " + new Date().toLocaleString() }
        }]
    };

    try {
        const res = await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const expire = Date.now() + COOLDOWN_TIME;
            localStorage.setItem('tiktok_cooldown', expire);
            Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Yêu cầu của bạn đang được xử lý.' });
            closeModal('tiktokModal');
            startCooldownTimer(expire);
        }
    } catch (e) {
        Swal.fire({ title: 'Lỗi', text: 'Không thể kết nối!', icon: 'error' });
    } finally {
        loading.classList.remove('active');
    }
}

// Giữ nguyên các hàm phụ phía dưới
function startCooldownTimer(exp) {
    const btn = document.getElementById('btnSubmit');
    const tick = () => {
        const remain = exp - Date.now();
        if (remain <= 0) {
            btn.disabled = false;
            btn.innerText = `Gửi ý kiến`;
            return;
        }
        btn.disabled = true;
        btn.innerText = `Chờ ${Math.ceil(remain / 1000)}s...`;
        setTimeout(tick, 1000);
    };
    tick();
}

function initTyping() {
    const el = document.querySelector('.typing-text');
    if(!el) return;
    const words = ["TikTok Views", "TikTok Tim", "TikTok Follower", "TikTok Favourite"];
    let i = 0, j = 0, isDel = false;
    const type = () => {
        const curr = words[i % words.length];
        el.innerHTML = isDel ? curr.substring(0, j--) : curr.substring(0, j++);
        let speed = isDel ? 50 : 100;
        if (!isDel && j === curr.length + 1) { isDel = true; speed = 2000; }
        else if (isDel && j === 0) { isDel = false; i++; speed = 500; }
        setTimeout(type, speed);
    };
    type();
}

function initStats() {
    setInterval(() => {
        const online = document.getElementById('online-users');
        if(online) online.innerText = Math.floor(Math.random() * 50) + 120;
    }, 5000);
}

function checkCooldown() {
    const exp = localStorage.getItem('tiktok_cooldown');
    if (exp && Date.now() < exp) startCooldownTimer(parseInt(exp));
}

function showStatusModal(e) { e.preventDefault(); Swal.fire({ title: 'Trạng thái', text: 'Hệ thống: Hoạt động ổn định ✅', icon: 'success' }); }
function showTermsModal(e) { e.preventDefault(); Swal.fire({ title: 'Điều khoản', text: 'Mỗi lượt gửi cách nhau 5 phút.', icon: 'info' }); }