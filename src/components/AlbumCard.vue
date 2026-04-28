<template>
  <div class="playlist-card" @click="$emit('click')">
    <div class="playlist-card-cover">
      <img v-if="album.coverPath" :src="album.coverPath" :alt="album.name" loading="lazy" />
    </div>
    <div class="playlist-card-info">
      <div class="playlist-card-name">{{ album.name }}</div>
      <div class="playlist-card-count">{{ album.artist?.name || '未知艺术家' }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  album: { type: Object, required: true },
});
defineEmits(['click']);
</script>

<style scoped>
.playlist-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--border);
}
.playlist-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border-color: rgba(var(--accent-rgb), 0.2);
}
.playlist-card-cover {
  width: 100%;
  aspect-ratio: 1;
  background: var(--disc-center);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.playlist-card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.playlist-card-info {
  padding: 10px 12px;
}
.playlist-card-name {
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.playlist-card-count {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
}
</style>
