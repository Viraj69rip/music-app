/**
 * AURORA MUSIC v5.0 — Premium Streaming UI
 * JioSaavn 320kbps · Full-Length Songs · All Pages
 */
'use strict';

/* ── CryptoJS DES (minimal for decryption) ──── */
const _cryptoReady = new Promise((resolve) => {
    if (window.CryptoJS) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js';
    s.onload = () => resolve();
    s.onerror = () => {
        const s2 = document.createElement('script');
        s2.src = 'https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/crypto-js.js';
        s2.onload = () => resolve();
        s2.onerror = () => resolve();
        document.head.appendChild(s2);
    };
    document.head.appendChild(s);
});

const SAAVN_KEY = '38346591';

function decryptUrl(encUrl) {
    if (!encUrl || !window.CryptoJS) return '';
    try {
        const key = CryptoJS.enc.Utf8.parse(SAAVN_KEY);
        const decrypted = CryptoJS.DES.decrypt(
            { ciphertext: CryptoJS.enc.Base64.parse(encUrl) },
            key,
            { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
        );
        let url = decrypted.toString(CryptoJS.enc.Utf8);
        url = url.replace('_96.mp4', '_320.mp4').replace('_96.m4a', '_320.m4a');
        url = url.replace('http:', 'https:');
        return url;
    } catch (e) { return ''; }
}

/* ── Utilities ──────────────────────────────── */
function fmtDuration(secs) {
    if (!secs || secs <= 0) return '';
    secs = parseInt(secs);
    return `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;
}

/* ── Demo Fallback ──────────────────────────── */
const DEMO_COLORS = [['#38bdf8', '#7dd3fc'], ['#6c5ce7', '#a29bfe'], ['#00b894', '#55efc4'], ['#0984e3', '#74b9ff'], ['#e17055', '#fab1a0'], ['#fdcb6e', '#ffeaa7'], ['#d63031', '#ff7675'], ['#00cec9', '#81ecec'], ['#e84393', '#fd79a8'], ['#2d3436', '#636e72']];
function genArt(title, i) {
    const [c1, c2] = DEMO_COLORS[i % DEMO_COLORS.length];
    const l = (title || 'M')[0].toUpperCase();
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect fill="url(#g)" width="200" height="200" rx="20"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Inter,sans-serif" font-weight="800" font-size="80" fill="rgba(255,255,255,0.85)">${l}</text></svg>`)}`;
}

/* ── JioSaavn API ───────────────────────────── */
const SAAVN_API = 'https://www.jiosaavn.com/api.php';

const HOME_Q = {
    trending: ['Blinding Lights', 'Shape of You', 'Sunflower', 'Levitating', 'Starboy', 'Havana', 'Circles Post Malone', 'Dont Start Now', 'bad guy billie eilish', 'Watermelon Sugar', 'Stay Kid Laroi', 'Peaches Justin Bieber'],
    popular: ['Bohemian Rhapsody', 'Believer', 'Closer Chainsmokers', 'Thunder', 'Faded Alan Walker', 'Radioactive', 'Someone Like You', 'Counting Stars', 'Happier Marshmello', 'Lucid Dreams', 'Old Town Road', 'Despacito'],
    newReleases: ['Flowers Miley Cyrus', 'Anti Hero Taylor Swift', 'As It Was Harry Styles', 'Unholy Sam Smith', 'Calm Down Rema', 'Kill Bill SZA', 'Creepin Metro Boomin', 'Boy With Luv BTS'],
    chill: ['Heather Conan Gray', 'Sweater Weather', 'Love Nwantiti', 'Perfect Ed Sheeran', 'All of Me John Legend', 'Photograph Ed Sheeran', 'A Thousand Years', 'Die For You Weeknd'],
};

const GENRES = [
    { name: 'Pop', icon: '🎤', query: 'top pop hits', bg: 'linear-gradient(135deg,#e84393,#fd79a8)' },
    { name: 'Rock', icon: '🎸', query: 'classic rock hits', bg: 'linear-gradient(135deg,#d63031,#e17055)' },
    { name: 'Hip Hop', icon: '🎧', query: 'hip hop rap hits', bg: 'linear-gradient(135deg,#6c5ce7,#a29bfe)' },
    { name: 'Electronic', icon: '🎹', query: 'electronic dance EDM', bg: 'linear-gradient(135deg,#0984e3,#74b9ff)' },
    { name: 'R&B', icon: '🎵', query: 'r&b soul hits', bg: 'linear-gradient(135deg,#00b894,#55efc4)' },
    { name: 'Country', icon: '🤠', query: 'country music hits', bg: 'linear-gradient(135deg,#fdcb6e,#f39c12)' },
    { name: 'Jazz', icon: '🎷', query: 'jazz classics', bg: 'linear-gradient(135deg,#e17055,#fab1a0)' },
    { name: 'Classical', icon: '🎻', query: 'classical music famous', bg: 'linear-gradient(135deg,#636e72,#b2bec3)' },
    { name: 'Latin', icon: '💃', query: 'latin reggaeton', bg: 'linear-gradient(135deg,#ff7675,#fab1a0)' },
    { name: 'K-Pop', icon: '🇰🇷', query: 'kpop BTS Blackpink', bg: 'linear-gradient(135deg,#a29bfe,#dfe6e9)' },
    { name: 'Indie', icon: '🌿', query: 'indie alternative', bg: 'linear-gradient(135deg,#00cec9,#81ecec)' },
    { name: 'Lo-Fi', icon: '☕', query: 'lofi beats chill', bg: 'linear-gradient(135deg,#2d3436,#636e72)' },
    { name: 'Bollywood', icon: '🇮🇳', query: 'bollywood hits latest', bg: 'linear-gradient(135deg,#e84393,#fdcb6e)' },
    { name: 'Anime', icon: '🎌', query: 'anime songs opening', bg: 'linear-gradient(135deg,#6c5ce7,#fd79a8)' },
    { name: 'Metal', icon: '🤘', query: 'heavy metal rock', bg: 'linear-gradient(135deg,#2d3436,#d63031)' },
    { name: 'Reggae', icon: '🏝️', query: 'reggae music bob marley', bg: 'linear-gradient(135deg,#00b894,#fdcb6e)' },
    { name: 'Blues', icon: '🎺', query: 'blues music', bg: 'linear-gradient(135deg,#0984e3,#2d3436)' },
    { name: 'Disco', icon: '🪩', query: 'disco dance 80s', bg: 'linear-gradient(135deg,#fdcb6e,#e84393)' },
    { name: 'Punk', icon: '⚡', query: 'punk rock songs', bg: 'linear-gradient(135deg,#d63031,#2d3436)' },
    { name: 'Gospel', icon: '🙏', query: 'gospel worship', bg: 'linear-gradient(135deg,#fdcb6e,#fab1a0)' },
    { name: 'Afrobeats', icon: '🥁', query: 'afrobeats hits', bg: 'linear-gradient(135deg,#e17055,#00b894)' },
    { name: 'Phonk', icon: '🔊', query: 'phonk music', bg: 'linear-gradient(135deg,#6c5ce7,#d63031)' },
    { name: 'Ambient', icon: '🌌', query: 'ambient space music', bg: 'linear-gradient(135deg,#2d3436,#0984e3)' },
    { name: 'Punjabi', icon: '🎶', query: 'punjabi songs latest', bg: 'linear-gradient(135deg,#ff7675,#fdcb6e)' },
];

/* ── State ──────────────────────────────────── */
const state = {
    playlist: [], currentIndex: -1, isPlaying: false, isShuffle: false, repeatMode: 'none',
    volume: 0.8, isMuted: false, searchTimeout: null, audio: new Audio(),
    isLoading: false, isDragging: false, currentPage: 'home',
    favorites: JSON.parse(localStorage.getItem('aurora_fav') || '[]'),
    recentlyPlayed: JSON.parse(localStorage.getItem('aurora_recent') || '[]'),
    library: JSON.parse(localStorage.getItem('aurora_lib') || '[]'),
};

/* ── DOM ────────────────────────────────────── */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const DOM = {};
function cacheDom() {
    ['loader', 'searchInput', 'searchClear', 'homePage', 'searchPage', 'browsePage', 'libraryPage', 'favoritesPage', 'recentPage',
        'trendingGrid', 'popularGrid', 'searchGrid', 'searchResultsTitle', 'searchResultsSubtitle', 'searchStats', 'emptyState',
        'browseGrid', 'browseResultsTitle', 'browseResultsSub', 'genreGrid', 'libraryGrid', 'libraryEmpty', 'libraryCount',
        'favoritesGrid', 'favoritesEmpty', 'favoritesCount', 'recentGrid', 'recentEmpty', 'recentCount',
        'player', 'playerArt', 'playerTitle', 'playerArtist', 'playPauseBtn', 'playIcon', 'pauseIcon',
        'prevBtn', 'nextBtn', 'shuffleBtn', 'repeatBtn', 'progressBar', 'progressFill', 'currentTime', 'totalTime',
        'volumeSlider', 'volumeBtn', 'volumeIcon', 'muteIcon', 'mobileMenuBtn', 'sidebar', 'sidebarOverlay', 'sidebarClose',
        'toast', 'heroPlayBtn', 'likeBtn', 'greetingText', 'greetingSub', 'bgBackdrop', 'bgBackdropImage',
        'sidebarNowPlaying', 'sidebarArt', 'sidebarTitle', 'sidebarArtist',
    ].forEach(id => DOM[id] = $(`#${id}`));
}

/* ── CORS Proxy (JioSaavn blocks browser requests) ── */
const CORS_PROXIES = [
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url => url,
];

async function corsGet(url) {
    for (const proxy of CORS_PROXIES) {
        try {
            const resp = await fetch(proxy(url), { signal: AbortSignal.timeout(10000) });
            if (!resp.ok) continue;
            const text = await resp.text();
            const jsonStart = text.indexOf('{');
            if (jsonStart < 0) continue;
            return JSON.parse(text.slice(jsonStart));
        } catch (e) { console.warn('[Proxy]', e.message); }
    }
    return null;
}

/* ── Music API (JioSaavn) ───────────────────── */
const MusicAPI = {
    async search(query, limit = 20) {
        try {
            const url = `${SAAVN_API}?__call=search.getResults&_format=json&_marker=0&cc=in&includeMetaTags=1&p=1&q=${encodeURIComponent(query)}&n=${limit}`;
            const data = await corsGet(url);
            if (data && data.results && data.results.length > 0) {
                return data.results.map((t, i) => MusicAPI.norm(t, i)).filter(s => s.streamUrl);
            }
        } catch (e) { console.warn('[API]', e.message); }
        return [];
    },

    norm(t, idx = 0) {
        let img = (t.image || '').replace('150x150', '500x500').replace('50x50', '500x500');
        if (!img.startsWith('http')) img = genArt(t.song || 'Song', idx);
        const streamUrl = decryptUrl(t.encrypted_media_url || '');
        return {
            id: `jio-${t.id}`,
            title: t.song || 'Unknown',
            artist: t.primary_artists || t.singers || 'Unknown',
            img, duration: fmtDuration(t.duration),
            durationSecs: parseInt(t.duration) || 0,
            album: t.album || '',
            genre: t.language ? t.language.charAt(0).toUpperCase() + t.language.slice(1) : '',
            streamUrl, playCount: parseInt(t.play_count) || 0,
            year: t.year || '', is320: t['320kbps'] === 'true', isDemo: false,
        };
    },

    async fetchOne(q) {
        const r = await MusicAPI.search(q, 1);
        return r.length > 0 ? r[0] : null;
    },
};

/* ── Persistence ────────────────────────────── */
function saveFav() { localStorage.setItem('aurora_fav', JSON.stringify(state.favorites)); }
function saveRecent() { localStorage.setItem('aurora_recent', JSON.stringify(state.recentlyPlayed)); }
function saveLib() { localStorage.setItem('aurora_lib', JSON.stringify(state.library)); }
function addToRecent(s) { state.recentlyPlayed = state.recentlyPlayed.filter(x => x.id !== s.id); state.recentlyPlayed.unshift(s); if (state.recentlyPlayed.length > 50) state.recentlyPlayed.pop(); saveRecent(); }
function addToLib(s) { if (!state.library.find(x => x.id === s.id)) { state.library.unshift(s); if (state.library.length > 100) state.library.pop(); saveLib(); } }
function toggleFav(s) { const i = state.favorites.findIndex(x => x.id === s.id); if (i >= 0) { state.favorites.splice(i, 1); saveFav(); return false; } state.favorites.unshift(s); saveFav(); return true; }
function isFav(id) { return state.favorites.some(s => s.id === id); }

/* ── UI ─────────────────────────────────────── */
const UI = {
    createCard(song, index) {
        const c = document.createElement('div'); c.className = 'card'; c.dataset.songId = song.id; c.dataset.index = index;
        const t = UI.esc(song.title), a = UI.esc(song.artist || ''), g = song.genre ? ' · ' + UI.esc(song.genre) : '';
        const badge320 = song.is320 ? '<span class="card__hq">HQ</span>' : '';
        c.innerHTML = `<div class="card__art-wrapper"><img class="card__art" src="${song.img || ''}" alt="${t}" loading="lazy" onerror="this.src='${genArt(song.title, index)}'">${song.duration ? `<span class="card__duration">${song.duration}</span>` : ''}${badge320}<div class="card__play-overlay"><button class="card__play-btn" aria-label="Play ${t}"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg></button></div></div><p class="card__title" title="${t}">${t}</p><p class="card__subtitle">${a}${g}</p>`;
        c.addEventListener('click', () => Player.play(index));
        return c;
    },
    renderGrid(el, songs) { el.innerHTML = ''; songs.forEach((s, i) => el.appendChild(UI.createCard(s, i))); },
    renderSkeletons(el, n = 8) {
        el.innerHTML = '';
        for (let i = 0; i < n; i++) {
            const s = document.createElement('div'); s.className = 'card'; s.style.cursor = 'default';
            s.innerHTML = `<div class="card__art-wrapper skeleton" style="aspect-ratio:1;"></div><div class="skeleton" style="height:12px;width:75%;margin-top:10px;border-radius:4px;"></div><div class="skeleton" style="height:10px;width:50%;margin-top:5px;border-radius:4px;"></div>`;
            el.appendChild(s);
        }
    },
    updatePlayer(song) {
        DOM.playerTitle.textContent = song.title || 'Unknown';
        DOM.playerArtist.textContent = song.artist || '';
        DOM.playerArt.src = song.img || genArt(song.title, 0);
        DOM.player.classList.remove('hidden');
        DOM.sidebarNowPlaying.style.display = 'block';
        DOM.sidebarArt.src = song.img || genArt(song.title, 0);
        DOM.sidebarTitle.textContent = song.title || '';
        DOM.sidebarArtist.textContent = song.artist || '';
        DOM.bgBackdropImage.src = song.img || genArt(song.title, 0);
        DOM.bgBackdrop.classList.add('active');
        const liked = isFav(song.id);
        DOM.likeBtn.classList.toggle('active', liked);
        DOM.likeBtn.querySelector('svg').setAttribute('fill', liked ? 'currentColor' : 'none');
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.title, artist: song.artist || 'Aurora',
                album: song.album || '',
                artwork: [{ src: song.img || '', sizes: '500x500', type: 'image/jpeg' }],
            });
        }
    },
    updatePlayPause(p) {
        DOM.playIcon.style.display = p ? 'none' : 'block';
        DOM.pauseIcon.style.display = p ? 'block' : 'none';
        DOM.player.classList.toggle('is-playing', p);
    },
    highlightPlaying(i) {
        $$('.card.playing').forEach(c => c.classList.remove('playing'));
        $$(`[data-index="${i}"]`).forEach(c => c.classList.add('playing'));
    },
    fmt(s) { if (isNaN(s) || !isFinite(s)) return '0:00'; return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`; },
    esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
    _tt: null,
    toast(m, d = 2500) {
        clearTimeout(UI._tt); DOM.toast.textContent = m; DOM.toast.classList.add('show');
        UI._tt = setTimeout(() => DOM.toast.classList.remove('show'), d);
    },

    showPage(page) {
        state.currentPage = page;
        ['homePage', 'searchPage', 'browsePage', 'libraryPage', 'favoritesPage', 'recentPage'].forEach(p => {
            if (DOM[p]) DOM[p].style.display = 'none';
        });
        switch (page) {
            case 'home': DOM.homePage.style.display = 'block'; break;
            case 'search': DOM.searchPage.style.display = 'block'; break;
            case 'browse': DOM.browsePage.style.display = 'block'; BrowsePage.init(); break;
            case 'library': DOM.libraryPage.style.display = 'block'; LibraryPage.render(); break;
            case 'favorites': DOM.favoritesPage.style.display = 'block'; FavoritesPage.render(); break;
            case 'recent': DOM.recentPage.style.display = 'block'; RecentPage.render(); break;
        }
        $$('.sidebar__nav-item').forEach(i => i.classList.remove('active'));
        const a = $(`.sidebar__nav-item[data-page="${page}"]`); if (a) a.classList.add('active');
        const main = $('#mainContent'); if (main) main.scrollTo(0, 0);
    },

    setGreeting() {
        const h = new Date().getHours();
        let t = 'Good Evening', sub = 'Time to wind down with some music';
        if (h >= 5 && h < 12) { t = 'Good Morning'; sub = 'Start your day with great music'; }
        else if (h >= 12 && h < 17) { t = 'Good Afternoon'; sub = 'Perfect time for a playlist'; }
        DOM.greetingText.textContent = t;
        if (DOM.greetingSub) DOM.greetingSub.textContent = sub;
    },
};

/* ── Player ─────────────────────────────────── */
const Player = {
    async play(index) {
        if (index < 0 || index >= state.playlist.length || state.isLoading) return;
        state.isLoading = true; state.currentIndex = index;
        const song = state.playlist[index];
        UI.updatePlayer(song); UI.updatePlayPause(false); UI.highlightPlaying(index);
        let url = song.streamUrl || '';
        if (!url) { state.isLoading = false; UI.toast('No stream — skipping…'); setTimeout(() => Player.next(), 600); return; }
        addToRecent(song); addToLib(song);
        DOM.progressFill.style.width = '0%'; DOM.currentTime.textContent = '0:00';
        state.audio.src = url;
        state.audio.volume = state.isMuted ? 0 : state.volume;
        try {
            await state.audio.play(); state.isPlaying = true; UI.updatePlayPause(true);
            UI.toast(`♪ ${song.title}${song.is320 ? ' • 320kbps' : ''}`);
        } catch (e) { state.isPlaying = false; UI.updatePlayPause(false); UI.toast('Tap play to start'); }
        state.isLoading = false;
    },
    toggle() {
        if (!state.audio.src) { if (state.playlist.length > 0) Player.play(0); return; }
        if (state.isPlaying) { state.audio.pause(); state.isPlaying = false; }
        else { state.audio.play().catch(() => { }); state.isPlaying = true; }
        UI.updatePlayPause(state.isPlaying);
    },
    next() {
        if (!state.playlist.length) return;
        let i;
        if (state.isShuffle) { do { i = Math.floor(Math.random() * state.playlist.length); } while (i === state.currentIndex && state.playlist.length > 1); }
        else { i = (state.currentIndex + 1) % state.playlist.length; }
        Player.play(i);
    },
    prev() {
        if (!state.playlist.length) return;
        if (state.audio.currentTime > 3) { state.audio.currentTime = 0; return; }
        let i;
        if (state.isShuffle) { i = Math.floor(Math.random() * state.playlist.length); }
        else { i = (state.currentIndex - 1 + state.playlist.length) % state.playlist.length; }
        Player.play(i);
    },
    seek(f) { if (state.audio.duration) state.audio.currentTime = f * state.audio.duration; },
    setVol(v) { state.volume = Math.max(0, Math.min(1, v)); state.audio.volume = state.isMuted ? 0 : state.volume; },
    toggleMute() {
        state.isMuted = !state.isMuted; state.audio.volume = state.isMuted ? 0 : state.volume;
        DOM.volumeIcon.style.display = state.isMuted ? 'none' : 'block';
        DOM.muteIcon.style.display = state.isMuted ? 'block' : 'none';
        DOM.volumeSlider.value = state.isMuted ? 0 : state.volume * 100;
    },
    toggleShuffle() { state.isShuffle = !state.isShuffle; DOM.shuffleBtn.classList.toggle('active', state.isShuffle); UI.toast(state.isShuffle ? 'Shuffle On' : 'Shuffle Off'); },
    toggleRepeat() {
        const m = ['none', 'all', 'one']; state.repeatMode = m[(m.indexOf(state.repeatMode) + 1) % 3];
        DOM.repeatBtn.classList.toggle('active', state.repeatMode !== 'none');
        UI.toast({ none: 'Repeat Off', all: 'Repeat All', one: 'Repeat One' }[state.repeatMode]);
    },
};

/* ── Search ─────────────────────────────────── */
const SearchHandler = {
    handleInput(e) {
        const q = e.target.value.trim(); clearTimeout(state.searchTimeout);
        if (!q) { UI.showPage('home'); return; }
        state.searchTimeout = setTimeout(() => SearchHandler.exec(q), 500);
    },
    async exec(query) {
        UI.showPage('search');
        DOM.searchResultsTitle.textContent = 'Search Results';
        DOM.searchResultsSubtitle.textContent = `Showing results for "${query}"`;
        DOM.searchStats.textContent = 'Searching…';
        DOM.emptyState.style.display = 'none';
        UI.renderSkeletons(DOM.searchGrid, 12);
        const results = await MusicAPI.search(query, 30);
        if (!results.length) { DOM.searchGrid.innerHTML = ''; DOM.emptyState.style.display = 'flex'; DOM.searchStats.textContent = '0 results'; return; }
        state.playlist = results;
        const hqCount = results.filter(s => s.is320).length;
        DOM.searchStats.textContent = `${results.length} tracks found • ${hqCount} in 320kbps HQ`;
        UI.renderGrid(DOM.searchGrid, results);
        if (state.currentIndex >= 0) UI.highlightPlaying(state.currentIndex);
    },
    clear() { DOM.searchInput.value = ''; UI.showPage('home'); DOM.searchInput.focus(); },
};

/* ── Home Page ──────────────────────────────── */
const HomePage = {
    async init() {
        UI.renderSkeletons(DOM.trendingGrid, 12);
        UI.renderSkeletons(DOM.popularGrid, 12);

        // Create extra section grids dynamically
        HomePage.createSection('🆕 New Releases', 'Fresh drops this week', 'newReleasesGrid');
        HomePage.createSection('☁️ Chill Vibes', 'Relax and unwind', 'chillGrid');

        const nrGrid = $('#newReleasesGrid');
        const chGrid = $('#chillGrid');
        if (nrGrid) UI.renderSkeletons(nrGrid, 8);
        if (chGrid) UI.renderSkeletons(chGrid, 8);

        let tr = [], po = [], nr = [], ch = [];
        try {
            [tr, po, nr, ch] = await Promise.all([
                HomePage.fetch(HOME_Q.trending),
                HomePage.fetch(HOME_Q.popular),
                HomePage.fetch(HOME_Q.newReleases),
                HomePage.fetch(HOME_Q.chill),
            ]);
        } catch (e) { console.warn('[Home]', e); }

        // Build unified playlist
        state.playlist = [...tr, ...po, ...nr, ...ch];

        const renderSection = (grid, songs, offset) => {
            if (!grid) return;
            if (songs.length) {
                grid.innerHTML = '';
                songs.forEach((s, i) => {
                    const globalIdx = offset + i;
                    const card = UI.createCard(s, globalIdx);
                    grid.appendChild(card);
                });
            } else {
                grid.innerHTML = '<p style="color:var(--text-secondary);font-size:13px;padding:20px;">Could not load — try searching instead</p>';
            }
        };

        renderSection(DOM.trendingGrid, tr, 0);
        renderSection(DOM.popularGrid, po, tr.length);
        renderSection(nrGrid, nr, tr.length + po.length);
        renderSection(chGrid, ch, tr.length + po.length + nr.length);
    },

    createSection(title, subtitle, gridId) {
        if ($(`#${gridId}`)) return; // already exists
        const homePage = DOM.homePage;
        const header = document.createElement('div');
        header.className = 'section-header reveal';
        header.innerHTML = `<div><h2 class="section-header__title">${title}</h2><p class="section-header__subtitle">${subtitle}</p></div>`;
        const grid = document.createElement('div');
        grid.className = 'grid';
        grid.id = gridId;
        homePage.appendChild(header);
        homePage.appendChild(grid);
        // Observe for scroll reveal
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        obs.observe(header);
    },

    async fetch(queries) {
        const r = [], seen = new Set();
        const res = await Promise.all(queries.map(q => MusicAPI.fetchOne(q)));
        res.forEach(s => { if (s && !seen.has(s.id)) { seen.add(s.id); r.push(s); } });
        return r;
    },
};

/* ── Browse Page ────────────────────────────── */
const BrowsePage = {
    _loaded: false,
    init() {
        if (!BrowsePage._loaded) { BrowsePage.renderGenres(); BrowsePage.loadGenre(GENRES[0]); BrowsePage._loaded = true; }
    },
    renderGenres() {
        DOM.genreGrid.innerHTML = '';
        GENRES.forEach((g, i) => {
            const c = document.createElement('div'); c.className = 'genre-card';
            c.style.animationDelay = `${i * 0.025}s`; c.style.background = g.bg;
            c.innerHTML = `<div class="genre-card__icon">${g.icon}</div><p class="genre-card__name">${g.name}</p>`;
            c.addEventListener('click', () => BrowsePage.loadGenre(g));
            DOM.genreGrid.appendChild(c);
        });
    },
    async loadGenre(g) {
        DOM.browseResultsTitle.textContent = g.name;
        DOM.browseResultsSub.textContent = `Top ${g.name} tracks`;
        UI.renderSkeletons(DOM.browseGrid, 12);
        const r = await MusicAPI.search(g.query, 20);
        state.playlist = r; UI.renderGrid(DOM.browseGrid, r);
    },
};

/* ── Library / Favorites / Recent ───────────── */
const LibraryPage = {
    render() {
        if (!state.library.length) { DOM.libraryGrid.innerHTML = ''; DOM.libraryEmpty.style.display = 'flex'; DOM.libraryCount.textContent = '0 songs'; return; }
        DOM.libraryEmpty.style.display = 'none';
        DOM.libraryCount.textContent = `${state.library.length} songs`;
        state.playlist = state.library; UI.renderGrid(DOM.libraryGrid, state.library);
    },
};
const FavoritesPage = {
    render() {
        if (!state.favorites.length) { DOM.favoritesGrid.innerHTML = ''; DOM.favoritesEmpty.style.display = 'flex'; DOM.favoritesCount.textContent = '0 songs'; return; }
        DOM.favoritesEmpty.style.display = 'none';
        DOM.favoritesCount.textContent = `${state.favorites.length} liked songs`;
        state.playlist = state.favorites; UI.renderGrid(DOM.favoritesGrid, state.favorites);
    },
};
const RecentPage = {
    render() {
        if (!state.recentlyPlayed.length) { DOM.recentGrid.innerHTML = ''; DOM.recentEmpty.style.display = 'flex'; DOM.recentCount.textContent = 'No songs yet'; return; }
        DOM.recentEmpty.style.display = 'none';
        DOM.recentCount.textContent = `${state.recentlyPlayed.length} songs played`;
        state.playlist = state.recentlyPlayed; UI.renderGrid(DOM.recentGrid, state.recentlyPlayed);
    },
};

/* ── Progress Drag ──────────────────────────── */
function initDrag() {
    const bar = DOM.progressBar;
    const pos = e => { const r = bar.getBoundingClientRect(); const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left; return Math.max(0, Math.min(1, x / r.width)); };
    const start = e => { state.isDragging = true; DOM.progressFill.style.width = `${pos(e) * 100}%`; };
    const move = e => { if (!state.isDragging) return; e.preventDefault(); const f = pos(e); DOM.progressFill.style.width = `${f * 100}%`; DOM.currentTime.textContent = UI.fmt(f * (state.audio.duration || 0)); };
    const end = e => { if (!state.isDragging) return; state.isDragging = false; Player.seek(pos(e.changedTouches ? e.changedTouches[0] : e)); };
    bar.addEventListener('mousedown', start);
    bar.addEventListener('touchstart', start, { passive: true });
    document.addEventListener('mousemove', move);
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);
    bar.addEventListener('click', e => { if (!state.isDragging) Player.seek(pos(e)); });
}

/* ── Scroll Reveal ──────────────────────────── */
function initScrollReveal() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(el => obs.observe(el));
}

/* ── Events ─────────────────────────────────── */
function bindEvents() {
    DOM.searchInput.addEventListener('input', SearchHandler.handleInput);
    DOM.searchClear.addEventListener('click', SearchHandler.clear);

    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); DOM.searchInput.focus(); }
        if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault(); Player.toggle(); }
        if (e.key === 'ArrowRight' && document.activeElement.tagName !== 'INPUT') { if (state.audio.duration) state.audio.currentTime = Math.min(state.audio.duration, state.audio.currentTime + 5); }
        if (e.key === 'ArrowLeft' && document.activeElement.tagName !== 'INPUT') { state.audio.currentTime = Math.max(0, state.audio.currentTime - 5); }
        if (e.key === 'm' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) Player.toggleMute();
    });

    DOM.playPauseBtn.addEventListener('click', Player.toggle);
    DOM.nextBtn.addEventListener('click', Player.next);
    DOM.prevBtn.addEventListener('click', Player.prev);
    DOM.shuffleBtn.addEventListener('click', Player.toggleShuffle);
    DOM.repeatBtn.addEventListener('click', Player.toggleRepeat);
    initDrag();

    state.audio.addEventListener('timeupdate', () => {
        if (state.isDragging || !state.audio.duration) return;
        DOM.progressFill.style.width = `${(state.audio.currentTime / state.audio.duration) * 100}%`;
        DOM.currentTime.textContent = UI.fmt(state.audio.currentTime);
        DOM.totalTime.textContent = UI.fmt(state.audio.duration);
    });
    state.audio.addEventListener('loadedmetadata', () => DOM.totalTime.textContent = UI.fmt(state.audio.duration));
    state.audio.addEventListener('ended', () => {
        if (state.repeatMode === 'one') { state.audio.currentTime = 0; state.audio.play().catch(() => { }); }
        else if (state.repeatMode === 'all' || state.currentIndex < state.playlist.length - 1) Player.next();
        else { state.isPlaying = false; UI.updatePlayPause(false); }
    });
    state.audio.addEventListener('error', () => {
        UI.toast('Error — skipping…'); state.isPlaying = false; UI.updatePlayPause(false);
        setTimeout(() => Player.next(), 800);
    });

    DOM.volumeSlider.addEventListener('input', e => {
        const v = parseInt(e.target.value) / 100; Player.setVol(v);
        e.target.style.setProperty('--vol', e.target.value + '%');
        if (state.isMuted && v > 0) { state.isMuted = false; DOM.volumeIcon.style.display = 'block'; DOM.muteIcon.style.display = 'none'; }
    });
    DOM.volumeBtn.addEventListener('click', Player.toggleMute);

    DOM.likeBtn.addEventListener('click', () => {
        if (state.currentIndex < 0 || !state.playlist[state.currentIndex]) return;
        const song = state.playlist[state.currentIndex]; const liked = toggleFav(song);
        DOM.likeBtn.classList.toggle('active', liked);
        DOM.likeBtn.querySelector('svg').setAttribute('fill', liked ? 'currentColor' : 'none');
        UI.toast(liked ? 'Added to Favorites ❤️' : 'Removed from Favorites');
    });

    $$('.sidebar__nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const p = item.dataset.page;
            if (p === 'search') { UI.showPage('search'); DOM.searchInput.focus(); } else UI.showPage(p);
            closeSidebar();
        });
    });

    DOM.mobileMenuBtn.addEventListener('click', openSidebar);
    DOM.sidebarOverlay.addEventListener('click', closeSidebar);
    DOM.sidebarClose.addEventListener('click', closeSidebar);
    DOM.heroPlayBtn.addEventListener('click', () => { if (state.playlist.length > 0) Player.play(0); });

    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', Player.toggle);
        navigator.mediaSession.setActionHandler('pause', Player.toggle);
        navigator.mediaSession.setActionHandler('previoustrack', Player.prev);
        navigator.mediaSession.setActionHandler('nexttrack', Player.next);
    }
}

function openSidebar() { DOM.sidebar.classList.add('open'); DOM.sidebarOverlay.classList.add('active'); }
function closeSidebar() { DOM.sidebar.classList.remove('open'); DOM.sidebarOverlay.classList.remove('active'); }

/* ── Init ───────────────────────────────────── */
async function init() {
    cacheDom(); UI.setGreeting();
    state.audio.volume = state.volume;
    state.audio.preload = 'auto';
    bindEvents();
    await _cryptoReady;
    await HomePage.init();
    initScrollReveal();
    setTimeout(() => DOM.loader.classList.add('hidden'), 500);
}
document.addEventListener('DOMContentLoaded', init);
