import {auth} from './firebase-config.js';
import {GoogleAuthProvider,signInWithPopup,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,updateProfile,sendEmailVerification,sendPasswordResetEmail,signOut,reload,getIdTokenResult} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
const $=id=>document.getElementById(id),page=document.body.dataset.page;
let busy=false, initialized=false;
const status=$('status');
function say(t,error=false){status.textContent=t;status.classList.toggle('error',error)}
function controls(){document.querySelectorAll('button:not(.eye)').forEach(b=>b.disabled=busy||!initialized)}
function go(path){location.replace('./'+path+'.html')}
async function route(u){
 if(!u){if(page==='verify-email')go('login');return}
 await reload(u);
 if(auth.currentUser?.uid!==u.uid)return;
 if(u.emailVerified){
   const token=await getIdTokenResult(u,true);
   if(auth.currentUser?.uid!==u.uid)return;
   if(token.claims.email_verified!==true)throw new Error('Email token not verified');
   go('dashboard');
 }else if(page!=='verify-email')go('verify-email');
 else $('user-email').textContent=u.email||'';
}
const messages={'auth/invalid-email':'Alamat email tidak valid.','auth/invalid-credential':'Email atau kata sandi tidak sesuai.','auth/wrong-password':'Email atau kata sandi tidak sesuai.','auth/user-not-found':'Email atau kata sandi tidak sesuai.','auth/email-already-in-use':'Tidak dapat membuat akun dengan email tersebut. Coba masuk atau reset kata sandi.','auth/weak-password':'Kata sandi belum memenuhi ketentuan keamanan.','auth/password-does-not-meet-requirements':'Kata sandi belum memenuhi kebijakan keamanan Firebase.','auth/too-many-requests':'Terlalu banyak percobaan. Tunggu beberapa saat.','auth/network-request-failed':'Periksa koneksi internet.','auth/operation-not-allowed':'Metode masuk belum diaktifkan di Firebase.','auth/popup-blocked':'Izinkan pop-up di browser lalu coba lagi.','auth/popup-closed-by-user':'Jendela Google Login ditutup.','auth/unauthorized-domain':'Domain ini belum diizinkan di Firebase.','auth/account-exists-with-different-credential':'Gunakan metode masuk yang sebelumnya dipakai untuk akun ini.','auth/user-disabled':'Akun tidak dapat digunakan. Hubungi pengelola.'};
async function run(fn){if(busy||!initialized)return;busy=true;controls();say('Sedang memproses…');try{await fn()}catch(e){console.error(e.code||e.name);say(messages[e.code]||'Proses gagal. Silakan coba lagi.',true)}finally{busy=false;controls()}}
controls();onAuthStateChanged(auth,u=>{initialized=true;controls();if(!busy&&u)run(()=>route(u));else if(!busy&&page==='verify-email')go('login')},()=>{say('Sesi tidak dapat diperiksa. Muat ulang halaman.',true)});
document.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>{const f=$(b.dataset.toggle),show=f.type==='password';f.type=show?'text':'password';b.textContent=show?'Sembunyikan':'Lihat';b.setAttribute('aria-label',show?'Sembunyikan kata sandi':'Tampilkan kata sandi')});
const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});
$('google-login')?.addEventListener('click',()=>run(async()=>{const r=await signInWithPopup(auth,provider);await route(r.user)}));
const actionSettings={url:new URL('./verify-email.html',location.href).href};
$('auth-form')?.addEventListener('submit',e=>{e.preventDefault();run(async()=>{const email=$('email').value.trim();if(page==='login'){const r=await signInWithEmailAndPassword(auth,email,$('password').value);await route(r.user)}else if(page==='register'){
 const name=$('name').value.trim(),password=$('password').value;if(!name){say('Isi nama lengkap.',true);return}if(password.length<8||password!==$('confirm').value){say('Kata sandi minimal 8 karakter dan konfirmasinya harus sama.',true);return}if(!$('consent').checked)return;
 const r=await createUserWithEmailAndPassword(auth,email,password);
 try{await updateProfile(r.user,{displayName:name})}catch(e){console.error('Profil:',e.code)}
 try{await sendEmailVerification(r.user,actionSettings);sessionStorage.setItem('birri-verify-message','Email verifikasi telah dikirim.')}catch(e){try{sessionStorage.setItem('birri-verify-message','Akun berhasil dibuat, tetapi email belum terkirim. Gunakan Kirim ulang email.')}catch{}}
 go('verify-email');
 }else if(page==='forgot-password'){try{await sendPasswordResetEmail(auth,email)}catch(e){if(e.code!=='auth/user-not-found')throw e}say('Jika email terdaftar, tautan reset akan dikirim. Periksa kotak masuk atau spam.');}})});
if(page==='verify-email'){
 try{const msg=sessionStorage.getItem('birri-verify-message');if(msg){say(msg);sessionStorage.removeItem('birri-verify-message')}}catch{}
 $('check-email').onclick=()=>run(async()=>{const u=auth.currentUser;if(!u){go('login');return}await reload(u);if(u.emailVerified)await route(u);else say('Email belum terverifikasi. Buka tautan pada email terlebih dahulu.',true)});
 $('resend').onclick=()=>run(async()=>{const u=auth.currentUser;if(!u){go('login');return}await reload(u);if(u.emailVerified){await route(u);return}await sendEmailVerification(u,actionSettings);say('Email verifikasi dikirim. Periksa juga folder spam.')});
 $('logout').onclick=()=>run(async()=>{await signOut(auth);go('index')});
}
