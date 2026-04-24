import { post } from './api.js';

async function login(username, password) {
  const data = await post('/auth/login', { username, password });
  await window.electronAPI.storeSet('auth', { token: data.token, user: data.user });
  window.dispatchEvent(new CustomEvent('auth-changed'));
  return data.user;
}

async function register(username, password) {
  await post('/auth/register', { username, password });
  return login(username, password);
}

async function logout() {
  await window.electronAPI.storeDelete('auth');
  window.dispatchEvent(new CustomEvent('auth-changed'));
}

async function getCurrentUser() {
  const auth = await window.electronAPI.storeGet('auth');
  return auth || null;
}

async function isLoggedIn() {
  const user = await getCurrentUser();
  return user !== null;
}

async function initAuth() {
  const auth = await getCurrentUser();
  if (auth) {
    window.dispatchEvent(new CustomEvent('auth-changed'));
  }
}

export { login, register, logout, getCurrentUser, isLoggedIn, initAuth };
