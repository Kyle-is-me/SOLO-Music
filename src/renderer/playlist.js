import { extractFileName } from './utils.js';
import { setLyrics, setCurrentLyricIndex, renderLyrics } from './lyrics.js';

const playlistList = document.getElementById('playlist-list');

let playlist = [];
let currentIndex = -1;
let _onPlay = null;
let _onContextMenu = null;

export function getPlaylist() {
  return playlist;
}

export function setPlaylist(value) {
  playlist = value;
}

export function getCurrentIndex() {
  return currentIndex;
}

export function setCurrentIndex(value) {
  currentIndex = value;
}

export async function addFiles() {
  try {
    const filePaths = await window.electronAPI.openFileDialog();
    if (!filePaths || filePaths.length === 0) return;

    for (const filePath of filePaths) {
      try {
        const metadata = await window.electronAPI.getAudioMetadata(filePath);
        playlist.push({
          filePath,
          title: metadata.title || extractFileName(filePath),
          artist: metadata.artist || '未知艺术家',
          album: metadata.album || '',
          duration: metadata.duration || 0
        });
      } catch (err) {
        console.error('Failed to get metadata for:', filePath, err);
        playlist.push({
          filePath,
          title: extractFileName(filePath),
          artist: '未知艺术家',
          album: '',
          duration: 0
        });
      }
    }

    renderPlaylist();
    savePlaylist();
  } catch (err) {
    console.error('addFiles error:', err);
  }
}

export async function addFolder() {
  try {
    const folderPath = await window.electronAPI.openFolderDialog();
    if (!folderPath) return;

    const filePaths = await window.electronAPI.scanFolder(folderPath);
    if (!filePaths || filePaths.length === 0) return;

    for (const filePath of filePaths) {
      try {
        const metadata = await window.electronAPI.getAudioMetadata(filePath);
        playlist.push({
          filePath,
          title: metadata.title || extractFileName(filePath),
          artist: metadata.artist || '未知艺术家',
          album: metadata.album || '',
          duration: metadata.duration || 0
        });
      } catch (err) {
        console.error('Failed to get metadata for:', filePath, err);
        playlist.push({
          filePath,
          title: extractFileName(filePath),
          artist: '未知艺术家',
          album: '',
          duration: 0
        });
      }
    }

    renderPlaylist();
    savePlaylist();
  } catch (err) {
    console.error('addFolder error:', err);
  }
}

export function removeSong(index, audio, updateSongDisplay, playSong) {
  playlist.splice(index, 1);

  if (playlist.length === 0) {
    currentIndex = -1;
    audio.pause();
    audio.src = '';
    updateSongDisplay(null);
    setLyrics([]);
    renderLyrics(audio);
  } else if (index < currentIndex) {
    currentIndex--;
  } else if (index === currentIndex) {
    if (currentIndex >= playlist.length) {
      currentIndex = playlist.length - 1;
    }
    if (currentIndex >= 0) {
      playSong(currentIndex);
    }
  }

  renderPlaylist();
  savePlaylist();
}

export function clearList(audio, updateSongDisplay, currentTimeEl, totalTimeEl, progressBar, progressBarFill, setPlayIcon) {
  playlist = [];
  currentIndex = -1;
  audio.pause();
  audio.src = '';
  updateSongDisplay(null);
  currentTimeEl.textContent = '0:00';
  totalTimeEl.textContent = '0:00';
  progressBar.value = 0;
  progressBarFill.style.width = '0%';
  setPlayIcon(false);
  setLyrics([]);
  setCurrentLyricIndex(-1);
  renderLyrics(audio);
  renderPlaylist();
  savePlaylist();
}

export function savePlaylist() {
  window.electronAPI.savePlaylist(playlist);
}

export async function initPlaylist() {
  try {
    const saved = await window.electronAPI.loadPlaylist();
    if (saved && saved.length > 0) {
      playlist = saved;
      renderPlaylist();
    }
  } catch (err) {
    console.error('loadPlaylist error:', err);
  }
}

export function addOnlineSongs(songs) {
  const startIndex = playlist.length;
  for (const song of songs) {
    playlist.push({
      type: 'online',
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album || '',
      duration: song.duration || 0,
      filePath: ''
    });
  }
  renderPlaylist();
  savePlaylist();
  return startIndex;
}

export function addOnlineSong(song) {
  const index = playlist.length;
  playlist.push({
    type: 'online',
    id: song.id,
    title: song.title,
    artist: song.artist,
    album: song.album || '',
    duration: song.duration || 0,
    filePath: ''
  });
  renderPlaylist();
  savePlaylist();
  return index;
}

export function handlePlayOnlineSongs(songs, playCallback) {
  const startIndex = addOnlineSongs(songs);
  playCallback(startIndex);
}

export function setCallbacks(onPlay, onContextMenu) {
  _onPlay = onPlay;
  _onContextMenu = onContextMenu;
}

export function renderPlaylist(onPlay, onContextMenu) {
  if (onPlay) _onPlay = onPlay;
  if (onContextMenu) _onContextMenu = onContextMenu;
  playlistList.innerHTML = '';

  playlist.forEach((song, index) => {
    const item = document.createElement('div');
    item.className = 'playlist-item' + (index === currentIndex ? ' active' : '');
    item.dataset.index = index;

    const titleEl = document.createElement('div');
    titleEl.className = 'playlist-item-title';

    if (song.type === 'online') {
      const sourceEl = document.createElement('span');
      sourceEl.className = 'song-source online-source';
      sourceEl.textContent = '●';
      titleEl.appendChild(sourceEl);
    }

    const titleText = document.createTextNode(song.title);
    titleEl.appendChild(titleText);

    const artistEl = document.createElement('div');
    artistEl.className = 'playlist-item-artist';
    artistEl.textContent = song.artist;

    item.appendChild(titleEl);
    item.appendChild(artistEl);

    item.addEventListener('dblclick', () => {
      if (_onPlay) _onPlay(index);
    });

    item.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (_onContextMenu) _onContextMenu(e, index);
    });

    playlistList.appendChild(item);
  });
}
