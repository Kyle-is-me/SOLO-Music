import { addFiles, addFolder, removeSong, clearList, initPlaylist, renderPlaylist, setCallbacks, getPlaylist, getCurrentIndex, setCurrentIndex, addOnlineSongs, addOnlineSong, handlePlayOnlineSongs } from './playlist.js';
import { playSong, setPlayIcon, togglePlay, playPrev, playNext, toggleMute, togglePlayMode, initAudioEvents } from './player.js';
import { loadLyricsManual } from './lyrics.js';
import { updateSongDisplay, showContextMenu, initTheme, initAuthModal, initNavigation, switchView, initFavoriteButton, updateFavoriteButton, showAuthModal, showToast } from './ui.js';
import { initAuth } from './auth.js';
import { initFavoritesView } from './favorites.js';
import { initOnlineView } from './online.js';
import { initSearch } from './search.js';
import { initAlbumsView, loadAlbums } from './albums.js';
import { initArtistsView, loadArtists } from './artists.js';
import { initHistoryView } from './history.js';
import { addHistory, getSongLyrics } from './api.js';
import { setLyrics, renderLyrics } from './lyrics.js';

const electronAPI = window.electronAPI;

if (!electronAPI) {
  document.body.innerHTML = '<div style="color:#e8e8f0;padding:40px;text-align:center;font-size:16px;">应用初始化失败，请重新启动</div>';
  throw new Error('electronAPI not available');
}

const addMusicBtn = document.getElementById('add-music-btn');
const addFolderBtn = document.getElementById('add-folder-btn');
const clearListBtn = document.getElementById('clear-list-btn');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const modeBtn = document.getElementById('mode-btn');
const volumeBtn = document.getElementById('volume-btn');
const loadLyricBtn = document.getElementById('load-lyric-btn');
const progressBar = document.getElementById('progress-bar');
const progressBarFill = document.getElementById('progress-bar-fill');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');

const audio = document.getElementById('audio-player');

function handlePlaySong(index) {
  setCurrentIndex(index);
  const playlist = getPlaylist();
  playSong(index, playlist, index, {
    updateSongDisplay: (song) => {
      updateSongDisplay(song);
      updateFavoriteButton(song);
    },
    renderPlaylist: () => renderPlaylist(handlePlaySong, handleContextMenu)
  });

  const song = playlist[index];
  if (song && song.type === 'online' && song.id) {
    addHistory(song.id).catch(() => {});
    loadOnlineLyrics(song.id);
  }
}

function handleContextMenu(e, index) {
  showContextMenu(e, index, (idx) => {
    removeSong(idx, audio, updateSongDisplay, handlePlaySong);
  });
}

async function loadOnlineLyrics(songId) {
  try {
    const data = await getSongLyrics(songId);
    if (data && data.content) {
      const lines = data.content.split('\n').filter(l => l.trim());
      const lyrics = lines.map(line => {
        const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
        if (match) {
          const time = parseInt(match[1]) * 60 + parseInt(match[2]) + parseInt(match[3]) / (match[3].length === 3 ? 1000 : 100);
          return { time, text: match[4].trim() };
        }
        return { time: 0, text: line.replace(/\[.*?\]/, '').trim() };
      }).filter(l => l.text);
      setLyrics(lyrics);
      renderLyrics(audio);
    }
  } catch {}
}

addMusicBtn.addEventListener('click', addFiles);
addFolderBtn.addEventListener('click', addFolder);
clearListBtn.addEventListener('click', () => {
  clearList(audio, updateSongDisplay, currentTimeEl, totalTimeEl, progressBar, progressBarFill, setPlayIcon);
});
playBtn.addEventListener('click', () => {
  const result = togglePlay(getPlaylist(), getCurrentIndex(), setCurrentIndex);
  if (result.action === 'playFirst') {
    handlePlaySong(0);
  }
});
prevBtn.addEventListener('click', () => {
  const nextIndex = playPrev(getPlaylist(), getCurrentIndex());
  if (nextIndex >= 0) handlePlaySong(nextIndex);
});
nextBtn.addEventListener('click', () => {
  const nextIndex = playNext(getPlaylist(), getCurrentIndex());
  if (nextIndex >= 0) handlePlaySong(nextIndex);
});
modeBtn.addEventListener('click', togglePlayMode);
volumeBtn.addEventListener('click', toggleMute);
loadLyricBtn.addEventListener('click', () => {
  loadLyricsManual(getCurrentIndex(), audio);
});

document.addEventListener('click', (e) => {
  const menu = document.querySelector('.context-menu');
  if (menu && !menu.contains(e.target)) {
    menu.remove();
  }
});

setCallbacks(handlePlaySong, handleContextMenu);

initAudioEvents({
  onEnded: () => {
    const nextIndex = playNext(getPlaylist(), getCurrentIndex());
    if (nextIndex >= 0) handlePlaySong(nextIndex);
  }
});

initTheme();
initAuthModal();
initNavigation();
initAuth();
initPlaylist();
initOnlineView();
initSearch();
initFavoriteButton();
initFavoritesView();
initAlbumsView();
initArtistsView();
initHistoryView();

initOnlineTabs();

function initOnlineTabs() {
  const tabs = document.querySelectorAll('.online-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabName = tab.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(tc => {
        tc.style.display = 'none';
      });
      const target = document.getElementById('tab-' + tabName);
      if (target) target.style.display = 'flex';

      if (tabName === 'albums') loadAlbums();
      if (tabName === 'artists') loadArtists();
    });
  });
}

window.addEventListener('show-login', () => {
  showAuthModal(false);
});

window.addEventListener('play-online-songs', (e) => {
  const songs = e.detail.songs;
  if (songs && songs.length > 0) {
    handlePlayOnlineSongs(songs, handlePlaySong);
  }
});

audio.addEventListener('error', () => {
  const playlist = getPlaylist();
  const currentIndex = getCurrentIndex();
  if (currentIndex >= 0 && currentIndex < playlist.length) {
    const song = playlist[currentIndex];
    if (song.type === 'online') {
      showToast('在线歌曲播放失败，请检查网络连接', 'error');
    }
  }
});

window.addEventListener('offline', () => {
  showToast('网络连接已断开', 'error');
});

window.addEventListener('online', () => {
  showToast('网络连接已恢复', 'success');
});
