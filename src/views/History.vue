<template>
  <div class="history-view">
    <div class="history-header"><h2>播放历史</h2></div>
    <div v-if="!authStore.isLoggedIn" class="tip">请先登录查看播放历史</div>
    <template v-else>
      <SongRow
        v-for="(song, i) in songs"
        :key="song.id"
        :song="song"
        :index="i"
        @dblclick="playSong(song)"
      />
      <div v-if="!songs.length && !loading" class="tip">暂无播放历史</div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { usePlayerStore } from '@/stores/player';
import { usePlaylistStore } from '@/stores/playlist';
import { getHistory } from '@/api';
import { convertSong } from '@/utils';
import SongRow from '@/components/SongRow.vue';

const authStore = useAuthStore();
const playerStore = usePlayerStore();
const playlistStore = usePlaylistStore();
const songs = ref([]);
const loading = ref(false);

async function loadHistory() {
  if (!authStore.isLoggedIn) return;
  loading.value = true;
  try {
    const data = await getHistory({ pageSize: 50 });
    songs.value = (data.list || []).map(item => convertSong(item.song || {}));
  } catch { songs.value = []; }
  loading.value = false;
}

function playSong(song) {
  const idx = playlistStore.songs.length;
  playlistStore.addSongs([song]);
  playerStore.playSong(idx, playlistStore.songs);
}

onMounted(loadHistory);
</script>

<style scoped>
.history-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 16px;
  padding: 24px;
  overflow-y: auto;
}
.history-header h2 {
  font-size: 22px;
  font-weight: 700;
}
.tip {
  text-align: center;
  color: var(--text-muted);
  padding: 40px;
  font-size: 14px;
}
</style>
