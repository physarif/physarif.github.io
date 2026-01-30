<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>আলোচনা ফোরাম</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.2/marked.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        darkBg: '#0b0e11',
                        darkCard: '#15191c',
                        darkBorder: '#2d333b',
                        accent: '#3498db',
                        featured: '#f1c40f',
                    }
                }
            }
        }
    </script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
        body { font-family: 'Hind Siliguri', sans-serif; transition: all 0.3s; }
        .forum-card { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); border-left: 3px solid transparent; }
        .forum-card:hover { border-left-color: #3498db; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .featured-card { border-left-color: #f1c40f !important; background: linear-gradient(to right, rgba(241, 196, 15, 0.08), transparent); }
        .view-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: none; z-index: 100; }
        .view-body { position: absolute; right: 0; top: 0; width: 100%; max-width: 650px; height: 100%; background: white; display: flex; flex-direction: column; animation: slideIn 0.3s ease-out; }
        .dark .view-body { background: #0b0e11; border-left: 1px solid #2d333b; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .fab-post { position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; background-color: #3498db; color: white; border-radius: 50%; display: none; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(52, 152, 219, 0.3); cursor: pointer; z-index: 90; transition: all 0.3s; }
        .filter-active { background-color: rgba(52, 152, 219, 0.1); color: #3498db; }
        .reply-node { margin-left: 2rem; border-left: 2px solid #3498db44; padding-left: 0.75rem; }
        .user-link:hover { text-decoration: underline; cursor: pointer; color: #3498db; }
        .dropdown-menu { display: none; position: absolute; right: 0; top: 100%; margin-top: 0.5rem; width: 160px; background: white; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 200; }
        .dark .dropdown-menu { background: #15191c; border-color: #2d333b; }
        .dropdown-active { display: block !important; }
    </style>
</head>
<body class="bg-gray-50 text-gray-900 dark:bg-darkBg dark:text-gray-100" onclick="closeAllDropdowns(event)">

<nav class="sticky top-0 z-50 bg-white/90 dark:bg-darkBg/90 backdrop-blur-md border-b dark:border-darkBorder">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-4">
            <h1 class="text-xl font-black text-accent tracking-tighter cursor-pointer" onclick="location.reload()">আলোচনা.</h1>
            <span id="admin-badge" class="hidden px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded uppercase">Admin</span>
        </div>
        
        <div class="flex items-center gap-2 relative">
            <div id="noti-wrapper" class="relative hidden">
                <button id="noti-trigger" onclick="toggleNotifications(event)" class="p-2 rounded-xl bg-gray-100 dark:bg-darkCard hover:ring-2 ring-accent transition-all relative">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    <span id="noti-badge" class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-darkCard hidden"></span>
                </button>
                <div id="notification-dropdown" class="absolute right-0 mt-2 w-72 bg-white dark:bg-darkCard border dark:border-darkBorder rounded-2xl shadow-2xl z-[100] hidden">
                    <div class="p-3 border-b dark:border-darkBorder flex items-center justify-between">
                        <span class="text-xs font-black uppercase">নোটিফিকেশন</span>
                        <button onclick="clearAllNotifications()" class="text-[10px] text-accent font-bold hover:underline">সব মুছুন</button>
                    </div>
                    <div id="noti-list" class="max-h-80 overflow-y-auto"></div>
                </div>
            </div>

            <button id="theme-toggle" class="p-2 rounded-xl bg-gray-100 dark:bg-darkCard hover:ring-2 ring-accent transition-all">
                <svg id="theme-icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"></svg>
            </button>

            <div id="auth-section" class="relative">
                <button id="login-ui" onclick="googleLogin()" class="bg-accent text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-accent/20">Login</button>
                
                <!-- Logged in UI -->
                <div id="user-info-wrapper" class="hidden flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-darkCard transition-all" onclick="toggleUserDropdown(event)">
                    <span id="display-name" class="hidden md:inline text-xs font-bold text-gray-600 dark:text-gray-300"></span>
                    <img id="user-avatar" class="w-8 h-8 rounded-lg border-2 border-accent">
                    
                    <!-- Dropdown Menu -->
                    <div id="user-dropdown" class="dropdown-menu overflow-hidden">
                        <button onclick="openProfile(currentUser.uid)" class="w-full text-left px-4 py-3 text-xs font-bold hover:bg-gray-50 dark:hover:bg-darkBg flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            আমার প্রোফাইল
                        </button>
                        <hr class="dark:border-darkBorder">
                        <button onclick="googleLogout()" class="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            লগ আউট
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</nav>

<main class="max-w-6xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
    <aside class="w-full lg:w-56">
        <div class="sticky top-20 space-y-1">
            <div class="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                <button id="filter-latest" onclick="setFilter('latest')" class="filter-active flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left w-full whitespace-nowrap">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    সর্বশেষ
                </button>
                <button id="filter-popular" onclick="setFilter('popular')" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left w-full whitespace-nowrap">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    জনপ্রিয়
                </button>
                <button id="filter-featured" onclick="setFilter('featured')" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left w-full whitespace-nowrap">
                    <svg class="w-4 h-4 text-featured" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                    ফিচারড
                </button>

                <div id="auth-filters" class="hidden flex lg:flex-col gap-1 w-full">
                    <button id="filter-bookmarks" onclick="setFilter('bookmarks')" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left w-full whitespace-nowrap">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                        বুকমার্কস
                    </button>
                    <button id="filter-pending" onclick="setFilter('pending')" class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left w-full whitespace-nowrap relative">
                        <div class="flex items-center gap-3">
                            <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                            পেন্ডিং
                        </div>
                        <span id="pending-badge" class="hidden bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold"></span>
                    </button>
                </div>
            </div>
        </div>
    </aside>

    <section class="flex-1 space-y-3">
        <div id="posts-container" class="space-y-3">
            <div class="flex justify-center py-20"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div></div>
        </div>
    </section>
</main>

<div id="details-view" class="view-overlay" onclick="if(event.target.id === 'details-view') closeView()">
    <div class="view-body" onclick="event.stopPropagation()">
        <div class="p-3 border-b dark:border-darkBorder flex items-center justify-between sticky top-0 bg-white dark:bg-darkBg z-10">
            <div class="flex items-center gap-1">
                <button onclick="closeView()" class="p-2 hover:bg-gray-100 dark:hover:bg-darkCard rounded-lg">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <span class="font-bold text-sm">বিস্তারিত আলোচনা</span>
            </div>
            <div class="flex items-center gap-2">
                <button id="admin-delete-btn" onclick="adminDeletePost()" class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg hidden">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
                <button id="admin-feature-btn" onclick="adminToggleFeature()" class="p-2 text-featured hover:bg-yellow-50 dark:hover:bg-yellow-900/10 rounded-lg hidden">
                    <svg id="feature-icon-svg" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                </button>
                <button id="bookmark-btn" onclick="toggleBookmark()" class="p-2 hover:bg-gray-100 dark:hover:bg-darkCard rounded-lg text-gray-400 hidden">
                    <svg id="bookmark-icon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                </button>
            </div>
        </div>
        <div id="details-content" class="flex-1 overflow-y-auto p-5 pb-24"></div>
        <div id="reply-input-section" class="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-darkCard border-t dark:border-darkBorder hidden">
            <div id="reply-tag-ui" class="hidden items-center justify-between px-3 py-1 bg-gray-100 dark:bg-darkBg text-[10px] rounded-t-lg">
                <span class="text-accent italic" id="replying-to-text"></span>
                <button onclick="cancelReplyTag()" class="text-red-500 font-bold">×</button>
            </div>
            <div class="flex gap-2">
                <input id="reply-input" type="text" placeholder="মতামত দিন..." class="flex-1 bg-gray-50 dark:bg-darkBg border dark:border-darkBorder rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 ring-accent">
                <button onclick="postReply()" class="bg-accent text-white px-5 py-2 rounded-lg text-xs font-bold">পাঠান</button>
            </div>
        </div>
    </div>
</div>

<div id="profile-view" class="view-overlay" onclick="if(event.target.id === 'profile-view') closeProfile()">
    <div class="view-body" onclick="event.stopPropagation()">
        <div class="p-3 border-b dark:border-darkBorder flex items-center justify-between sticky top-0 bg-white dark:bg-darkBg z-10">
            <button onclick="closeProfile()" class="p-2 hover:bg-gray-100 dark:hover:bg-darkCard rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <span class="font-bold text-sm">প্রোফাইল</span>
            <div class="w-9"></div>
        </div>
        <div id="profile-content" class="flex-1 overflow-y-auto p-5"></div>
    </div>
</div>

<div id="fab-post" class="fab-post" onclick="togglePostModal(true)">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path></svg>
</div>

<div id="post-modal-overlay" class="fixed inset-0 bg-black/70 z-[200] hidden items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-white dark:bg-darkCard w-full max-w-lg rounded-2xl p-5 shadow-2xl">
        <h2 class="text-lg font-black mb-4 text-center">নতুন আলোচনা</h2>
        <textarea id="user-comment" placeholder="আপনার মনের কথা লিখুন..." class="w-full bg-gray-50 dark:bg-darkBg border dark:border-darkBorder rounded-xl px-4 py-3 h-48 outline-none focus:ring-2 ring-accent resize-none text-base"></textarea>
        <div class="flex justify-end pt-3 gap-2">
            <button onclick="togglePostModal(false)" class="px-6 py-2.5 rounded-full text-sm font-bold text-gray-500">বাতিল</button>
            <button onclick="submitPost()" class="bg-accent text-white px-8 py-2.5 rounded-full font-bold shadow-lg text-sm">পাবলিশ</button>
        </div>
    </div>
</div>

<div id="toast" class="fixed top-16 left-1/2 -translate-x-1/2 z-[300] bg-darkCard text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl opacity-0 transition-opacity pointer-events-none"></div>

<script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
    import { getFirestore, collection, addDoc, doc, setDoc, updateDoc, deleteDoc, increment, onSnapshot, serverTimestamp, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
    import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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
    const BOOKMARKS_PATH = 'blog_comments/pages/bookmarks';
    const NOTI_PATH = 'blog_comments/pages/notifications';
    const ADMIN_EMAIL = "phys.arif@gmail.com";

    window.currentUser = null;
    window.isAdmin = false;
    let allData = [];
    let activeThreadId = null;
    let currentFilter = 'latest';
    let userBookmarks = [];
    let userNotis = [];
    let replyingToId = null;
    let replyingToName = null;

    onSnapshot(collection(db, BASE_PATH), (snapshot) => {
        allData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        render();
        updateBadges();
        if(activeThreadId) updateDetails();
    });

    onAuthStateChanged(auth, (user) => {
        window.currentUser = user;
        window.isAdmin = user?.email === ADMIN_EMAIL;
        
        const isUser = !!user;
        document.getElementById('user-info-wrapper').classList.toggle('hidden', !isUser);
        document.getElementById('login-ui').classList.toggle('hidden', isUser);
        document.getElementById('admin-badge').classList.toggle('hidden', !isAdmin);
        document.getElementById('noti-wrapper').classList.toggle('hidden', !isUser);
        document.getElementById('auth-filters').classList.toggle('hidden', !isUser);
        document.getElementById('fab-post').style.display = isUser ? 'flex' : 'none';
        document.getElementById('bookmark-btn').classList.toggle('hidden', !isUser);
        document.getElementById('reply-input-section').classList.toggle('hidden', !isUser);

        if (isUser) {
            document.getElementById('user-avatar').src = user.photoURL;
            document.getElementById('display-name').innerText = user.displayName.split(' ')[0]; // Show first name only
            onSnapshot(doc(db, BOOKMARKS_PATH, user.uid), (docSnap) => {
                userBookmarks = docSnap.exists() ? (docSnap.data().postIds || []) : [];
                updateBookmarkIcon();
                if(currentFilter === 'bookmarks') render();
            });
            onSnapshot(collection(db, NOTI_PATH, user.uid, 'items'), (snap) => {
                userNotis = snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => (b.at?.seconds || 0) - (a.at?.seconds || 0));
                renderNotifications();
            });
        }
        render();
    });

    window.googleLogin = async () => { try { await signInWithPopup(auth, provider); } catch(e){} };
    
    window.googleLogout = async () => { 
        if(!confirm('আপনি কি লগ আউট করতে চান?')) return;
        try { 
            await signOut(auth); 
            location.reload(); // Refresh to clear states
        } catch(e){} 
    };

    window.toggleUserDropdown = (e) => {
        e.stopPropagation();
        document.getElementById('user-dropdown').classList.toggle('dropdown-active');
        document.getElementById('notification-dropdown').classList.add('hidden'); // Close other
    };

    window.closeAllDropdowns = (e) => {
        document.getElementById('user-dropdown').classList.remove('dropdown-active');
        if (!e.target.closest('#noti-trigger') && !e.target.closest('#notification-dropdown')) {
            document.getElementById('notification-dropdown').classList.add('hidden');
        }
    };

    window.setFilter = (filter) => {
        currentFilter = filter;
        document.querySelectorAll('aside button').forEach(btn => btn.classList.remove('filter-active'));
        document.getElementById(`filter-${filter}`).classList.add('filter-active');
        render();
    };

    window.toggleNotifications = (e) => {
        e.stopPropagation();
        const drop = document.getElementById('notification-dropdown');
        drop.classList.toggle('hidden');
        document.getElementById('user-dropdown').classList.remove('dropdown-active'); // Close other
        if(!drop.classList.contains('hidden')) markNotisAsRead();
    };

    async function markNotisAsRead() {
        if(!currentUser) return;
        document.getElementById('noti-badge').classList.add('hidden');
        userNotis.forEach(async (n) => {
            if(!n.read) await updateDoc(doc(db, NOTI_PATH, currentUser.uid, 'items', n.id), { read: true });
        });
    }

    async function addNotification(targetUserId, senderName, senderPhoto, postId, postText, type) {
        if(!targetUserId || targetUserId === currentUser.uid) return;
        await addDoc(collection(db, NOTI_PATH, targetUserId, 'items'), {
            senderName, senderPhoto, postId, postSnippet: postText.substring(0, 30) + '...',
            type, read: false, at: serverTimestamp()
        });
    }

    function renderNotifications() {
        const list = document.getElementById('noti-list');
        const badge = document.getElementById('noti-badge');
        const unreadCount = userNotis.filter(n => !n.read).length;
        badge.classList.toggle('hidden', unreadCount === 0);
        if(userNotis.length === 0) {
            list.innerHTML = `<div class="p-8 text-center text-gray-400 text-[10px]">কোনো নোটিফিকেশন নেই</div>`;
            return;
        }
        list.innerHTML = userNotis.map(n => `
            <div onclick="openFromNoti('${n.postId}')" class="p-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-darkBg border-b dark:border-darkBorder cursor-pointer ${!n.read ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''}">
                <img src="${n.senderPhoto}" class="w-8 h-8 rounded-lg">
                <div class="flex-1">
                    <p class="text-[11px] leading-snug"><span class="font-bold">${n.senderName}</span> ${n.type === 'reply' ? 'আপনার কমেন্টে উত্তর দিয়েছেন' : 'আপনার পোস্টে কমেন্ট করেছেন'}</p>
                    <p class="text-[8px] text-accent font-bold mt-1">${formatTime(n.at)}</p>
                </div>
            </div>`).join('');
    }

    window.openFromNoti = (postId) => {
        document.getElementById('notification-dropdown').classList.add('hidden');
        openDetails(postId);
    };

    window.clearAllNotifications = async () => {
        if(!currentUser) return;
        for (const n of userNotis) {
            await deleteDoc(doc(db, NOTI_PATH, currentUser.uid, 'items', n.id));
        }
    };

    function updateBadges() {
        const pCount = allData.filter(p => !p.parentId && p.status === 'pending').length;
        const pBadge = document.getElementById('pending-badge');
        if(pBadge) {
            pBadge.innerText = toBN(pCount); 
            pBadge.classList.toggle('hidden', !isAdmin || pCount === 0);
        }
    }

    window.submitPost = async () => {
        const msg = document.getElementById('user-comment').value.trim();
        if(!msg || !currentUser) return;
        await addDoc(collection(db, BASE_PATH), {
            name: currentUser.displayName, msg, parentId: null, votes: 0,
            photoURL: currentUser.photoURL, userId: currentUser.uid, at: serverTimestamp(),
            status: isAdmin ? 'approved' : 'pending', isFeatured: false
        });
        showToast(isAdmin ? 'পাবলিশ হয়েছে' : 'অনুমোদনের অপেক্ষায়...');
        togglePostModal(false);
        document.getElementById('user-comment').value = '';
    };

    window.postReply = async () => {
        const rawMsg = document.getElementById('reply-input').value.trim();
        if(!rawMsg || !currentUser || !activeThreadId) return;
        const parentPost = allData.find(d => d.id === activeThreadId);
        await addDoc(collection(db, BASE_PATH), {
            name: currentUser.displayName, msg: rawMsg, 
            parentId: activeThreadId, replyToId: replyingToId || null,
            replyToName: replyingToName || null,
            photoURL: currentUser.photoURL, userId: currentUser.uid, at: serverTimestamp()
        });
        if(replyingToId) {
            const targetComment = allData.find(d => d.id === replyingToId);
            if(targetComment) addNotification(targetComment.userId, currentUser.displayName, currentUser.photoURL, activeThreadId, rawMsg, 'reply');
        } else {
            addNotification(parentPost.userId, currentUser.displayName, currentUser.photoURL, activeThreadId, rawMsg, 'comment');
        }
        document.getElementById('reply-input').value = '';
        cancelReplyTag();
    };

    window.openProfile = (uid) => {
        const userDocs = allData.filter(d => d.userId === uid);
        const user = userDocs.length > 0 ? userDocs[0] : { name: 'ইউজার', photoURL: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' };
        const userPosts = userDocs.filter(d => !d.parentId);
        const userComments = userDocs.filter(d => d.parentId);
        const totalVotes = userPosts.reduce((acc, curr) => acc + (curr.votes || 0), 0);
        document.getElementById('profile-content').innerHTML = `
            <div class="flex flex-col items-center mb-8">
                <img src="${user.photoURL}" class="w-20 h-20 rounded-2xl mb-4 border-2 border-accent">
                <h2 class="text-xl font-black">${user.name}</h2>
                <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">${uid === ADMIN_EMAIL ? 'Admin' : 'Member'}</p>
            </div>
            <div class="grid grid-cols-3 gap-3 mb-8">
                <div class="bg-gray-50 dark:bg-darkCard p-4 rounded-xl text-center border dark:border-darkBorder">
                    <div class="text-lg font-black text-accent">${toBN(userPosts.length)}</div>
                    <div class="text-[9px] text-gray-400 font-bold uppercase">আলোচনা</div>
                </div>
                <div class="bg-gray-50 dark:bg-darkCard p-4 rounded-xl text-center border dark:border-darkBorder">
                    <div class="text-lg font-black text-accent">${toBN(userComments.length)}</div>
                    <div class="text-[9px] text-gray-400 font-bold uppercase">মন্তব্য</div>
                </div>
                <div class="bg-gray-50 dark:bg-darkCard p-4 rounded-xl text-center border dark:border-darkBorder">
                    <div class="text-lg font-black text-accent">${toBN(totalVotes)}</div>
                    <div class="text-[9px] text-gray-400 font-bold uppercase">ভোট</div>
                </div>
            </div>
            <div class="space-y-3">
                ${userPosts.slice(0, 10).map(p => `<div onclick="closeProfile(); openDetails('${p.id}')" class="p-3 bg-white dark:bg-darkCard border dark:border-darkBorder rounded-xl cursor-pointer hover:border-accent"><p class="text-xs font-semibold line-clamp-2">${p.msg}</p><span class="text-[9px] text-gray-400 font-bold">${formatTime(p.at)}</span></div>`).join('') || '<p class="text-center text-gray-400 text-xs py-10">কোনো আলোচনা নেই</p>'}
            </div>`;
        document.getElementById('profile-view').style.display = 'block';
    };

    window.closeProfile = () => { document.getElementById('profile-view').style.display = 'none'; };

    // --- Admin Actions ---
    window.adminApprovePost = async (id) => {
        if(!isAdmin) return;
        await updateDoc(doc(db, BASE_PATH, id), { status: 'approved' });
        showToast('অ্যাপ্রুভ করা হয়েছে');
    };

    window.adminDeletePost = async (id = activeThreadId) => {
        if(!isAdmin || !confirm('আপনি কি নিশ্চিত যে এই আলোচনাটি মুছতে চান?')) return;
        await deleteDoc(doc(db, BASE_PATH, id));
        showToast('মুছে ফেলা হয়েছে');
        if(id === activeThreadId) closeView();
    };

    window.adminToggleFeature = async () => {
        if(!isAdmin || !activeThreadId) return;
        const post = allData.find(d => d.id === activeThreadId);
        await updateDoc(doc(db, BASE_PATH, activeThreadId), { isFeatured: !post.isFeatured });
        showToast(post.isFeatured ? 'ফিচার থেকে সরানো হয়েছে' : 'ফিচার করা হয়েছে');
    };

    window.adminDeleteComment = async (id) => {
        if(!isAdmin || !confirm('এই মন্তব্যটি মুছতে চান?')) return;
        await deleteDoc(doc(db, BASE_PATH, id));
        showToast('মন্তব্য মোছা হয়েছে');
    };

    function render() {
        const container = document.getElementById('posts-container');
        let posts = allData.filter(c => !c.parentId);
        
        if(currentFilter === 'pending') posts = posts.filter(p => p.status === 'pending');
        else if(currentFilter === 'featured') posts = posts.filter(p => p.status === 'approved' && p.isFeatured === true);
        else if(currentFilter === 'bookmarks') posts = posts.filter(p => userBookmarks.includes(p.id));
        else posts = posts.filter(p => p.status === 'approved');

        if(currentFilter === 'popular') posts.sort((a, b) => (b.votes || 0) - (a.votes || 0));
        else posts.sort((a, b) => (b.at?.seconds || 0) - (a.at?.seconds || 0));

        if(posts.length === 0) { container.innerHTML = `<div class="p-20 text-center text-gray-400 text-sm">কিছু পাওয়া যায়নি</div>`; return; }

        container.innerHTML = posts.map(c => `
            <div class="forum-card bg-white dark:bg-darkCard p-4 rounded-xl border ${c.isFeatured ? 'featured-card border-featured' : 'dark:border-darkBorder'}">
                <div class="flex gap-4">
                    <div class="flex flex-col items-center gap-2 bg-gray-50 dark:bg-darkBg p-2 rounded-lg min-w-[42px] h-fit">
                        <button onclick="handleVote('${c.id}', 1)" class="text-gray-400 hover:text-accent transition-colors"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.781 2.375c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 004 14h4v7a1 1 0 001 1h6a1 1 0 001-1v-7h4a1.001 1.001 0 00.781-1.625l-8-10z"/></svg></button>
                        <span class="font-bold text-xs text-accent leading-none">${toBN(c.votes || 0)}</span>
                        <button onclick="handleVote('${c.id}', -1)" class="text-gray-400 hover:text-red-500 transition-colors"><svg class="w-5 h-5 rotate-180" fill="currentColor" viewBox="0 0 24 24"><path d="M12.781 2.375c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 004 14h4v7a1 1 0 001 1h6a1 1 0 001-1v-7h4a1.001 1.001 0 00.781-1.625l-8-10z"/></svg></button>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center justify-between mb-1 text-[10px] font-bold text-gray-400 uppercase">
                            <div class="flex items-center gap-2">
                                <img src="${c.photoURL}" class="w-4 h-4 rounded-full cursor-pointer" onclick="openProfile('${c.userId}')">
                                <span class="user-link" onclick="openProfile('${c.userId}')">${c.name}</span>
                                <span> • ${formatTime(c.at)}</span>
                            </div>
                            ${isAdmin && c.status === 'pending' ? `
                                <div class="flex gap-2 text-[10px]">
                                    <button onclick="adminApprovePost('${c.id}')" class="text-green-500 lowercase hover:underline">[Approve]</button>
                                    <button onclick="adminDeletePost('${c.id}')" class="text-red-500 lowercase hover:underline">[Delete]</button>
                                </div>
                            ` : ''}
                        </div>
                        <div class="cursor-pointer" onclick="openDetails('${c.id}')">
                            <h2 class="text-sm font-semibold mb-2 line-clamp-3 text-gray-800 dark:text-gray-200 leading-relaxed">${c.msg}</h2>
                        </div>
                    </div>
                </div>
            </div>`).join('');
    }

    function updateDetails() {
        const post = allData.find(c => c.id === activeThreadId);
        if(!post) return;
        
        // Update Admin Buttons in header
        document.getElementById('admin-delete-btn').classList.toggle('hidden', !isAdmin);
        document.getElementById('admin-feature-btn').classList.toggle('hidden', !isAdmin);
        const featureIcon = document.getElementById('feature-icon-svg');
        featureIcon.setAttribute('fill', post.isFeatured ? 'currentColor' : 'none');

        const allReplies = allData.filter(r => r.parentId === activeThreadId).sort((a,b) => (a.at?.seconds || 0) - (b.at?.seconds || 0));
        const rootComments = allReplies.filter(r => !r.replyToId);
        const renderComment = (comment, isReply = false) => {
            const nestedReplies = allReplies.filter(r => r.replyToId === comment.id);
            return `
                <div class="${isReply ? 'reply-node' : 'mb-4'}">
                    <div class="flex gap-3">
                        <img src="${comment.photoURL}" class="w-8 h-8 rounded-lg cursor-pointer" onclick="openProfile('${comment.userId}')">
                        <div class="bg-gray-100 dark:bg-darkCard p-3 rounded-xl border dark:border-darkBorder text-xs flex-1">
                            <div class="flex justify-between items-start mb-1">
                                <div class="font-bold text-[10px] user-link" onclick="openProfile('${comment.userId}')">${comment.name}</div>
                                <div class="flex gap-2">
                                    ${isAdmin ? `<button onclick="adminDeleteComment('${comment.id}')" class="text-red-400 text-[9px] font-bold">Delete</button>` : ''}
                                    ${currentUser ? `<button onclick="prepareReply('${comment.id}', '${comment.name}')" class="text-accent text-[9px] font-bold">উত্তর দিন</button>` : ''}
                                </div>
                            </div>
                            <div class="text-gray-700 dark:text-gray-300 text-[11px] leading-relaxed">
                                ${comment.replyToName ? `<span class="text-accent font-bold mr-1 cursor-pointer" onclick="openProfile('${allData.find(u => u.id === comment.replyToId)?.userId}')">@${comment.replyToName}</span>` : ''}
                                ${DOMPurify.sanitize(marked.parse(comment.msg))}
                            </div>
                        </div>
                    </div>
                    ${nestedReplies.map(nr => renderComment(nr, true)).join('')}
                </div>`;
        };
        document.getElementById('details-content').innerHTML = `
            <div class="mb-6">
                <div class="flex items-center gap-3 mb-4">
                    <img src="${post.photoURL}" class="w-10 h-10 rounded-lg cursor-pointer" onclick="openProfile('${post.userId}')">
                    <div>
                        <div class="font-black text-sm user-link" onclick="openProfile('${post.userId}')">${post.name} ${post.isFeatured ? '⭐' : ''}</div>
                        <div class="text-[10px] text-gray-400 uppercase">${formatTime(post.at)}</div>
                    </div>
                </div>
                <div class="text-base mb-6 border-b dark:border-darkBorder pb-6 whitespace-pre-line text-gray-800 dark:text-gray-200">${DOMPurify.sanitize(marked.parse(post.msg))}</div>
                <div class="space-y-4">${rootComments.map(rc => renderComment(rc)).join('')}</div>
            </div>`;
    }

    window.prepareReply = (id, userName) => { replyingToId = id; replyingToName = userName; const tagUi = document.getElementById('reply-tag-ui'); const tagText = document.getElementById('replying-to-text'); tagText.innerText = `${userName} কে উত্তর দিচ্ছেন`; tagUi.classList.remove('hidden'); document.getElementById('reply-input').focus(); };
    window.cancelReplyTag = () => { replyingToId = null; replyingToName = null; document.getElementById('reply-tag-ui').classList.add('hidden'); };
    window.handleVote = async (id, val) => { if(!currentUser) return googleLogin(); await updateDoc(doc(db, BASE_PATH, id), { votes: increment(val) }); };
    
    window.openDetails = (id) => { activeThreadId = id; cancelReplyTag(); document.getElementById('details-view').style.display = 'block'; updateDetails(); updateBookmarkIcon(); };
    window.closeView = () => { document.getElementById('details-view').style.display = 'none'; activeThreadId = null; };

    window.togglePostModal = (show) => { document.getElementById('post-modal-overlay').style.display = show ? 'flex' : 'none'; };
    window.showToast = (msg) => { const t = document.getElementById('toast'); t.innerText = msg; t.style.opacity = '1'; setTimeout(() => t.style.opacity = '0', 3000); };

    window.toggleBookmark = async () => { 
        if (!currentUser) return;
        const exists = userBookmarks.includes(activeThreadId);
        const newList = exists ? userBookmarks.filter(id => id !== activeThreadId) : [...userBookmarks, activeThreadId];
        await setDoc(doc(db, BOOKMARKS_PATH, currentUser.uid), { postIds: newList });
        showToast(exists ? 'বুকমার্ক সরানো হয়েছে' : 'বুকমার্ক করা হয়েছে');
    };

    function updateBookmarkIcon() { const icon = document.getElementById('bookmark-icon'); const btn = document.getElementById('bookmark-btn'); if(!icon || !activeThreadId) return; const isBookmarked = userBookmarks.includes(activeThreadId); icon.setAttribute('fill', isBookmarked ? 'currentColor' : 'none'); btn.classList.toggle('text-accent', isBookmarked); btn.classList.toggle('text-gray-400', !isBookmarked); }

    const toBN = (n) => n.toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);
    function formatTime(ts) { if(!ts) return 'এখন'; const s = Math.floor((new Date() - new Date(ts.seconds * 1000))/1000); if(s < 60) return 'এইমাত্র'; if(s < 3600) return toBN(Math.floor(s/60)) + 'মি আগে'; if(s < 86400) return toBN(Math.floor(s/3600)) + 'ঘন্টা আগে'; return new Date(ts.seconds*1000).toLocaleDateString('bn-BD', {day:'numeric', month:'short'}); }

    const setDarkMode = (dark) => {
        document.documentElement.classList.toggle('dark', dark);
        localStorage.theme = dark ? 'dark' : 'light';
        const icon = document.getElementById('theme-icon');
        if(icon) {
            icon.innerHTML = dark ? '<path d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2"></path>' : '<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke="currentColor" stroke-width="2"></path>';
        }
    };
    setDarkMode(localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches));
    document.getElementById('theme-toggle').onclick = () => setDarkMode(!document.documentElement.classList.contains('dark'));
</script>
</body>
</html>

