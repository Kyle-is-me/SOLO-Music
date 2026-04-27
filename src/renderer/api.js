const baseURL = 'http://localhost:3000/api/v1';

async function request(method, path, data, requireAuth) {
  const url = baseURL + path;
  const headers = {};

  if (requireAuth) {
    const auth = await window.electronAPI.storeGet('auth');
    if (auth && auth.token) {
      headers.Authorization = 'Bearer ' + auth.token;
    }
  }

  const options = { method, url, headers };

  if (data !== undefined && data !== null) {
    options.body = data;
  }

  const response = await window.electronAPI.httpRequest(options);

  if (response.error) {
    throw new Error('网络请求失败: ' + response.error);
  }

  if (response.status === 401) {
    await window.electronAPI.storeDelete('auth');
    window.dispatchEvent(new CustomEvent('auth-expired'));
    throw new Error('认证已过期，请重新登录');
  }

  if (response.status >= 400) {
    const msg = (response.data && response.data.message) || '请求失败';
    throw new Error(msg);
  }

  const body = response.data;
  if (body && typeof body === 'object' && 'code' in body) {
    if (body.code !== 0) {
      throw new Error(body.message || '请求失败 (code: ' + body.code + ')');
    }
    return body.data;
  }

  return body;
}

function get(path, requireAuth) {
  return request('GET', path, null, requireAuth);
}

function post(path, data, requireAuth) {
  return request('POST', path, data, requireAuth);
}

function put(path, data, requireAuth) {
  return request('PUT', path, data, requireAuth);
}

function del(path, requireAuth) {
  return request('DELETE', path, null, requireAuth);
}

function getSongStreamUrl(songId) {
  return 'stream://song/' + songId;
}

function addFavorite(songId) {
  return post('/favorites/' + songId, null, true);
}

function removeFavorite(songId) {
  return del('/favorites/' + songId, true);
}

function getFavorites() {
  return get('/favorites', true);
}

function getAlbums(params) {
  const query = new URLSearchParams(params || {}).toString();
  return get('/albums' + (query ? '?' + query : ''), false);
}

function getAlbumDetail(id) {
  return get('/albums/' + id, false);
}

function getArtists(params) {
  const query = new URLSearchParams(params || {}).toString();
  return get('/artists' + (query ? '?' + query : ''), false);
}

function getArtistDetail(id) {
  return get('/artists/' + id, false);
}

function getHistory(params) {
  const query = new URLSearchParams(params || {}).toString();
  return get('/history' + (query ? '?' + query : ''), true);
}

function addHistory(songId) {
  return post('/history/' + songId, null, true);
}

function getSongLyrics(songId) {
  return get('/songs/' + songId + '/lyrics', false);
}

function getProfile() {
  return get('/auth/profile', true);
}

function updateProfile(data) {
  return put('/auth/profile', data, true);
}

function getPlaylists() {
  return get('/playlists', true);
}

function getPlaylistDetail(id) {
  return get('/playlists/' + id, true);
}

function createPlaylist(data) {
  return post('/playlists', data, true);
}

function updatePlaylist(id, data) {
  return put('/playlists/' + id, data, true);
}

function deletePlaylist(id) {
  return del('/playlists/' + id, true);
}

function addSongToPlaylist(playlistId, songId) {
  return post('/playlists/' + playlistId + '/songs', { songId }, true);
}

function removeSongFromPlaylist(playlistId, songId) {
  return del('/playlists/' + playlistId + '/songs/' + songId, true);
}

function getSongs(params) {
  const query = new URLSearchParams(params || {}).toString();
  return get('/songs' + (query ? '?' + query : ''), false);
}

function getSongDetail(id) {
  return get('/songs/' + id, false);
}

export {
  request, get, post, put, del,
  getSongStreamUrl,
  addFavorite, removeFavorite, getFavorites,
  getAlbums, getAlbumDetail,
  getArtists, getArtistDetail,
  getHistory, addHistory,
  getSongLyrics,
  getProfile, updateProfile,
  getPlaylists, getPlaylistDetail,
  createPlaylist, updatePlaylist, deletePlaylist,
  addSongToPlaylist, removeSongFromPlaylist,
  getSongs, getSongDetail
};
