import { defineStore } from 'pinia';

export const usePlaylistStore = defineStore('playlist', {
  state: () => ({
    songs: [],
    loading: false,
  }),
  actions: {
    addSongs(newSongs) {
      this.songs.push(...newSongs);
      this.saveToStorage();
    },
    removeSong(index) {
      this.songs.splice(index, 1);
      this.saveToStorage();
    },
    clear() {
      this.songs = [];
      this.saveToStorage();
    },
    async loadFromStorage() {
      try {
        const data = await window.electronAPI.loadPlaylist();
        if (Array.isArray(data)) {
          this.songs = data;
        }
      } catch {}
    },
    async saveToStorage() {
      try {
        await window.electronAPI.savePlaylist(this.songs);
      } catch {}
    },
  },
});
