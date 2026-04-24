import { addFiles, addFolder, removeSong, clearList, initPlaylist, renderPlaylist, setCallbacks, getPlaylist, getCurrentIndex, setCurrentIndex } from './playlist.js';
import { playSong, setPlayIcon, togglePlay, playPrev, playNext, toggleMute, togglePlayMode, initAudioEvents } from './player.js';
import { loadLyricsManual } from './lyrics.js';
import { updateSongDisplay, showContextMenu, initTheme } from './ui.js';

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
  const playlist = getPlaylist();
  playSong(index, playlist, getCurrentIndex(), {
    updateSongDisplay,
    renderPlaylist: () => renderPlaylist(handlePlaySong, handleContextMenu)
  });
}

function handleContextMenu(e, index) {
  showContextMenu(e, index, (idx) => {
    removeSong(idx, audio, updateSongDisplay, handlePlaySong);
  });
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
initPlaylist();
