import { parseLRC } from './utils.js';

const lyricsContent = document.getElementById('lyrics-content');

let lyrics = [];
let currentLyricIndex = -1;

export function getLyrics() {
  return lyrics;
}

export function setLyrics(value) {
  lyrics = value;
}

export function getCurrentLyricIndex() {
  return currentLyricIndex;
}

export function setCurrentLyricIndex(value) {
  currentLyricIndex = value;
}

export async function loadLyrics(audioFilePath, audio) {
  lyrics = [];
  currentLyricIndex = -1;

  try {
    const lyricPath = await window.electronAPI.findLyricFile(audioFilePath);
    if (lyricPath) {
      const content = await window.electronAPI.readLyricFile(lyricPath);
      if (content) {
        lyrics = parseLRC(content);
      }
    }
  } catch (err) {
    console.error('loadLyrics error:', err);
  }

  renderLyrics(audio);
}

export async function loadLyricsManual(currentIndex, audio) {
  if (currentIndex === -1) return;

  try {
    const lyricPath = await window.electronAPI.openLyricDialog();
    if (!lyricPath) return;

    const content = await window.electronAPI.readLyricFile(lyricPath);
    if (content) {
      lyrics = parseLRC(content);
      currentLyricIndex = -1;
      renderLyrics(audio);
    }
  } catch (err) {
    console.error('loadLyricsManual error:', err);
  }
}

export function renderLyrics(audio) {
  lyricsContent.innerHTML = '';

  if (lyrics.length === 0) {
    const noLyrics = document.createElement('div');
    noLyrics.className = 'no-lyrics';
    noLyrics.textContent = '暂无歌词';
    lyricsContent.appendChild(noLyrics);
    return;
  }

  lyrics.forEach((line, index) => {
    const el = document.createElement('div');
    el.className = 'lyric-line';
    el.dataset.index = index;
    el.textContent = line.text;

    let mouseDownX = 0;
    let mouseDownY = 0;

    el.addEventListener('mousedown', (e) => {
      mouseDownX = e.clientX;
      mouseDownY = e.clientY;
    });

    el.addEventListener('mouseup', (e) => {
      const dx = Math.abs(e.clientX - mouseDownX);
      const dy = Math.abs(e.clientY - mouseDownY);
      if (dx < 5 && dy < 5) {
        audio.currentTime = line.time;
      }
    });

    lyricsContent.appendChild(el);
  });
}

export function syncLyrics(currentTime) {
  if (lyrics.length === 0) return;

  let newIndex = -1;

  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      newIndex = i;
      break;
    }
  }

  if (newIndex === currentLyricIndex) return;

  currentLyricIndex = newIndex;

  const lines = lyricsContent.querySelectorAll('.lyric-line');
  lines.forEach((line, i) => {
    line.classList.remove('active', 'passed');
    if (i === newIndex) {
      line.classList.add('active');
    } else if (i < newIndex) {
      line.classList.add('passed');
    }
  });

  if (newIndex >= 0 && lines[newIndex]) {
    lines[newIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
}
