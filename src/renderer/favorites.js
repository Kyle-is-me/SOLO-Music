import { getFavorites } from './api.js';
import { isLoggedIn } from './auth.js';
import { formatTime } from './utils.js';

export async function loadFavorites() {
  const listEl = document.getElementById('favorites-list');
  listEl.innerHTML = '';

  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    const tip = document.createElement('div');
    tip.className = 'favorites-tip';
    tip.textContent = '请先登录查看收藏';
    listEl.appendChild(tip);
    return;
  }

  try {
    const data = await getFavorites();
    const songs = data.songs || [];

    if (songs.length === 0) {
      const tip = document.createElement('div');
      tip.className = 'favorites-tip';
      tip.textContent = '暂无收藏歌曲';
      listEl.appendChild(tip);
      return;
    }

    songs.forEach((song, index) => {
      const row = document.createElement('div');
      row.className = 'song-row';

      const indexEl = document.createElement('div');
      indexEl.className = 'song-row-index';
      indexEl.textContent = index + 1;

      const nameEl = document.createElement('div');
      nameEl.className = 'song-row-name';

      const sourceEl = document.createElement('span');
      sourceEl.className = 'song-source online-source';
      sourceEl.textContent = '●';
      nameEl.appendChild(sourceEl);

      const nameText = document.createTextNode(song.title);
      nameEl.appendChild(nameText);

      const artistEl = document.createElement('div');
      artistEl.className = 'song-row-artist';
      artistEl.textContent = song.artist;

      const durationEl = document.createElement('div');
      durationEl.className = 'song-row-duration';
      durationEl.textContent = formatTime(song.duration || 0);

      row.appendChild(indexEl);
      row.appendChild(nameEl);
      row.appendChild(artistEl);
      row.appendChild(durationEl);

      row.addEventListener('dblclick', () => {
        window.dispatchEvent(new CustomEvent('play-online-songs', {
          detail: { songs: [song] }
        }));
      });

      listEl.appendChild(row);
    });
  } catch (err) {
    const tip = document.createElement('div');
    tip.className = 'favorites-tip';
    tip.textContent = '加载收藏失败';
    listEl.appendChild(tip);
  }
}

export function initFavoritesView() {
  window.addEventListener('view-changed', (e) => {
    if (e.detail && e.detail.view === 'favorites') {
      loadFavorites();
    }
  });
}
