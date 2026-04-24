import { formatTime } from './utils.js';
import { loadLyrics, syncLyrics } from './lyrics.js';

const audio = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const modeBtn = document.getElementById('mode-btn');
const progressBar = document.getElementById('progress-bar');
const progressBarFill = document.getElementById('progress-bar-fill');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const volumeBtn = document.getElementById('volume-btn');
const volumeBar = document.getElementById('volume-bar');
const volumePercent = document.getElementById('volume-percent');
const albumDisc = document.getElementById('album-disc');

let playMode = 'sequential';
let isSeeking = false;
let previousVolume = 100;

export function getPlayMode() {
  return playMode;
}

export function getIsSeeking() {
  return isSeeking;
}

export async function playSong(index, playlist, currentIndex, callbacks) {
  if (index < 0 || index >= playlist.length) return;

  const song = playlist[index];

  if (song.type === 'online') {
    audio.src = song.audioUrl;
  } else {
    audio.src = `local://audio/${encodeURIComponent(song.filePath)}`;
  }
  audio.load();

  callbacks.updateSongDisplay(song);
  callbacks.renderPlaylist();

  await loadLyrics(song.filePath, audio);

  try {
    await audio.play();
    setPlayIcon(true);
    albumDisc.classList.add('spinning');
  } catch (err) {
    console.error('playSong error:', err);
    setPlayIcon(false);
    albumDisc.classList.remove('spinning');
  }
}

export function setPlayIcon(isPlaying) {
  const iconPlay = playBtn.querySelector('.icon-play');
  const iconPause = playBtn.querySelector('.icon-pause');
  if (isPlaying) {
    iconPlay.style.display = 'none';
    iconPause.style.display = 'block';
  } else {
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
  }
}

export function togglePlay(playlist, currentIndex, setCurrentIndex) {
  if (currentIndex === -1 && playlist.length > 0) {
    return { action: 'playFirst' };
  }

  if (audio.paused) {
    audio.play().then(() => {
      setPlayIcon(true);
      albumDisc.classList.add('spinning');
    }).catch(() => {});
  } else {
    audio.pause();
    setPlayIcon(false);
    albumDisc.classList.remove('spinning');
  }
  return { action: 'toggled' };
}

export function playPrev(playlist, currentIndex) {
  if (playlist.length === 0) return -1;

  if (playMode === 'shuffle') {
    return Math.floor(Math.random() * playlist.length);
  } else {
    return currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;
  }
}

export function playNext(playlist, currentIndex) {
  if (playlist.length === 0) return -1;

  if (playMode === 'loop-one') {
    return currentIndex;
  } else if (playMode === 'shuffle') {
    let next = Math.floor(Math.random() * playlist.length);
    if (playlist.length > 1) {
      while (next === currentIndex) {
        next = Math.floor(Math.random() * playlist.length);
      }
    }
    return next;
  } else if (playMode === 'loop') {
    return currentIndex >= playlist.length - 1 ? 0 : currentIndex + 1;
  } else {
    if (currentIndex < playlist.length - 1) {
      return currentIndex + 1;
    }
    return -1;
  }
}

export function updateProgress() {
  if (isSeeking) return;

  const current = audio.currentTime;
  const duration = audio.duration || 0;

  currentTimeEl.textContent = formatTime(current);

  if (duration > 0) {
    const percent = (current / duration) * 100;
    progressBar.value = (current / duration) * 1000;
    progressBarFill.style.width = percent + '%';
  }

  syncLyrics(current);
}

export function seekTo(position) {
  const duration = audio.duration || 0;
  if (duration > 0) {
    audio.currentTime = (position / 1000) * duration;
    const percent = (position / 1000) * 100;
    progressBarFill.style.width = percent + '%';
  }
}

export function setVolume(value) {
  audio.volume = value / 100;
  updateVolumeIcon(value);
  volumePercent.textContent = value + '%';
  volumeBar.style.background = `linear-gradient(to right, var(--accent) ${value}%, rgba(255,255,255,0.08) ${value}%)`;
}

export function updateVolumeIcon(value) {
  const iconVolume = volumeBtn.querySelector('.icon-volume');
  const iconMute = volumeBtn.querySelector('.icon-mute');
  if (value === 0 || audio.muted) {
    iconVolume.style.display = 'none';
    iconMute.style.display = 'block';
  } else {
    iconVolume.style.display = 'block';
    iconMute.style.display = 'none';
  }
}

export function toggleMute() {
  if (audio.muted) {
    audio.muted = false;
    volumeBar.value = previousVolume;
    updateVolumeIcon(previousVolume);
    volumePercent.textContent = previousVolume + '%';
    volumeBar.style.background = `linear-gradient(to right, var(--accent) ${previousVolume}%, rgba(255,255,255,0.08) ${previousVolume}%)`;
  } else {
    previousVolume = parseInt(volumeBar.value, 10);
    audio.muted = true;
    volumeBar.value = 0;
    updateVolumeIcon(0);
    volumePercent.textContent = '0%';
    volumeBar.style.background = `linear-gradient(to right, var(--accent) 0%, rgba(255,255,255,0.08) 0%)`;
  }
}

export function togglePlayMode() {
  modeBtn.classList.remove('mode-loop', 'mode-loop-one', 'mode-shuffle');

  if (playMode === 'sequential') {
    playMode = 'loop';
    modeBtn.classList.add('mode-loop');
    modeBtn.title = '列表循环';
  } else if (playMode === 'loop') {
    playMode = 'loop-one';
    modeBtn.classList.add('mode-loop-one');
    modeBtn.title = '单曲循环';
  } else if (playMode === 'loop-one') {
    playMode = 'shuffle';
    modeBtn.classList.add('mode-shuffle');
    modeBtn.title = '随机播放';
  } else {
    playMode = 'sequential';
    modeBtn.title = '顺序播放';
  }
}

export function initAudioEvents(callbacks) {
  progressBar.addEventListener('mousedown', () => {
    isSeeking = true;
  });

  progressBar.addEventListener('mouseup', () => {
    isSeeking = false;
  });

  progressBar.addEventListener('input', (e) => {
    seekTo(parseInt(e.target.value, 10));
  });

  volumeBar.addEventListener('input', (e) => {
    const value = parseInt(e.target.value, 10);
    setVolume(value);
  });

  audio.addEventListener('ended', () => {
    callbacks.onEnded();
  });

  audio.addEventListener('timeupdate', () => {
    updateProgress();
  });

  audio.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('play', () => {
    setPlayIcon(true);
    albumDisc.classList.add('spinning');
  });

  audio.addEventListener('pause', () => {
    setPlayIcon(false);
    albumDisc.classList.remove('spinning');
  });

  volumeBar.style.background = `linear-gradient(to right, var(--accent) 100%, rgba(255,255,255,0.08) 100%)`;
}
