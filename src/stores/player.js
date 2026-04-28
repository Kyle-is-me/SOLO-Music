import { defineStore } from 'pinia';
import { addHistory, getSongLyrics } from '@/api';
import { parseLRC } from '@/utils';

export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentIndex: -1,
    playMode: 'sequential',
    volume: 100,
    previousVolume: 100,
    isMuted: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    lyrics: [],
    currentLyricIndex: -1,
    audioRef: null,
  }),
  getters: {
    currentSong: (state) => {
      return null;
    },
  },
  actions: {
    setAudioRef(audio) {
      this.audioRef = audio;
      if (audio) {
        audio.volume = this.volume / 100;
        audio.muted = this.isMuted;
      }
    },
    playSong(index, playlist) {
      if (!this.audioRef || index < 0 || index >= playlist.length) return;
      this.currentIndex = index;
      const song = playlist[index];
      if (song.type === 'online') {
        this.audioRef.src = 'stream://song/' + song.id;
        addHistory(song.id).catch(() => {});
        this.loadOnlineLyrics(song.id);
      } else {
        this.audioRef.src = 'local://audio/' + encodeURIComponent(song.filePath);
        this.loadLocalLyrics(song.filePath);
      }
      this.audioRef.play().catch(() => {});
    },
    togglePlay(playlist) {
      if (!this.audioRef) return;
      if (this.currentIndex === -1 && playlist.length > 0) {
        this.playSong(0, playlist);
        return;
      }
      if (this.audioRef.paused) {
        this.audioRef.play().catch(() => {});
      } else {
        this.audioRef.pause();
      }
    },
    playPrev(playlist) {
      if (playlist.length === 0) return -1;
      if (this.playMode === 'shuffle') {
        return Math.floor(Math.random() * playlist.length);
      }
      let idx = this.currentIndex - 1;
      if (idx < 0) idx = playlist.length - 1;
      return idx;
    },
    playNext(playlist) {
      if (playlist.length === 0) return -1;
      if (this.playMode === 'loop-one') return this.currentIndex;
      if (this.playMode === 'shuffle') return Math.floor(Math.random() * playlist.length);
      if (this.playMode === 'loop') {
        return (this.currentIndex + 1) % playlist.length;
      }
      if (this.currentIndex >= playlist.length - 1) return -1;
      return this.currentIndex + 1;
    },
    togglePlayMode() {
      const modes = ['sequential', 'loop', 'loop-one', 'shuffle'];
      const idx = modes.indexOf(this.playMode);
      this.playMode = modes[(idx + 1) % modes.length];
    },
    setVolume(val) {
      this.volume = val;
      if (this.audioRef) this.audioRef.volume = val / 100;
    },
    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.audioRef) this.audioRef.muted = this.isMuted;
    },
    seekTo(position) {
      if (!this.audioRef || !this.duration) return;
      this.audioRef.currentTime = (position / 1000) * this.duration;
    },
    async loadOnlineLyrics(songId) {
      try {
        const data = await getSongLyrics(songId);
        if (data && data.content) {
          this.lyrics = parseLRC(data.content);
        } else {
          this.lyrics = [];
        }
      } catch {
        this.lyrics = [];
      }
    },
    async loadLocalLyrics(audioFilePath) {
      try {
        const lrcPath = await window.electronAPI.findLyricFile(audioFilePath);
        if (lrcPath) {
          const content = await window.electronAPI.readLyricFile(lrcPath);
          this.lyrics = parseLRC(content);
        } else {
          this.lyrics = [];
        }
      } catch {
        this.lyrics = [];
      }
    },
    async loadManualLyrics() {
      try {
        const lrcPath = await window.electronAPI.openLyricDialog();
        if (lrcPath) {
          const content = await window.electronAPI.readLyricFile(lrcPath);
          this.lyrics = parseLRC(content);
        }
      } catch {}
    },
    syncLyrics() {
      if (!this.lyrics.length) { this.currentLyricIndex = -1; return; }
      let idx = -1;
      for (let i = 0; i < this.lyrics.length; i++) {
        if (this.currentTime >= this.lyrics[i].time) idx = i;
        else break;
      }
      this.currentLyricIndex = idx;
    },
  },
});
