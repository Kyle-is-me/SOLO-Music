<template>
  <div class="local-music-view">
    <div class="album-section">
      <div class="album-disc" :class="{ spinning: player.isPlaying }">
        <div class="album-art">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M9 18V5l12-2v13" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/><circle cx="6" cy="18" r="3" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/><circle cx="18" cy="16" r="3" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/></svg>
        </div>
      </div>
      <div class="song-detail">
        <div class="song-title">{{ currentSong?.title || '未在播放' }}</div>
        <div class="song-artist">{{ currentSong?.artist || '--' }}</div>
      </div>
    </div>
    <div class="lyrics-section">
      <div class="lyrics-header">
        <span>歌词</span>
        <button class="load-lyric-btn" @click="player.loadManualLyrics()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
          加载歌词
        </button>
      </div>
      <div class="lyrics-content" ref="lyricsContainer">
        <div
          v-for="(line, i) in player.lyrics"
          :key="i"
          class="lyric-line"
          :class="{ active: i === player.currentLyricIndex }"
          @click="seekToLyric(line.time)"
        >{{ line.text }}</div>
        <div v-if="!player.lyrics.length" class="lyric-empty">暂无歌词</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { usePlaylistStore } from '@/stores/playlist';

const player = usePlayerStore();
const playlist = usePlaylistStore();
const lyricsContainer = ref(null);

const currentSong = computed(() => {
  if (player.currentIndex >= 0 && player.currentIndex < playlist.songs.length) {
    return playlist.songs[player.currentIndex];
  }
  return null;
});

function seekToLyric(time) {
  if (player.audioRef) {
    player.audioRef.currentTime = time;
  }
}

watch(() => player.currentLyricIndex, () => {
  if (!lyricsContainer.value) return;
  const active = lyricsContainer.value.querySelector('.lyric-line.active');
  if (active) {
    active.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});
</script>

<style scoped>
.local-music-view {
  display: flex;
  flex: 1;
  gap: 24px;
  padding: 24px;
  overflow: hidden;
}
.album-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.album-disc {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: var(--disc-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  animation: spin 20s linear infinite;
  animation-play-state: paused;
}
.album-disc.spinning {
  animation-play-state: running;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.album-art {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--disc-center);
  display: flex;
  align-items: center;
  justify-content: center;
}
.song-detail {
  text-align: center;
}
.song-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}
.song-artist {
  font-size: 13px;
  color: var(--text-secondary);
}
.lyrics-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  overflow: hidden;
}
.lyrics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
}
.load-lyric-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-secondary);
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
}
.load-lyric-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
}
.lyrics-content {
  flex: 1;
  overflow-y: auto;
  text-align: center;
  padding: 20px 0;
}
.lyric-line {
  padding: 6px 0;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}
.lyric-line.active {
  color: var(--accent);
  font-size: 15px;
  font-weight: 600;
}
.lyric-line:hover {
  color: var(--text-secondary);
}
.lyric-empty {
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 40px;
}
</style>
