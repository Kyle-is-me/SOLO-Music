window.addEventListener('DOMContentLoaded', () => {
  const electronAPI = window.electronAPI;

  if (!electronAPI) {
    document.body.innerHTML = '<div style="color:#e8e8f0;padding:40px;text-align:center;font-size:16px;">应用初始化失败，请重新启动</div>';
    return;
  }

  let playlist = [];
  let currentIndex = -1;
  let playMode = 'sequential';
  let lyrics = [];
  let currentLyricIndex = -1;
  let isSeeking = false;
  let previousVolume = 100;

  const audio = document.getElementById('audio-player');
  const playlistList = document.getElementById('playlist-list');
  const songTitle = document.getElementById('song-title');
  const songArtist = document.getElementById('song-artist');
  const playBtn = document.getElementById('play-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const progressBar = document.getElementById('progress-bar');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const currentTimeEl = document.getElementById('current-time');
  const totalTimeEl = document.getElementById('total-time');
  const volumeBtn = document.getElementById('volume-btn');
  const volumeBar = document.getElementById('volume-bar');
  const volumePercent = document.getElementById('volume-percent');
  const modeBtn = document.getElementById('mode-btn');
  const lyricsContent = document.getElementById('lyrics-content');
  const addMusicBtn = document.getElementById('add-music-btn');
  const addFolderBtn = document.getElementById('add-folder-btn');
  const clearListBtn = document.getElementById('clear-list-btn');
  const loadLyricBtn = document.getElementById('load-lyric-btn');
  const albumDisc = document.getElementById('album-disc');
  const controlSongTitle = document.getElementById('control-song-title');
  const controlSongArtist = document.getElementById('control-song-artist');

  function parseLRC(lrcText) {
    const result = [];
    const lines = lrcText.split('\n');
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

    for (const line of lines) {
      const times = [];
      let match;
      while ((match = timeRegex.exec(line)) !== null) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const ms = match[3].length === 2
          ? parseInt(match[3], 10) * 10
          : parseInt(match[3], 10);
        times.push(minutes * 60 + seconds + ms / 1000);
      }

      const text = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim();
      if (text.length === 0) continue;

      for (const time of times) {
        result.push({ time, text });
      }
    }

    result.sort((a, b) => a.time - b.time);
    return result;
  }

  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function savePlaylist() {
    electronAPI.savePlaylist(playlist);
  }

  async function addFiles() {
    try {
      const filePaths = await electronAPI.openFileDialog();
      if (!filePaths || filePaths.length === 0) return;

      for (const filePath of filePaths) {
        try {
          const metadata = await electronAPI.getAudioMetadata(filePath);
          playlist.push({
            filePath,
            title: metadata.title || extractFileName(filePath),
            artist: metadata.artist || '未知艺术家',
            album: metadata.album || '',
            duration: metadata.duration || 0
          });
        } catch (err) {
          console.error('Failed to get metadata for:', filePath, err);
          playlist.push({
            filePath,
            title: extractFileName(filePath),
            artist: '未知艺术家',
            album: '',
            duration: 0
          });
        }
      }

      renderPlaylist();
      savePlaylist();
    } catch (err) {
      console.error('addFiles error:', err);
    }
  }

  async function addFolder() {
    try {
      const folderPath = await electronAPI.openFolderDialog();
      if (!folderPath) return;

      const filePaths = await electronAPI.scanFolder(folderPath);
      if (!filePaths || filePaths.length === 0) return;

      for (const filePath of filePaths) {
        try {
          const metadata = await electronAPI.getAudioMetadata(filePath);
          playlist.push({
            filePath,
            title: metadata.title || extractFileName(filePath),
            artist: metadata.artist || '未知艺术家',
            album: metadata.album || '',
            duration: metadata.duration || 0
          });
        } catch (err) {
          console.error('Failed to get metadata for:', filePath, err);
          playlist.push({
            filePath,
            title: extractFileName(filePath),
            artist: '未知艺术家',
            album: '',
            duration: 0
          });
        }
      }

      renderPlaylist();
      savePlaylist();
    } catch (err) {
      console.error('addFolder error:', err);
    }
  }

  function extractFileName(filePath) {
    const parts = filePath.replace(/\\/g, '/').split('/');
    const name = parts[parts.length - 1];
    return name.replace(/\.[^/.]+$/, '');
  }

  function removeSong(index) {
    playlist.splice(index, 1);

    if (playlist.length === 0) {
      currentIndex = -1;
      audio.pause();
      audio.src = '';
      updateSongDisplay(null);
      lyrics = [];
      renderLyrics();
    } else if (index < currentIndex) {
      currentIndex--;
    } else if (index === currentIndex) {
      if (currentIndex >= playlist.length) {
        currentIndex = playlist.length - 1;
      }
      if (currentIndex >= 0) {
        playSong(currentIndex);
      }
    }

    renderPlaylist();
    savePlaylist();
  }

  function clearList() {
    playlist = [];
    currentIndex = -1;
    audio.pause();
    audio.src = '';
    updateSongDisplay(null);
    currentTimeEl.textContent = '0:00';
    totalTimeEl.textContent = '0:00';
    progressBar.value = 0;
    progressBarFill.style.width = '0%';
    setPlayIcon(false);
    lyrics = [];
    currentLyricIndex = -1;
    renderPlaylist();
    renderLyrics();
    savePlaylist();
  }

  function updateSongDisplay(song) {
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

  function renderPlaylist() {
    playlistList.innerHTML = '';

    playlist.forEach((song, index) => {
      const item = document.createElement('div');
      item.className = 'playlist-item' + (index === currentIndex ? ' active' : '');
      item.dataset.index = index;

      const titleEl = document.createElement('div');
      titleEl.className = 'playlist-item-title';
      titleEl.textContent = song.title;

      const artistEl = document.createElement('div');
      artistEl.className = 'playlist-item-artist';
      artistEl.textContent = song.artist;

      item.appendChild(titleEl);
      item.appendChild(artistEl);

      item.addEventListener('dblclick', () => {
        playSong(index);
      });

      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e, index);
      });

      playlistList.appendChild(item);
    });
  }

  function showContextMenu(e, index) {
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
      removeSong(index);
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

  async function playSong(index) {
    if (index < 0 || index >= playlist.length) return;

    currentIndex = index;
    const song = playlist[index];

    audio.src = `local://audio/${encodeURIComponent(song.filePath)}`;
    audio.load();

    updateSongDisplay(song);
    renderPlaylist();

    await loadLyrics(song.filePath);

    try {
      await audio.play();
      setPlayIcon(true);
      albumDisc.classList.add('spinning');
    } catch (err) {
      console.error('playSong error:', err);
      setPlayIcon(false);
      albumDisc.classList.remove('spinning');
    }
  }

  function setPlayIcon(isPlaying) {
    const iconPlay = playBtn.querySelector('.icon-play');
    const iconPause = playBtn.querySelector('.icon-pause');
    if (isPlaying) {
      iconPlay.style.display = 'none';
      iconPause.style.display = 'block';
    } else {
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
    }
  }

  function togglePlay() {
    if (currentIndex === -1 && playlist.length > 0) {
      playSong(0);
      return;
    }

    if (audio.paused) {
      audio.play().then(() => {
        setPlayIcon(true);
        albumDisc.classList.add('spinning');
      }).catch(() => {});
    } else {
      audio.pause();
      setPlayIcon(false);
      albumDisc.classList.remove('spinning');
    }
  }

  function playPrev() {
    if (playlist.length === 0) return;

    if (playMode === 'shuffle') {
      const next = Math.floor(Math.random() * playlist.length);
      playSong(next);
    } else {
      const prev = currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;
      playSong(prev);
    }
  }

  function playNext() {
    if (playlist.length === 0) return;

    if (playMode === 'loop-one') {
      playSong(currentIndex);
    } else if (playMode === 'shuffle') {
      let next = Math.floor(Math.random() * playlist.length);
      if (playlist.length > 1) {
        while (next === currentIndex) {
          next = Math.floor(Math.random() * playlist.length);
        }
      }
      playSong(next);
    } else {
      const next = currentIndex >= playlist.length - 1 ? 0 : currentIndex + 1;
      playSong(next);
    }
  }

  function updateProgress() {
    if (isSeeking) return;

    const current = audio.currentTime;
    const duration = audio.duration || 0;

    currentTimeEl.textContent = formatTime(current);

    if (duration > 0) {
      const percent = (current / duration) * 100;
      progressBar.value = (current / duration) * 1000;
      progressBarFill.style.width = percent + '%';
    }

    syncLyrics(current);
  }

  function seekTo(position) {
    const duration = audio.duration || 0;
    if (duration > 0) {
      audio.currentTime = (position / 1000) * duration;
      const percent = (position / 1000) * 100;
      progressBarFill.style.width = percent + '%';
    }
  }

  function setVolume(value) {
    audio.volume = value / 100;
    updateVolumeIcon(value);
    volumePercent.textContent = value + '%';
    volumeBar.style.background = `linear-gradient(to right, var(--accent) ${value}%, rgba(255,255,255,0.08) ${value}%)`;
  }

  function updateVolumeIcon(value) {
    const iconVolume = volumeBtn.querySelector('.icon-volume');
    const iconMute = volumeBtn.querySelector('.icon-mute');
    if (value === 0 || audio.muted) {
      iconVolume.style.display = 'none';
      iconMute.style.display = 'block';
    } else {
      iconVolume.style.display = 'block';
      iconMute.style.display = 'none';
    }
  }

  function toggleMute() {
    if (audio.muted) {
      audio.muted = false;
      volumeBar.value = previousVolume;
      updateVolumeIcon(previousVolume);
      volumePercent.textContent = previousVolume + '%';
      volumeBar.style.background = `linear-gradient(to right, var(--accent) ${previousVolume}%, rgba(255,255,255,0.08) ${previousVolume}%)`;
    } else {
      previousVolume = parseInt(volumeBar.value, 10);
      audio.muted = true;
      updateVolumeIcon(0);
      volumePercent.textContent = '0%';
      volumeBar.style.background = `linear-gradient(to right, var(--accent) 0%, rgba(255,255,255,0.08) 0%)`;
    }
  }

  function togglePlayMode() {
    modeBtn.classList.remove('mode-loop-one', 'mode-shuffle');

    if (playMode === 'sequential') {
      playMode = 'loop-one';
      modeBtn.classList.add('mode-loop-one');
      modeBtn.title = '单曲循环';
    } else if (playMode === 'loop-one') {
      playMode = 'shuffle';
      modeBtn.classList.add('mode-shuffle');
      modeBtn.title = '随机播放';
    } else {
      playMode = 'sequential';
      modeBtn.title = '顺序播放';
    }
  }

  async function loadLyrics(audioFilePath) {
    lyrics = [];
    currentLyricIndex = -1;

    try {
      const lyricPath = await electronAPI.findLyricFile(audioFilePath);
      if (lyricPath) {
        const content = await electronAPI.readLyricFile(lyricPath);
        if (content) {
          lyrics = parseLRC(content);
        }
      }
    } catch (err) {
      console.error('loadLyrics error:', err);
    }

    renderLyrics();
  }

  async function loadLyricsManual() {
    if (currentIndex === -1) return;

    try {
      const lyricPath = await electronAPI.openLyricDialog();
      if (!lyricPath) return;

      const content = await electronAPI.readLyricFile(lyricPath);
      if (content) {
        lyrics = parseLRC(content);
        currentLyricIndex = -1;
        renderLyrics();
      }
    } catch (err) {
      console.error('loadLyricsManual error:', err);
    }
  }

  function renderLyrics() {
    lyricsContent.innerHTML = '';

    if (lyrics.length === 0) {
      const noLyrics = document.createElement('div');
      noLyrics.className = 'no-lyrics';
      noLyrics.textContent = '暂无歌词';
      lyricsContent.appendChild(noLyrics);
      return;
    }

    lyrics.forEach((line, index) => {
      const el = document.createElement('div');
      el.className = 'lyric-line';
      el.dataset.index = index;
      el.textContent = line.text;
      el.addEventListener('click', () => {
        audio.currentTime = line.time;
      });
      lyricsContent.appendChild(el);
    });
  }

  function syncLyrics(currentTime) {
    if (lyrics.length === 0) return;

    let newIndex = -1;

    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        newIndex = i;
        break;
      }
    }

    if (newIndex === currentLyricIndex) return;

    currentLyricIndex = newIndex;

    const lines = lyricsContent.querySelectorAll('.lyric-line');
    lines.forEach((line, i) => {
      line.classList.remove('active', 'passed', 'nearby', 'far');
      const distance = Math.abs(i - newIndex);
      if (i === newIndex) {
        line.classList.add('active');
      } else if (distance <= 3) {
        line.classList.add('nearby');
        if (i < newIndex) line.classList.add('passed');
      } else {
        line.classList.add('far');
        if (i < newIndex) line.classList.add('passed');
      }
    });

    if (newIndex >= 0 && lines[newIndex]) {
      lines[newIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  addMusicBtn.addEventListener('click', addFiles);
  addFolderBtn.addEventListener('click', addFolder);
  clearListBtn.addEventListener('click', clearList);
  playBtn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', playPrev);
  nextBtn.addEventListener('click', playNext);
  modeBtn.addEventListener('click', togglePlayMode);
  volumeBtn.addEventListener('click', toggleMute);
  loadLyricBtn.addEventListener('click', loadLyricsManual);

  progressBar.addEventListener('mousedown', () => {
    isSeeking = true;
  });

  progressBar.addEventListener('mouseup', () => {
    isSeeking = false;
  });

  progressBar.addEventListener('input', (e) => {
    seekTo(parseInt(e.target.value, 10));
  });

  volumeBar.addEventListener('input', (e) => {
    const value = parseInt(e.target.value, 10);
    setVolume(value);
  });

  audio.addEventListener('ended', () => {
    playNext();
  });

  audio.addEventListener('timeupdate', () => {
    updateProgress();
  });

  audio.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('play', () => {
    setPlayIcon(true);
    albumDisc.classList.add('spinning');
  });

  audio.addEventListener('pause', () => {
    setPlayIcon(false);
    albumDisc.classList.remove('spinning');
  });

  document.addEventListener('click', (e) => {
    const menu = document.querySelector('.context-menu');
    if (menu && !menu.contains(e.target)) {
      menu.remove();
    }
  });

  volumeBar.style.background = `linear-gradient(to right, var(--accent) 100%, rgba(255,255,255,0.08) 100%)`;

  async function initPlaylist() {
    try {
      const saved = await electronAPI.loadPlaylist();
      if (saved && saved.length > 0) {
        playlist = saved;
        renderPlaylist();
      }
    } catch (err) {
      console.error('loadPlaylist error:', err);
    }
  }

  initPlaylist();
});
