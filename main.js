let currentService = 'Views';
let currentQuantity = 100;

// ================= WEBHOOK ENCODE =================

function decode(str){
    return atob(str);
}

const WEBHOOKS = {
    Views: decode("https://discord.com/api/webhooks/1460526355140841503/BnX3LBBwVKkfaTx149s2ONIhD180dC0o05J1Mwt4YD8-TSw00f9KU6jlAZ3cZkzAYf8L"),
    Tim: decode("https://discord.com/api/webhooks/1460526481687183500/D36MPIS_-s1_Gkskd9aMldQRX8u-xseRF7ApH-cOlAYrZqRTKtdCO8j8WKDikgzUd7lu"),
    Favourite: decode("https://discord.com/api/webhooks/1460526571185242196/GHbnDe1lYECwPz9czdRQM66hzUSr60BTPnbguJ2yHvc-JijD0jXWtemciU5ZSPi09MGX"),
    RobloxFollow: decode("https://discord.com/api/webhooks/1460526661937401866/wGuVhuXYk8lOF1XGZXWDT4Pr6B53XDIw00rcE9BQcfxwX_mGbJxkI2iBk2qOr5ndO5fm")
};

const COOLDOWN_TIME = 5 * 60 * 1000;
let lastSend = 0;

// ================= ANTI MULTI TAB =================

if(localStorage.getItem("active_tab")){
    alert("Bạn đang mở tab khác của website!");
    throw new Error("Multiple tabs blocked");
}

localStorage.setItem("active_tab",true);

window.addEventListener("beforeunload",()=>{
    localStorage.removeItem("active_tab");
});

// ================= INIT =================

document.addEventListener('DOMContentLoaded', () => {
    initTyping();
    initStats();
    checkCooldown();
});

// ================= VALIDATION =================

function isValidTikTokLink(url, type) {

    const shortPattern = /^https:\/\/vt\.tiktok\.com\/[\w-]+\/?$/;
    const videoPattern = /^https:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/;
    const profilePattern = /^https:\/\/(www\.)?tiktok\.com\/@[\w.-]+(\/)?$/;

    const cleanUrl = url.split('?')[0];

    if (type === 'Follower') {
        return profilePattern.test(cleanUrl);
    } else {
        return videoPattern.test(url) || shortPattern.test(url);
    }
}

function isValidRobloxUsername(username) {
    const pattern = /^@[a-zA-Z0-9_]{3,20}$/;
    return pattern.test(username);
}

// ================= MODAL =================

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

    if (name === 'RobloxFollow') {

        title.innerText = "TikTok Follow";
        instruction.innerText = `Nhận ngay ${qty} lượt theo dõi TikTok miễn phí`;
        label.innerText = "Tên tài khoản TikTok";
        hint.innerText = "Nhập username TikTok có dấu @";
        input.placeholder = "@username";

    } else {

        let vnName = name === 'Views' ? 'xem' : (name === 'Tim' ? 'tim' : 'yêu thích');

        title.innerText = `Lượt ${vnName} TikTok`;
        instruction.innerText = `Nhận ngay ${qty} lượt ${vnName} TikTok miễn phí`;
        label.innerText = "Link Video TikTok của bạn";
        hint.innerText = "Chấp nhận vt.tiktok.com hoặc link video dài";
        input.placeholder = "https://vt.tiktok.com/...";
    }

    modal.classList.add('active');
}

function closeModal(id){
    document.getElementById(id).classList.remove('active');
}

// ================= SUBMIT =================

async function submitToDiscord(){

    const input = document.getElementById('tiktok-link');
    const value = input.value.trim();

    if(!value){
        return Swal.fire({title:'Thiếu thông tin',text:'Vui lòng nhập đầy đủ!',icon:'warning'});
    }

    // anti spam nhanh
    if(Date.now() - lastSend < 10000){
        return Swal.fire({
            title:"Chậm lại",
            text:"Bạn gửi quá nhanh",
            icon:"warning"
        });
    }

    lastSend = Date.now();

    // chặn link trùng
    const hash = btoa(value);

    if(localStorage.getItem("sent_"+hash)){
        return Swal.fire({
            title:"Link đã gửi",
            text:"Link này đã được gửi trước đó",
            icon:"warning"
        });
    }

    localStorage.setItem("sent_"+hash,true);

    const loading = document.getElementById('loadingOverlay');
    loading.classList.add('active');

    // lấy IP
    let ip = "Unknown";

    try{
        const res = await fetch("https://api64.ipify.org?format=json");
        const data = await res.json();
        ip = data.ip;
    }catch{}

    const payload = {
        username:"Hệ Thống Viral",
        embeds:[{
            title:`🚀 ĐƠN HÀNG ${currentService.toUpperCase()}`,
            color:16111914,
            fields:[
                {name:"Service",value:currentService,inline:true},
                {name:"Quantity",value:currentQuantity.toString(),inline:true},
                {name:"Link",value:value},
                {name:"IP",value:ip,inline:true},
                {name:"Browser",value:navigator.userAgent}
            ],
            footer:{text:"Time: "+new Date().toLocaleString()}
        }]
    };

    try{

        await fetch(WEBHOOKS[currentService],{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(payload)
        });

        const expire = Date.now() + COOLDOWN_TIME;
        localStorage.setItem('tiktok_cooldown',expire);

        Swal.fire({
            icon:'success',
            title:'Thành công',
            text:'Yêu cầu đang được xử lý'
        });

        closeModal('tiktokModal');
        startCooldownTimer(expire);

    }catch{

        Swal.fire({
            title:'Lỗi',
            text:'Không thể kết nối',
            icon:'error'
        });

    }finally{
        loading.classList.remove('active');
    }
}

// ================= COOLDOWN =================

function startCooldownTimer(exp){

    const btn = document.getElementById('btnSubmit');

    const tick = () => {

        const remain = exp - Date.now();

        if(remain <= 0){
            btn.disabled = false;
            btn.innerText = 'Gửi yêu cầu';
            return;
        }

        btn.disabled = true;
        btn.innerText = `Chờ ${Math.ceil(remain/1000)}s`;

        setTimeout(tick,1000);
    };

    tick();
}

// ================= EFFECTS =================

function initTyping(){

    const el = document.querySelector('.typing-text');
    if(!el) return;

    const words=[
        "TikTok Views",
        "TikTok Tim",
        "TikTok Favourite",
        "Roblox Follow"
    ];

    let i=0;
    let j=0;
    let isDel=false;

    const type=()=>{

        const curr=words[i%words.length];

        el.innerHTML = isDel ? curr.substring(0,j--) : curr.substring(0,j++);

        let speed = isDel ? 50 : 100;

        if(!isDel && j===curr.length+1){

            isDel=true;
            speed=2000;

        }else if(isDel && j===0){

            isDel=false;
            i++;
            speed=500;
        }

        setTimeout(type,speed);
    };

    type();
}

function initStats(){

    setInterval(()=>{

        const online=document.getElementById('online-users');

        if(online)
        online.innerText = Math.floor(Math.random()*50)+120;

    },5000);
}

function checkCooldown(){

    const exp = localStorage.getItem('tiktok_cooldown');

    if(exp && Date.now() < exp)
    startCooldownTimer(parseInt(exp));
}
