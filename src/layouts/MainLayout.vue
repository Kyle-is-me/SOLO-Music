<template>
  <div class="app-layout">
    <div class="sidebar">
      <div class="sidebar-logo">
        <img src="@/assets/logo.png" alt="SOLO" />
        <span>SOLO音乐</span>
      </div>
      <div class="sidebar-nav">
        <div
          v-for="nav in navItems"
          :key="nav.route"
          class="nav-item"
          :class="{ active: currentRoute === nav.route }"
          @click="navigate(nav.route)"
        >
          <span v-html="nav.icon"></span>
          <span>{{ nav.label }}</span>
        </div>
      </div>
      <div class="sidebar-playlist-header">
        <span>播放列表</span>
        <div class="playlist-actions">
          <button title="添加音乐" @click="addFiles">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
          </button>
          <button title="添加文件夹" @click="addFolder">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 7V5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v2M3 7h18a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button title="清空列表" @click="clearList">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
      <div class="playlist-list">
        <div
          v-for="(song, i) in playlistStore.songs"
          :key="i"
          class="playlist-item"
          :class="{ active: i === playerStore.currentIndex }"
          @dblclick="playerStore.playSong(i, playlistStore.songs)"
          @contextmenu.prevent="removeSong(i)"
        >
          <span class="playlist-item-name">
            <span v-if="song.type === 'online'" class="online-dot">●</span>
            {{ song.title }}
          </span>
          <span class="playlist-item-artist">{{ song.artist }}</span>
        </div>
      </div>
      <div class="sidebar-user">
        <div v-if="authStore.isLoggedIn" class="user-info">
          <div class="user-avatar">{{ authStore.user?.username?.charAt(0).toUpperCase() }}</div>
          <div class="user-name">{{ authStore.user?.username }}</div>
          <button class="logout-btn" title="退出登录" @click="authStore.logout()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/></svg>
          </button>
        </div>
        <button v-else class="btn-login" @click="showAuthModal = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>
          <span>登录</span>
        </button>
      </div>
      <div class="sidebar-theme">
        <span class="theme-label">主题</span>
        <div class="theme-options">
          <button
            v-for="t in themes"
            :key="t.name"
            class="theme-dot"
            :class="{ active: currentTheme === t.name }"
            :style="{ background: t.color }"
            :title="t.label"
            @click="setTheme(t.name)"
          ></button>
        </div>
      </div>
    </div>

    <div class="main-content">
      <router-view />
    </div>

    <div class="control-bar">
      <div class="control-song-info">
        <div class="control-album-art">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 18V5l12-2v13" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/><circle cx="6" cy="18" r="3" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/><circle cx="18" cy="16" r="3" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/></svg>
        </div>
        <div class="control-song-text">
          <div class="control-song-title">{{ currentSong?.title || '未在播放' }}</div>
          <div class="control-song-artist">{{ currentSong?.artist || '--' }}</div>
        </div>
        <button v-if="currentSong?.type === 'online'" class="favorite-btn" @click="toggleFavorite">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path v-if="!isFavorited" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="2"/>
            <path v-else d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="var(--accent)"/>
          </svg>
        </button>
      </div>
      <div class="control-center">
        <div class="control-buttons">
          <button @click="playerStore.togglePlayMode()" :title="playModeLabel">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8 5l-5 5 5 5M16 5l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <button @click="handlePrev">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 20L9 12l10-8v16zM5 4v16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button @click="playerStore.togglePlay(playlistStore.songs)">
            <svg v-if="!playerStore.isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="none"><polygon points="6,3 20,12 6,21" fill="currentColor"/></svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="4" height="18" rx="1" fill="currentColor"/><rect x="15" y="3" width="4" height="18" rx="1" fill="currentColor"/></svg>
          </button>
          <button @click="handleNext">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 4l10 8-10 8V4zM19 4v16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button @click="playerStore.toggleMute()">
            <svg v-if="!playerStore.isMuted" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M23 9l-6 6M17 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div class="progress-area">
          <span>{{ formatTime(playerStore.currentTime) }}</span>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
            <input type="range" min="0" max="1000" :value="progressValue" @input="playerStore.seekTo($event.target.value)" step="1" />
          </div>
          <span>{{ formatTime(playerStore.duration) }}</span>
        </div>
      </div>
      <div class="control-extra">
        <div class="volume-area">
          <input type="range" min="0" max="100" :value="playerStore.volume" @input="playerStore.setVolume($event.target.value)" step="1" />
          <span>{{ playerStore.volume }}%</span>
        </div>
      </div>
    </div>

    <AuthModal v-model:visible="showAuthModal" />
    <audio ref="audioEl" id="audio-player"></audio>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePlayerStore } from '@/stores/player';
import { usePlaylistStore } from '@/stores/playlist';
import { addFavorite, removeFavorite, getFavorites } from '@/api';
import { formatTime } from '@/utils';
import AuthModal from '@/components/AuthModal.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const playerStore = usePlayerStore();
const playlistStore = usePlaylistStore();

const audioEl = ref(null);
const showAuthModal = ref(false);
const currentTheme = ref(localStorage.getItem('solo-theme') || 'indigo');
const isFavorited = ref(false);

const navItems = [
  { route: 'local', label: '本地音乐', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3v18M3 12h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>' },
  { route: 'online', label: '在线音乐', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/></svg>' },
  { route: 'favorites', label: '我的收藏', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/></svg>' },
  { route: 'history', label: '播放历史', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 3a9 9 0 00-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21a9 9 0 000-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" fill="currentColor"/></svg>' },
];

const themes = [
  { name: 'indigo', color: '#5B5EA6', label: '靛蓝' },
  { name: 'blue', color: '#4A90D9', label: '蓝色' },
  { name: 'yellow', color: '#E6B422', label: '黄色' },
  { name: 'pink', color: '#E8668A', label: '粉色' },
];

const currentRoute = computed(() => route.name);
const currentSong = computed(() => {
  if (playerStore.currentIndex >= 0 && playerStore.currentIndex < playlistStore.songs.length) {
    return playlistStore.songs[playerStore.currentIndex];
  }
  return null;
});

const progressPercent = computed(() => {
  if (!playerStore.duration) return 0;
  return (playerStore.currentTime / playerStore.duration) * 100;
});
const progressValue = computed(() => {
  if (!playerStore.duration) return 0;
  return (playerStore.currentTime / playerStore.duration) * 1000;
});

const playModeLabel = computed(() => {
  const labels = { sequential: '顺序播放', loop: '循环播放', 'loop-one': '单曲循环', shuffle: '随机播放' };
  return labels[playerStore.playMode] || '顺序播放';
});

function navigate(name) {
  router.push({ name });
}

function setTheme(name) {
  currentTheme.value = name;
  document.documentElement.setAttribute('data-theme', name);
  localStorage.setItem('solo-theme', name);
}

async function addFiles() {
  const files = await window.electronAPI.openFileDialog();
  if (!files || !files.length) return;
  for (const filePath of files) {
    const meta = await window.electronAPI.getAudioMetadata(filePath);
    playlistStore.addSongs([{
      type: 'local',
      title: meta.title,
      artist: meta.artist,
      album: meta.album,
      duration: meta.duration,
      filePath,
    }]);
  }
}

async function addFolder() {
  const folder = await window.electronAPI.openFolderDialog();
  if (!folder) return;
  const files = await window.electronAPI.scanFolder(folder);
  for (const filePath of files) {
    const meta = await window.electronAPI.getAudioMetadata(filePath);
    playlistStore.addSongs([{
      type: 'local',
      title: meta.title,
      artist: meta.artist,
      album: meta.album,
      duration: meta.duration,
      filePath,
    }]);
  }
}

function removeSong(index) {
  playlistStore.removeSong(index);
}

function clearList() {
  playlistStore.clear();
  if (audioEl.value) {
    audioEl.value.pause();
    audioEl.value.src = '';
  }
  playerStore.currentIndex = -1;
  playerStore.isPlaying = false;
}

function handlePrev() {
  const idx = playerStore.playPrev(playlistStore.songs);
  if (idx >= 0) playerStore.playSong(idx, playlistStore.songs);
}

function handleNext() {
  const idx = playerStore.playNext(playlistStore.songs);
  if (idx >= 0) playerStore.playSong(idx, playlistStore.songs);
}

async function toggleFavorite() {
  if (!currentSong.value || currentSong.value.type !== 'online') return;
  try {
    if (isFavorited.value) {
      await removeFavorite(currentSong.value.id);
      isFavorited.value = false;
    } else {
      await addFavorite(currentSong.value.id);
      isFavorited.value = true;
    }
  } catch {}
}

async function checkFavorite() {
  if (!currentSong.value || currentSong.value.type !== 'online') {
    isFavorited.value = false;
    return;
  }
  try {
    const data = await getFavorites();
    const items = data.items || [];
    isFavorited.value = items.some(item => (item.song && item.song.id === currentSong.value.id) || item.songId === currentSong.value.id);
  } catch {
    isFavorited.value = false;
  }
}

function setupAudioEvents() {
  const audio = audioEl.value;
  if (!audio) return;
  playerStore.setAudioRef(audio);

  audio.addEventListener('play', () => { playerStore.isPlaying = true; });
  audio.addEventListener('pause', () => { playerStore.isPlaying = false; });
  audio.addEventListener('timeupdate', () => {
    playerStore.currentTime = audio.currentTime;
    playerStore.syncLyrics();
  });
  audio.addEventListener('loadedmetadata', () => {
    playerStore.duration = audio.duration;
  });
  audio.addEventListener('ended', () => {
    const idx = playerStore.playNext(playlistStore.songs);
    if (idx >= 0) playerStore.playSong(idx, playlistStore.songs);
  });
}

watch(currentSong, () => {
  checkFavorite();
});

onMounted(() => {
  setTheme(currentTheme.value);
  setupAudioEvents();
  authStore.initAuth();
  playlistStore.loadFromStorage();
});
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.app-layout > .sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 220px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 10;
}
.main-content {
  margin-left: 220px;
  margin-bottom: 72px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 72px);
  overflow: hidden;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 18px;
  font-size: 16px;
  font-weight: 700;
}
.sidebar-logo img {
  width: 28px;
  height: 28px;
}
.sidebar-nav {
  padding: 0 8px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.15s;
  margin-bottom: 2px;
}
.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
.nav-item.active {
  background: var(--bg-active);
  color: var(--accent);
}
.sidebar-playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px 6px;
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}
.playlist-actions {
  display: flex;
  gap: 4px;
}
.playlist-actions button {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}
.playlist-actions button:hover {
  color: var(--accent);
  background: var(--bg-hover);
}
.playlist-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px;
}
.playlist-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.15s;
}
.playlist-item:hover {
  background: var(--bg-hover);
}
.playlist-item.active {
  color: var(--accent);
}
.playlist-item-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.playlist-item-artist {
  color: var(--text-muted);
  font-size: 11px;
  margin-left: 8px;
  flex-shrink: 0;
}
.online-dot {
  color: var(--accent);
  font-size: 8px;
  margin-right: 4px;
}
.sidebar-user {
  padding: 10px 14px;
  border-top: 1px solid var(--border);
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.user-name {
  flex: 1;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.logout-btn {
  color: var(--text-muted);
  padding: 4px;
}
.logout-btn:hover {
  color: var(--accent);
}
.btn-login {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 12px;
  width: 100%;
  justify-content: center;
  padding: 6px;
  border-radius: 8px;
}
.btn-login:hover {
  color: var(--accent);
  background: var(--bg-hover);
}
.sidebar-theme {
  padding: 10px 14px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.theme-label {
  font-size: 11px;
  color: var(--text-muted);
}
.theme-options {
  display: flex;
  gap: 6px;
}
.theme-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}
.theme-dot.active {
  border-color: var(--text-primary);
  transform: scale(1.15);
}
.control-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: var(--bg-control);
  border-top: 1px solid var(--border);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 100;
}
.control-song-info {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 240px;
  flex-shrink: 0;
}
.control-album-art {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--disc-center);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.control-song-text {
  min-width: 0;
}
.control-song-title {
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.control-song-artist {
  font-size: 11px;
  color: var(--text-secondary);
}
.favorite-btn {
  color: var(--text-muted);
  padding: 4px;
  flex-shrink: 0;
}
.favorite-btn:hover {
  color: var(--accent);
}
.control-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.control-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}
.control-buttons button {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}
.control-buttons button:hover {
  color: var(--text-primary);
}
.progress-area {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 600px;
  font-size: 11px;
  color: var(--text-muted);
}
.progress-bar-wrap {
  flex: 1;
  height: 4px;
  background: var(--bg-secondary);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}
.progress-bar-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.1s;
}
.progress-bar-wrap input[type="range"] {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
}
.control-extra {
  width: 160px;
  display: flex;
  justify-content: flex-end;
}
.volume-area {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-muted);
}
.volume-area input[type="range"] {
  width: 80px;
}
</style>
