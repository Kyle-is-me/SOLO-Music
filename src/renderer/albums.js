import { getAlbums, getAlbumDetail } from './api.js';
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

export async function loadAlbums() {
  const grid = document.getElementById('album-grid');
  const detail = document.getElementById('album-detail');
  detail.style.display = 'none';
  grid.style.display = '';
  showLoading(grid);

  try {
    const data = await getAlbums({ pageSize: 50 });
    grid.innerHTML = '';

    const albums = data.list || [];
    if (albums.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'online-empty';
      empty.textContent = '暂无专辑';
      grid.appendChild(empty);
      return;
    }

    albums.forEach(album => {
      const card = document.createElement('div');
      card.className = 'playlist-card';

      const cover = document.createElement('div');
      cover.className = 'playlist-card-cover';
      if (album.coverPath) {
        const img = document.createElement('img');
        img.src = album.coverPath;
        img.alt = album.name;
        img.loading = 'lazy';
        cover.appendChild(img);
      }

      const info = document.createElement('div');
      info.className = 'playlist-card-info';

      const name = document.createElement('div');
      name.className = 'playlist-card-name';
      name.textContent = album.name;

      const artist = document.createElement('div');
      artist.className = 'playlist-card-count';
      artist.textContent = album.artist?.name || '未知艺术家';

      info.appendChild(name);
      info.appendChild(artist);
      card.appendChild(cover);
      card.appendChild(info);

      card.addEventListener('click', () => {
        loadAlbumDetailView(album.id);
      });

      grid.appendChild(card);
    });
  } catch (err) {
    showError(grid, err.message || '加载专辑失败');
  }
}

export async function loadAlbumDetailView(albumId) {
  const grid = document.getElementById('album-grid');
  const detail = document.getElementById('album-detail');
  const detailInfo = document.getElementById('album-detail-info');
  const detailSongs = document.getElementById('album-detail-songs');

  grid.style.display = 'none';
  detail.style.display = 'flex';
  showLoading(detailSongs);

  try {
    const data = await getAlbumDetail(albumId);

    const artistName = data.artist?.name || '未知艺术家';
    const year = data.releaseYear ? ' (' + data.releaseYear + ')' : '';
    detailInfo.textContent = data.name + ' - ' + artistName + year;

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

      detailSongs.appendChild(row);
    });

    const playAllBtn = document.getElementById('album-play-all-btn');
    playAllBtn.onclick = () => {
      if (songs.length > 0) {
        window.dispatchEvent(new CustomEvent('play-online-songs', {
          detail: { songs }
        }));
      }
    };
  } catch (err) {
    showError(detailSongs, err.message || '加载专辑详情失败');
  }
}

export function initAlbumsView() {
  const backBtn = document.getElementById('album-back-btn');
  backBtn.addEventListener('click', () => {
    const detail = document.getElementById('album-detail');
    const grid = document.getElementById('album-grid');
    detail.style.display = 'none';
    grid.style.display = '';
  });
}
