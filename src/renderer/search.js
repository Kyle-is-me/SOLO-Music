import { get } from './api.js';
import { isLoggedIn } from './auth.js';
import { formatTime } from './utils.js';

function showLoading(container) {
  container.innerHTML = '';
  const loading = document.createElement('div');
  loading.className = 'online-loading';
  loading.textContent = '搜索中...';
  container.appendChild(loading);
}

function showError(container, message) {
  container.innerHTML = '';
  const error = document.createElement('div');
  error.className = 'online-error';
  error.textContent = message || '搜索失败，请稍后重试';
  container.appendChild(error);
}

export async function searchSongs(keyword) {
  const searchResults = document.getElementById('search-results');
  const grid = document.getElementById('playlist-grid');
  const detail = document.getElementById('playlist-detail');

  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    searchResults.innerHTML = '';
    const prompt = document.createElement('div');
    prompt.className = 'online-login-prompt';
    const text = document.createElement('p');
    text.textContent = '请先登录';
    const btn = document.createElement('button');
    btn.className = 'btn-primary btn-sm';
    btn.textContent = '登录';
    btn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('show-login'));
    });
    prompt.appendChild(text);
    prompt.appendChild(btn);
    searchResults.appendChild(prompt);
    grid.style.display = 'none';
    detail.style.display = 'none';
    searchResults.style.display = '';
    return;
  }

  grid.style.display = 'none';
  detail.style.display = 'none';
  searchResults.style.display = '';
  showLoading(searchResults);

  try {
    const data = await get('/search?keyword=' + encodeURIComponent(keyword), true);
    searchResults.innerHTML = '';

    const songs = data.songs || [];
    if (songs.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'online-empty';
      empty.textContent = '未找到相关歌曲';
      searchResults.appendChild(empty);
      return;
    }

    songs.forEach((song, index) => {
      const row = document.createElement('div');
      row.className = 'song-row';

      const indexEl = document.createElement('span');
      indexEl.className = 'song-row-index';
      indexEl.textContent = index + 1;

      const nameEl = document.createElement('span');
      nameEl.className = 'song-row-name';
      nameEl.textContent = song.title;

      const artistEl = document.createElement('span');
      artistEl.className = 'song-row-artist';
      artistEl.textContent = song.artist;

      const durationEl = document.createElement('span');
      durationEl.className = 'song-row-duration';
      durationEl.textContent = formatTime(song.duration);

      row.appendChild(indexEl);
      row.appendChild(nameEl);
      row.appendChild(artistEl);
      row.appendChild(durationEl);

      row.addEventListener('dblclick', () => {
        window.dispatchEvent(new CustomEvent('play-online-songs', {
          detail: { songs: [song] }
        }));
      });

      searchResults.appendChild(row);
    });
  } catch (err) {
    showError(searchResults, err.message || '搜索失败');
  }
}

export function initSearch() {
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const grid = document.getElementById('playlist-grid');

  function doSearch() {
    const keyword = searchInput.value.trim();
    if (keyword) {
      searchSongs(keyword);
    }
  }

  searchBtn.addEventListener('click', doSearch);

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      doSearch();
    }
  });

  searchInput.addEventListener('input', () => {
    const keyword = searchInput.value.trim();
    if (!keyword) {
      searchResults.style.display = 'none';
      searchResults.innerHTML = '';
      grid.style.display = '';
    }
  });
}
