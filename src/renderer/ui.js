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
