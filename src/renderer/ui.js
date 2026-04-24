import { login, register, logout, getCurrentUser, isLoggedIn } from './auth.js';
import { addFavorite, removeFavorite, getFavorites } from './api.js';

export function updateSongDisplay(song) {
  const songTitle = document.getElementById('song-title');
  const songArtist = document.getElementById('song-artist');
  const controlSongTitle = document.getElementById('control-song-title');
  const controlSongArtist = document.getElementById('control-song-artist');

  if (song) {
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    controlSongTitle.textContent = song.title;
    controlSongArtist.textContent = song.artist;
  } else {
    songTitle.textContent = '未在播放';
    songArtist.textContent = '--';
    controlSongTitle.textContent = '未在播放';
    controlSongArtist.textContent = '--';
  }
}

export function showContextMenu(e, index, onRemove) {
  const existing = document.querySelector('.context-menu');
  if (existing) existing.remove();

  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';

  const deleteItem = document.createElement('div');
  deleteItem.className = 'context-menu-item';
  deleteItem.textContent = '删除';
  deleteItem.addEventListener('click', () => {
    onRemove(index);
    menu.remove();
  });

  menu.appendChild(deleteItem);
  document.body.appendChild(menu);

  const closeMenu = (evt) => {
    if (!menu.contains(evt.target)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  };

  setTimeout(() => {
    document.addEventListener('click', closeMenu);
  }, 0);
}

export function initTheme() {
  const themeDots = document.querySelectorAll('.theme-dot');

  function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    themeDots.forEach(dot => {
      dot.classList.toggle('active', dot.dataset.theme === themeName);
    });
    localStorage.setItem('solo-theme', themeName);
  }

  themeDots.forEach(dot => {
    dot.addEventListener('click', () => {
      setTheme(dot.dataset.theme);
    });
  });

  const savedTheme = localStorage.getItem('solo-theme') || 'indigo';
  setTheme(savedTheme);
}

let isRegisterMode = false;

export function showAuthModal(isRegister) {
  isRegisterMode = isRegister;
  const modal = document.getElementById('auth-modal');
  const title = document.getElementById('auth-modal-title');
  const submitBtn = document.getElementById('auth-submit-btn');
  const switchText = document.getElementById('auth-switch-text');
  const switchBtn = document.getElementById('auth-switch-btn');
  const errorEl = document.getElementById('auth-error');

  errorEl.style.display = 'none';
  document.getElementById('auth-form').reset();

  if (isRegister) {
    title.textContent = '注册';
    submitBtn.textContent = '注册';
    switchText.textContent = '已有账号？';
    switchBtn.textContent = '立即登录';
  } else {
    title.textContent = '登录';
    submitBtn.textContent = '登录';
    switchText.textContent = '还没有账号？';
    switchBtn.textContent = '立即注册';
  }

  modal.style.display = 'flex';
}

export function hideAuthModal() {
  const modal = document.getElementById('auth-modal');
  modal.style.display = 'none';
  document.getElementById('auth-form').reset();
  document.getElementById('auth-error').style.display = 'none';
}

export async function updateUserArea() {
  const userInfo = document.getElementById('user-info');
  const loginBtn = document.getElementById('login-btn');
  const userName = document.getElementById('user-name');
  const userAvatar = document.getElementById('user-avatar');

  const auth = await getCurrentUser();

  if (auth && auth.user) {
    userInfo.style.display = 'flex';
    loginBtn.style.display = 'none';
    userName.textContent = auth.user.username;
    userAvatar.textContent = auth.user.username.charAt(0).toUpperCase();
  } else {
    userInfo.style.display = 'none';
    loginBtn.style.display = 'flex';
  }
}

export function initAuthModal() {
  const modal = document.getElementById('auth-modal');
  const closeBtn = document.getElementById('auth-modal-close');
  const form = document.getElementById('auth-form');
  const switchBtn = document.getElementById('auth-switch-btn');
  const errorEl = document.getElementById('auth-error');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');

  closeBtn.addEventListener('click', hideAuthModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideAuthModal();
  });

  switchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showAuthModal(!isRegisterMode);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;

    errorEl.style.display = 'none';

    try {
      if (isRegisterMode) {
        await register(username, password);
      } else {
        await login(username, password);
      }
      hideAuthModal();
      await updateUserArea();
    } catch (err) {
      errorEl.textContent = err.message || (isRegisterMode ? '注册失败' : '登录失败');
      errorEl.style.display = 'block';
    }
  });

  loginBtn.addEventListener('click', () => {
    showAuthModal(false);
  });

  logoutBtn.addEventListener('click', async () => {
    await logout();
    await updateUserArea();
  });

  window.addEventListener('auth-changed', () => {
    updateUserArea();
  });

  window.addEventListener('auth-expired', () => {
    updateUserArea();
    showAuthModal(false);
    showToast('登录已过期，请重新登录', 'error');
  });

  updateUserArea();
}

export function switchView(viewName) {
  const views = {
    local: document.getElementById('player-view'),
    online: document.getElementById('online-view'),
    favorites: document.getElementById('favorites-view')
  };

  const navItems = {
    local: document.getElementById('nav-local'),
    online: document.getElementById('nav-online'),
    favorites: document.getElementById('nav-favorites')
  };

  Object.entries(views).forEach(([name, el]) => {
    if (el) {
      el.style.display = name === viewName ? 'flex' : 'none';
    }
  });

  Object.entries(navItems).forEach(([name, el]) => {
    if (el) {
      el.classList.toggle('active', name === viewName);
    }
  });

  window.dispatchEvent(new CustomEvent('view-changed', { detail: { view: viewName } }));
}

export function initNavigation() {
  const navLocal = document.getElementById('nav-local');
  const navOnline = document.getElementById('nav-online');
  const navFavorites = document.getElementById('nav-favorites');

  navLocal.addEventListener('click', () => switchView('local'));
  navOnline.addEventListener('click', () => switchView('online'));
  navFavorites.addEventListener('click', () => switchView('favorites'));
}

let _currentSong = null;

export function initFavoriteButton() {
  const btn = document.getElementById('favorite-btn');
  const outlineIcon = btn.querySelector('.icon-favorite-outline');
  const filledIcon = btn.querySelector('.icon-favorite-filled');

  btn.addEventListener('click', async () => {
    if (!_currentSong) return;

    if (!_currentSong.type || _currentSong.type !== 'online') {
      return;
    }

    try {
      const isFilled = filledIcon.style.display !== 'none';
      if (isFilled) {
        await removeFavorite(_currentSong.id);
        outlineIcon.style.display = '';
        filledIcon.style.display = 'none';
      } else {
        await addFavorite(_currentSong.id);
        outlineIcon.style.display = 'none';
        filledIcon.style.display = '';
      }
    } catch (err) {
      console.error('Favorite toggle error:', err);
    }
  });
}

export function showToast(message, type) {
  type = type || 'info';
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3000);
}

export async function updateFavoriteButton(song) {
  _currentSong = song;
  const btn = document.getElementById('favorite-btn');
  const outlineIcon = btn.querySelector('.icon-favorite-outline');
  const filledIcon = btn.querySelector('.icon-favorite-filled');

  if (!song || !song.type || song.type !== 'online') {
    btn.style.display = 'none';
    return;
  }

  btn.style.display = '';

  try {
    const data = await getFavorites();
    const songs = data.songs || [];
    const isFav = songs.some(s => s.id === song.id);
    if (isFav) {
      outlineIcon.style.display = 'none';
      filledIcon.style.display = '';
    } else {
      outlineIcon.style.display = '';
      filledIcon.style.display = 'none';
    }
  } catch (err) {
    outlineIcon.style.display = '';
    filledIcon.style.display = 'none';
  }
}
