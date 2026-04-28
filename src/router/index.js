import { createRouter, createMemoryHistory } from 'vue-router';
import LocalMusic from '@/views/LocalMusic.vue';
import OnlineMusic from '@/views/OnlineMusic.vue';
import Favorites from '@/views/Favorites.vue';
import History from '@/views/History.vue';

const routes = [
  { path: '/', name: 'local', component: LocalMusic },
  { path: '/online', name: 'online', component: OnlineMusic },
  { path: '/favorites', name: 'favorites', component: Favorites },
  { path: '/history', name: 'history', component: History },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
