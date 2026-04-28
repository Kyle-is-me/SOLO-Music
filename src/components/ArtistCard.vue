<template>
  <div class="artist-card" @click="$emit('click')">
    <div class="artist-card-avatar">
      <img v-if="artist.avatar" :src="artist.avatar" :alt="artist.name" loading="lazy" />
    </div>
    <div class="playlist-card-info">
      <div class="playlist-card-name">{{ artist.name }}</div>
      <div class="playlist-card-count">{{ artist._count?.albums || 0 }} 张专辑 · {{ artist._count?.songs || 0 }} 首歌曲</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  artist: { type: Object, required: true },
});
defineEmits(['click']);
</script>

<style scoped>
.artist-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--border);
  text-align: center;
}
.artist-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border-color: rgba(var(--accent-rgb), 0.2);
}
.artist-card-avatar {
  width: 60%;
  aspect-ratio: 1;
  background: var(--disc-center);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  margin: 16px auto 0;
}
.artist-card-avatar img {
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
