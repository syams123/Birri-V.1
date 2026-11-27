import {onAuthStateChanged,signOut,reload,getIdTokenResult} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {auth} from './firebase-config.js';
import {saveProfile,watchLogs,saveTask} from './firestore.js';
const $=id=>document.getElementById(id);let user,logs={},day='',tasks=[];let ready=false, unsubscribe=()=>{};
const dateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
function schedule(d){let a=[['waqiah','Al-Waqi’ah','Setelah Subuh','📖'],['mulk','Al-Mulk','Sebelum tidur','📖'],['hadis','Hadis Arbain','Minimal satu hadis','📚'],['sholawat','Sholawat Nabi','Target pribadi','♡'],['dzikir','Kalimat Thayyibah','Target pribadi','✦']];if(d.getDay()===5)a.splice(1,0,['kahfi','Al-Kahfi','Hari Jumat','📖']);if(d.getDay()===4)a.push(['yasin','Yasin','Malam Jumat','📖']);a.push(['shad','Shad','Opsional • sebelum tidur','📖',true]);return a;}
function render(){if(!user)return;let now=new Date();day=dateKey(now);tasks=schedule(now);$('date').textContent=now.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});let done=logs[day]||{};let required=tasks.filter(t=>!t[4]);let count=required.filter(t=>done[t[0]]).length;let pct=Math.round(100*count/required.length);$('fraction').textContent=`${count}/${required.length}`;$('percent').textContent=`${pct}%`;$('daily-bar').value=pct;let xp=Object.values(logs).reduce((sum,x)=>sum+Object.values(x).filter(v=>v===true).length*20,0);let level=1+Math.floor(xp/300);$('xp').textContent=xp.toLocaleString('id-ID');$('level').textContent=`Level ${level}`;$('level-short').textContent=`Lv. ${level}`;$('xp-label').textContent=`EXP ${xp%300} / 300`;$('xp-bar').value=xp%300;let streak=0;let d=new Date(now);if(!Object.values(logs[dateKey(d)]||{}).includes(true))d.setDate(d.getDate()-1);while(Object.values(logs[dateKey(d)]||{}).includes(true)){streak++;d.setDate(d.getDate()-1)}$('streak').textContent=streak;$('task-list').replaceChildren();for(const [id,title,sub,icon] of tasks){let label=document.createElement('label');label.className='task';let symbol=document.createElement('span');symbol.className='symbol';symbol.textContent=icon;let words=document.createElement('span');words.className='words';let b=document.createElement(id==='hadis'?'a':'b');b.textContent=title;if(id==='hadis'){b.href='./hadis.html';b.style.cssText='color:#245c40;font-weight:800;text-decoration:underline;text-underline-offset:3px';b.addEventListener('click',e=>e.stopPropagation());}let small=document.createElement('small');small.textContent=sub;words.append(b,small);let check=document.createElement('input');check.type='checkbox';check.checked=!!done[id];check.disabled=!ready;check.addEventListener('change',()=>{if(dateKey(new Date())!==day){render();return}check.disabled=true;saveTask(user.uid,day,id,check.checked).catch(e=>{console.error(e);$('status').textContent='Gagal menyimpan: '+(e.code||'error');render()})});label.append(symbol,words,check);$('task-list').append(label)}}
const menus=[['home','Beranda'],['quran','Al-Qur’an'],['amalan','Amalan'],['game','Game'],['profile','Profil']];function nav(active='home'){ $('nav').replaceChildren();for(const [id,title] of menus){let b=document.createElement('button');b.setAttribute('aria-label',title);if(id===active)b.setAttribute('aria-current','page');let img=document.createElement('img');img.alt=title;img.src=`assets/images/nav-${id}${id===active?'':'-inactive'}.webp`;b.append(img);b.onclick=()=>{if(id==='quran'){location.href='./quran.html';}else if(id==='profile'){ location.href='./profile.html';}else if(id==='amalan'){location.href='./amalan.html';}else if(id==='home'){ $('profile-panel').hidden=true;nav(id);if(id==='amalan')$('task-list').scrollIntoView({behavior:'smooth'});else window.scrollTo({top:0,behavior:'smooth'});}else alert('Halaman '+title+' akan dibuat pada tahap berikutnya.');};$('nav').append(b)}}nav();$('profile').onclick=()=>{ location.href='./profile.html';};
const requestedTab=new URLSearchParams(location.search).get('tab');if(['profile','amalan','game'].includes(requestedTab)){window.addEventListener('load',()=>{document.querySelector(`#nav button[aria-label="${menus.find(m=>m[0]===requestedTab)[1]}"]`)?.click()},{once:true});}
let authGeneration=0;
onAuthStateChanged(auth,async u=>{
 const generation=++authGeneration;
 unsubscribe();unsubscribe=()=>{};ready=false;logs={};user=null;
 if(!u){location.replace('./index.html');return}
 $('status').textContent='Memeriksa sesi dan verifikasi email…';
 $('task-list').replaceChildren();
 try {
   await reload(u);
   if(generation!==authGeneration||auth.currentUser?.uid!==u.uid)return;
   if(!u.emailVerified){location.replace('./verify-email.html');return}
   const token=await getIdTokenResult(u,true);
   if(generation!==authGeneration||auth.currentUser?.uid!==u.uid)return;
   if(token.claims.email_verified!==true){location.replace('./verify-email.html');return}
 } catch(e) {
   if(generation!==authGeneration)return;
   console.error('Sesi:',e);
   $('status').textContent='Gagal memperbarui sesi. Periksa internet lalu muat ulang halaman.';
   return;
 }
 user=u;
 $('name').textContent=(u.displayName||'Sahabat Birri')+' 👋';$('email').textContent=u.email||'';$('initial').textContent=(u.displayName||'B')[0];
 $('photo').hidden=true;$('initial').hidden=false;
 if(u.photoURL){$('photo').onload=()=>{$('photo').hidden=false;$('initial').hidden=true};$('photo').src=u.photoURL}
 $('status').textContent='Memuat progres…';render();
 saveProfile(u).catch(e=>{console.error('Profil:',e);});
 unsubscribe=watchLogs(u.uid,(data,meta)=>{if(generation!==authGeneration||user?.uid!==u.uid)return;logs=data;ready=!meta.fromCache||ready;$('status').textContent=meta.hasPendingWrites?'Menunggu sinkronisasi…':meta.fromCache?'Data cache • menunggu koneksi':'Progres tersinkron';render();},e=>{if(generation!==authGeneration)return;ready=false;console.error(e);$('status').textContent='Gagal memuat progres: '+(e.code||'error');render()});
},e=>{$('status').textContent='Sesi login gagal diperiksa.';console.error(e)});
$('logout').onclick=()=>signOut(auth).catch(()=>alert('Gagal keluar. Coba lagi.'));
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&user)render()});setInterval(()=>{if(user&&dateKey(new Date())!==day)render()},30000);
