<template>
  <div class="song-row" @dblclick="$emit('dblclick')">
    <span class="song-row-index">{{ index + 1 }}</span>
    <span class="song-row-name">
      <span v-if="song.type === 'online'" class="song-source online-source">●</span>
      {{ song.title }}
    </span>
    <span class="song-row-artist">{{ song.artist }}</span>
    <span class="song-row-duration">{{ formatTime(song.duration) }}</span>
  </div>
</template>

<script setup>
import { formatTime } from '@/utils';

defineProps({
  song: { type: Object, required: true },
  index: { type: Number, required: true },
});

defineEmits(['dblclick']);
</script>

<style scoped>
.song-row {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.song-row:hover {
  background: var(--bg-hover);
}
.song-row-index {
  width: 32px;
  color: var(--text-muted);
  font-size: 12px;
  text-align: center;
  flex-shrink: 0;
}
.song-row-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}
.song-row-artist {
  width: 120px;
  color: var(--text-secondary);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
}
.song-row-duration {
  width: 50px;
  text-align: right;
  color: var(--text-muted);
  font-size: 12px;
  flex-shrink: 0;
}
.song-source {
  font-size: 8px;
  margin-right: 6px;
}
.online-source {
  color: var(--accent);
}
</style>
