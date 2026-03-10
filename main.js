let currentService = 'Views';
let currentQuantity = 100;

// ================= WEBHOOKS =================

const WEBHOOKS = {

Views: "https://discord.com/api/webhooks/1460526355140841503/BnX3LBBwVKkfaTx149s2ONIhD180dC0o05J1Mwt4YD8-TSw00f9KU6jlAZ3cZkzAYf8L",

Tim: "https://discord.com/api/webhooks/1460526481687183500/D36MPIS_-s1_Gkskd9aMldQRX8u-xseRF7ApH-cOlAYrZqRTKtdCO8j8WKDikgzUd7lu",

Favourite: "https://discord.com/api/webhooks/1460526571185242196/GHbnDe1lYECwPz9czdRQM66hzUSr60BTPnbguJ2yHvc-JijD0jXWtemciU5ZSPi09MGX",

RobloxFollow: "https://discord.com/api/webhooks/1460526661937401866/wGuVhuXYk8lOF1XGZXWDT4Pr6B53XDIw00rcE9BQcfxwX_mGbJxkI2iBk2qOr5ndO5fm"

};

const COOLDOWN_TIME = 5 * 60 * 1000;

// ================= INIT =================

document.addEventListener('DOMContentLoaded', () => {

initTyping();
initStats();
checkCooldown();

});

// ================= VALIDATION =================

function isValidTikTokLink(url){

try{

const u = new URL(url);
const host = u.hostname.toLowerCase();
const path = u.pathname.toLowerCase();

if(host.includes("tiktok.com")){

if(path.includes("/video/")) return true;

if(path.includes("/photo/")) return true;

if(path.startsWith("/t/")) return true;

}

if(host.includes("vt.tiktok.com")) return true;
if(host.includes("vm.tiktok.com")) return true;

return false;

}catch{

return false;

}

}

// ================= CHECK VIDEO =================

async function checkTikTokVideo(url){

try{

const api = "https://www.tiktok.com/oembed?url="+encodeURIComponent(url);

const res = await fetch(api);

if(!res.ok) return false;

const data = await res.json();

if(!data.title) return false;

return true;

}catch{

return false;

}

}

// ================= MODAL =================

function openServiceModal(name,qty){

currentService = name;
currentQuantity = qty;

const modal = document.getElementById('tiktokModal');
const title = document.getElementById('modal-service-name-main');
const instruction = document.getElementById('modal-instruction');
const input = document.getElementById('tiktok-link');

input.value="";

title.innerText = `Dịch vụ ${name}`;
instruction.innerText = `Nhận ${qty} miễn phí`;

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

return Swal.fire({
title:'Thiếu thông tin',
text:'Vui lòng nhập link',
icon:'warning'
});

}

if(!isValidTikTokLink(value)){

return Swal.fire({
title:'Link không hợp lệ',
text:'Không phải link TikTok',
icon:'error'
});

}

const loading = document.getElementById('loadingOverlay');

loading.classList.add('active');

const exists = await checkTikTokVideo(value);

if(!exists){

loading.classList.remove('active');

return Swal.fire({
title:'Video không hợp lệ',
text:'Video có thể bị riêng tư hoặc bị xóa',
icon:'error'
});

}

const payload = {

username:"TikTok System",

embeds:[{

title:`🚀 ORDER ${currentService}`,

color:16111914,

fields:[

{name:"Service",value:currentService,inline:true},

{name:"Quantity",value:currentQuantity.toString(),inline:true},

{name:"Link",value:value}

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

const expire = Date.now()+COOLDOWN_TIME;

localStorage.setItem('tiktok_cooldown',expire);

Swal.fire({

icon:'success',
title:'Thành công',
text:'Đã gửi yêu cầu'

});

closeModal('tiktokModal');

startCooldownTimer(expire);

}catch{

Swal.fire({

title:'Lỗi',
text:'Không thể kết nối webhook',
icon:'error'

});

}finally{

loading.classList.remove('active');

}

}

// ================= COOLDOWN =================

function startCooldownTimer(exp){

const btn = document.getElementById('btnSubmit');

const tick=()=>{

const remain = exp-Date.now();

if(remain<=0){

btn.disabled=false;
btn.innerText='Gửi';

return;

}

btn.disabled=true;

btn.innerText=`Chờ ${Math.ceil(remain/1000)}s`;

setTimeout(tick,1000);

};

tick();

}

// ================= EFFECTS =================

function initTyping(){

const el=document.querySelector('.typing-text');

if(!el)return;

const words=[

"TikTok Views",
"TikTok Likes",
"TikTok Favourite"

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

// ================= STATS =================

function initStats(){

setInterval(()=>{

const online=document.getElementById('online-users');

if(online)
online.innerText=Math.floor(Math.random()*50)+120;

},5000);

}

// ================= CHECK COOLDOWN =================

function checkCooldown(){

const exp=localStorage.getItem('tiktok_cooldown');

if(exp && Date.now()<exp)
startCooldownTimer(parseInt(exp));

}
