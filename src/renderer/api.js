const baseURL = 'http://localhost:3000/api';

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

  return response.data;
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

function addFavorite(songId) {
  return post('/favorites', { songId }, true);
}

function removeFavorite(songId) {
  return del('/favorites/' + songId, true);
}

function getFavorites() {
  return get('/favorites', true);
}

export { request, get, post, put, del, addFavorite, removeFavorite, getFavorites };
