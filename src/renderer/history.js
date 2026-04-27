import { getHistory } from './api.js';
import { isLoggedIn } from './auth.js';
import { formatTime } from './utils.js';

function convertSong(song) {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist?.name || '未知歌手',
    album: song.album?.name || '',
    duration: song.duration || 0,
    type: 'online'
  };
}

export async function loadHistory() {
  const listEl = document.getElementById('history-list');
  listEl.innerHTML = '';

  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    const tip = document.createElement('div');
    tip.className = 'favorites-tip';
    tip.textContent = '请先登录查看播放历史';
    listEl.appendChild(tip);
    return;
  }

  try {
    const data = await getHistory({ pageSize: 50 });
    const items = data.list || [];

    if (items.length === 0) {
      const tip = document.createElement('div');
      tip.className = 'favorites-tip';
      tip.textContent = '暂无播放历史';
      listEl.appendChild(tip);
      return;
    }

    items.forEach((item, index) => {
      const song = item.song || {};
      const converted = convertSong(song);

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

      const nameText = document.createTextNode(converted.title);
      nameEl.appendChild(nameText);

      const artistEl = document.createElement('div');
      artistEl.className = 'song-row-artist';
      artistEl.textContent = converted.artist;

      const durationEl = document.createElement('div');
      durationEl.className = 'song-row-duration';
      durationEl.textContent = formatTime(converted.duration);

      row.appendChild(indexEl);
      row.appendChild(nameEl);
      row.appendChild(artistEl);
      row.appendChild(durationEl);

      row.addEventListener('dblclick', () => {
        window.dispatchEvent(new CustomEvent('play-online-songs', {
          detail: { songs: [converted] }
        }));
      });

      listEl.appendChild(row);
    });
  } catch (err) {
    const tip = document.createElement('div');
    tip.className = 'favorites-tip';
    tip.textContent = '加载播放历史失败';
    listEl.appendChild(tip);
  }
}

export function initHistoryView() {
  window.addEventListener('view-changed', (e) => {
    if (e.detail && e.detail.view === 'history') {
      loadHistory();
    }
  });
}
