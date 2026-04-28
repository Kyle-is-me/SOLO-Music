import { defineStore } from 'pinia';
import { post } from '@/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
  }),
  getters: {
    isLoggedIn: (state) => !!(state.token && state.user),
  },
  actions: {
    async login(username, password) {
      const data = await post('/auth/login', { username, password });
      this.token = data.token;
      this.user = data.user;
      await window.electronAPI.storeSet('auth', { token: data.token, user: data.user });
      window.dispatchEvent(new CustomEvent('auth-changed'));
    },
    async register(username, password) {
      await post('/auth/register', { username, password });
      await this.login(username, password);
    },
    async logout() {
      this.token = null;
      this.user = null;
      await window.electronAPI.storeDelete('auth');
      window.dispatchEvent(new CustomEvent('auth-changed'));
    },
    async initAuth() {
      const auth = await window.electronAPI.storeGet('auth');
      if (auth && auth.token && auth.user) {
        this.token = auth.token;
        this.user = auth.user;
        window.dispatchEvent(new CustomEvent('auth-changed'));
      }
    },
  },
});
