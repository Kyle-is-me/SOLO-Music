import { get } from './api.js';
import { isLoggedIn } from './auth.js';
import { formatTime } from './utils.js';

let currentPlaylistSongs = [];

function showLoginPrompt() {
  const grid = document.getElementById('playlist-grid');
  grid.innerHTML = '';

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
  grid.appendChild(prompt);
}

function showLoading(container) {
  container.innerHTML = '';
  const loading = document.createElement('div');
  loading.className = 'online-loading';
  loading.textContent = '加载中...';
  container.appendChild(loading);
}

function showError(container, message) {
  container.innerHTML = '';
  const error = document.createElement('div');
  error.className = 'online-error';
  error.textContent = message || '加载失败，请稍后重试';
  container.appendChild(error);
}

export async function loadRecommendPlaylists() {
  const grid = document.getElementById('playlist-grid');
  const detail = document.getElementById('playlist-detail');
  const searchResults = document.getElementById('search-results');

  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    detail.style.display = 'none';
    searchResults.style.display = 'none';
    grid.style.display = '';
    showLoginPrompt();
    return;
  }

  detail.style.display = 'none';
  searchResults.style.display = 'none';
  grid.style.display = '';
  showLoading(grid);

  try {
    const data = await get('/playlists', true);
    grid.innerHTML = '';

    const playlists = data.playlists || [];
    if (playlists.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'online-empty';
      empty.textContent = '暂无推荐歌单';
      grid.appendChild(empty);
      return;
    }

    playlists.forEach(pl => {
      const card = document.createElement('div');
      card.className = 'playlist-card';

      const cover = document.createElement('div');
      cover.className = 'playlist-card-cover';
      if (pl.cover) {
        const img = document.createElement('img');
        img.src = pl.cover;
        img.alt = pl.name;
        img.loading = 'lazy';
        cover.appendChild(img);
      }

      const info = document.createElement('div');
      info.className = 'playlist-card-info';

      const name = document.createElement('div');
      name.className = 'playlist-card-name';
      name.textContent = pl.name;

      const count = document.createElement('div');
      count.className = 'playlist-card-count';
      count.textContent = pl.songCount + ' 首';

      info.appendChild(name);
      info.appendChild(count);
      card.appendChild(cover);
      card.appendChild(info);

      card.addEventListener('click', () => {
        loadPlaylistDetail(pl.id);
      });

      grid.appendChild(card);
    });
  } catch (err) {
    showError(grid, err.message || '加载歌单失败');
  }
}

export async function loadPlaylistDetail(playlistId) {
  const grid = document.getElementById('playlist-grid');
  const detail = document.getElementById('playlist-detail');
  const detailInfo = document.getElementById('playlist-detail-info');
  const detailSongs = document.getElementById('playlist-detail-songs');

  grid.style.display = 'none';
  detail.style.display = 'flex';
  showLoading(detailSongs);

  try {
    const data = await get('/playlists/' + playlistId, true);

    const desc = data.description ? ' - ' + data.description : '';
    detailInfo.textContent = data.name + desc;

    currentPlaylistSongs = data.songs || [];
    detailSongs.innerHTML = '';

    if (currentPlaylistSongs.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'online-empty';
      empty.textContent = '暂无歌曲';
      detailSongs.appendChild(empty);
      return;
    }

    currentPlaylistSongs.forEach((song, index) => {
      const row = createSongRow(song, index);
      detailSongs.appendChild(row);
    });
  } catch (err) {
    showError(detailSongs, err.message || '加载歌单详情失败');
  }
}

function createSongRow(song, index) {
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

  return row;
}

export function initOnlineView() {
  const backBtn = document.getElementById('playlist-back-btn');
  const playAllBtn = document.getElementById('play-all-btn');

  backBtn.addEventListener('click', () => {
    const detail = document.getElementById('playlist-detail');
    const grid = document.getElementById('playlist-grid');
    detail.style.display = 'none';
    grid.style.display = '';
  });

  playAllBtn.addEventListener('click', () => {
    if (currentPlaylistSongs.length > 0) {
      window.dispatchEvent(new CustomEvent('play-online-songs', {
        detail: { songs: currentPlaylistSongs }
      }));
    }
  });

  window.addEventListener('auth-changed', () => {
    loadRecommendPlaylists();
  });

  loadRecommendPlaylists();
}
