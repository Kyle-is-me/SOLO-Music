import { getArtists, getArtistDetail } from './api.js';
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
  error.textContent = message || '加载失败';
  container.appendChild(error);
}

export async function loadArtists() {
  const grid = document.getElementById('artist-grid');
  const detail = document.getElementById('artist-detail');
  detail.style.display = 'none';
  grid.style.display = '';
  showLoading(grid);

  try {
    const data = await getArtists({ pageSize: 50 });
    grid.innerHTML = '';

    const artists = data.list || [];
    if (artists.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'online-empty';
      empty.textContent = '暂无艺术家';
      grid.appendChild(empty);
      return;
    }

    artists.forEach(artist => {
      const card = document.createElement('div');
      card.className = 'artist-card';

      const avatar = document.createElement('div');
      avatar.className = 'artist-card-avatar';
      if (artist.avatar) {
        const img = document.createElement('img');
        img.src = artist.avatar;
        img.alt = artist.name;
        img.loading = 'lazy';
        avatar.appendChild(img);
      }

      const info = document.createElement('div');
      info.className = 'playlist-card-info';

      const name = document.createElement('div');
      name.className = 'playlist-card-name';
      name.textContent = artist.name;

      const count = document.createElement('div');
      count.className = 'playlist-card-count';
      const albumCount = artist._count?.albums || 0;
      const songCount = artist._count?.songs || 0;
      count.textContent = albumCount + ' 张专辑 · ' + songCount + ' 首歌曲';

      info.appendChild(name);
      info.appendChild(count);
      card.appendChild(avatar);
      card.appendChild(info);

      card.addEventListener('click', () => {
        loadArtistDetailView(artist.id);
      });

      grid.appendChild(card);
    });
  } catch (err) {
    showError(grid, err.message || '加载艺术家失败');
  }
}

export async function loadArtistDetailView(artistId) {
  const grid = document.getElementById('artist-grid');
  const detail = document.getElementById('artist-detail');
  const detailInfo = document.getElementById('artist-detail-info');
  const detailSongs = document.getElementById('artist-detail-songs');

  grid.style.display = 'none';
  detail.style.display = 'flex';
  showLoading(detailSongs);

  try {
    const data = await getArtistDetail(artistId);

    detailInfo.textContent = data.name + (data.bio ? ' - ' + data.bio : '');

    const songs = (data.songs || []).map(s => convertSong(s));
    detailSongs.innerHTML = '';

    if (songs.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'online-empty';
      empty.textContent = '暂无歌曲';
      detailSongs.appendChild(empty);
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
      artistEl.textContent = song.album || '';

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

      detailSongs.appendChild(row);
    });

    const playAllBtn = document.getElementById('artist-play-all-btn');
    playAllBtn.onclick = () => {
      if (songs.length > 0) {
        window.dispatchEvent(new CustomEvent('play-online-songs', {
          detail: { songs }
        }));
      }
    };
  } catch (err) {
    showError(detailSongs, err.message || '加载艺术家详情失败');
  }
}

export function initArtistsView() {
  const backBtn = document.getElementById('artist-back-btn');
  backBtn.addEventListener('click', () => {
    const detail = document.getElementById('artist-detail');
    const grid = document.getElementById('artist-grid');
    detail.style.display = 'none';
    grid.style.display = '';
  });
}
