import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyB_xkcJ87-E4jkYIDT2dBxOFJHUQvZxbU8",
    authDomain: "myblogcomments-22808.firebaseapp.com",
    projectId: "myblogcomments-22808",
    storageBucket: "myblogcomments-22808.firebasestorage.app",
    messagingSenderId: "1067155293144",
    appId: "1:1067155293144:web:8f10b016462b52d36628ad"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const BASE_PATH = 'blog_comments/pages/forum_v2_voted';

window.currentUser = null;
let allData = [];
let currentFilter = 'latest';

// ১. ডেটা লোড করা
onSnapshot(collection(db, BASE_PATH), (snapshot) => {
    allData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    render();
});

// ২. অথেনটিকেশন চেক
onAuthStateChanged(auth, (user) => {
    window.currentUser = user;
    const isUser = !!user;
    const wrapper = document.getElementById('user-info-wrapper');
    const loginUi = document.getElementById('login-ui');
    const fab = document.getElementById('fab-post');

    if(wrapper) wrapper.classList.toggle('hidden', !isUser);
    if(loginUi) loginUi.classList.toggle('hidden', isUser);
    
    if (isUser) {
        document.getElementById('user-avatar').src = user.photoURL;
        if(fab) fab.style.display = 'flex';
    } else {
        if(fab) fab.style.display = 'none';
    }
});

// ৩. রেন্ডার ফাংশন
window.render = () => {
    const container = document.getElementById('posts-container');
    if(!container) return;

    let posts = allData.filter(p => !p.parentId && p.status === 'approved');
    
    posts.sort((a, b) => currentFilter === 'popular' ? (b.votes || 0) - (a.votes || 0) : (b.at?.seconds || 0) - (a.at?.seconds || 0));

    if(posts.length === 0) {
        container.innerHTML = `<div class="p-20 text-center text-gray-400 text-sm">কোনো আলোচনা পাওয়া যায়নি</div>`;
        return;
    }

    container.innerHTML = posts.map(p => `
        <div class="forum-card flex gap-4 bg-white dark:bg-darkCard p-4 rounded-xl border dark:border-darkBorder shadow-sm transition-all" onclick="openDetails('${p.id}')">
            <div class="flex flex-col items-center gap-1 min-w-[30px]">
                <button onclick="event.stopPropagation();" class="vote-btn p-1 text-gray-400 hover:text-accent">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.781 2.375c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625l-8-10z"></path></svg>
                </button>
                <span class="text-xs font-bold text-gray-600 dark:text-gray-400">${p.votes || 0}</span>
                <button onclick="event.stopPropagation();" class="vote-btn p-1 text-gray-400 hover:text-red-500">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.941 11a1.001 1.001 0 0 0-.781-1.625H16V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v6.375H4a1.001 1.001 0 0 0-.781 1.625l8 10c.381.475 1.181.475 1.562 0l8-10z"></path></svg>
                </button>
            </div>

            <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                    <img src="${p.photoURL || 'https://via.placeholder.com/20'}" class="w-5 h-5 rounded-full border dark:border-gray-700">
                    <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">${p.name}</span>
                    <span class="text-[10px] text-gray-300">• কিছুক্ষণ আগে</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 bg-gray-100 dark:bg-darkBg rounded text-accent uppercase ml-auto">${p.category || 'General'}</span>
                </div>
                <h2 class="text-sm md:text-base leading-relaxed text-gray-800 dark:text-gray-200 font-medium line-clamp-3">
                    ${p.msg}
                </h2>
            </div>
        </div>`).join('');
};

// ৪. ফাংশনসমূহ
window.handleFabClick = () => {
    if(window.currentUser) window.location.href = 'create-post.html';
    else window.showToast('পোস্ট করতে লগইন করুন');
};

window.googleLogin = () => signInWithPopup(auth, provider);
window.googleLogout = () => signOut(auth).then(() => location.reload());

window.setFilter = (f) => { 
    currentFilter = f; 
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('filter-active'));
    const activeBtn = document.getElementById(`filter-${f}`);
    if(activeBtn) activeBtn.classList.add('filter-active');
    render(); 
};

window.openDetails = (id) => { window.location.href = `post.html?id=${id}`; };
window.openProfile = (uid) => { window.location.href = `profile.html?uid=${uid}`; };

window.toggleUserDropdown = (e) => { 
    e.stopPropagation(); 
    document.getElementById('user-dropdown').classList.toggle('dropdown-active'); 
};

window.closeAllDropdowns = () => {
    const dd = document.getElementById('user-dropdown');
    if(dd) dd.classList.remove('dropdown-active');
};

window.showToast = (msg) => {
