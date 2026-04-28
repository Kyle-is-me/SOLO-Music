<template>
  <div class="online-music-view">
    <div class="online-header">
      <h2>在线音乐</h2>
      <SearchBar v-model="searchKeyword" @search="doSearch" placeholder="搜索歌曲、歌手..." />
    </div>
    <div class="online-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="online-tab"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >{{ tab.label }}</button>
    </div>

    <div v-if="searchResults.length" class="tab-content">
      <SongRow
        v-for="(song, i) in searchResults"
        :key="'search-' + i"
        :song="song"
        :index="i"
        @dblclick="playSong(song)"
      />
    </div>

    <template v-else-if="activeTab === 'playlists'">
      <div v-if="!selectedPlaylist" class="card-grid">
        <PlaylistCard
          v-for="pl in playlists"
          :key="pl.id"
          :playlist="pl"
          @click="openPlaylist(pl.id)"
        />
        <div v-if="!playlists.length && !loading" class="online-empty">{{ authStore.isLoggedIn ? '暂无歌单' : '请先登录' }}</div>
      </div>
      <div v-else class="detail-view">
        <div class="detail-header">
          <button class="back-btn" @click="selectedPlaylist = null">← 返回</button>
          <div class="detail-info">{{ playlistDetail?.name }}</div>
          <button class="btn-primary btn-sm" @click="playAll(playlistSongs)">播放全部</button>
        </div>
        <SongRow
          v-for="(song, i) in playlistSongs"
          :key="'pl-' + i"
          :song="song"
          :index="i"
          @dblclick="playSong(song)"
        />
      </div>
    </template>

    <template v-else-if="activeTab === 'albums'">
      <div v-if="!selectedAlbum" class="card-grid">
        <AlbumCard
          v-for="album in albums"
          :key="album.id"
          :album="album"
          @click="openAlbum(album.id)"
        />
      </div>
      <div v-else class="detail-view">
        <div class="detail-header">
          <button class="back-btn" @click="selectedAlbum = null">← 返回</button>
          <div class="detail-info">{{ albumDetail?.name }}</div>
          <button class="btn-primary btn-sm" @click="playAll(albumSongs)">播放全部</button>
        </div>
        <SongRow
          v-for="(song, i) in albumSongs"
          :key="'al-' + i"
          :song="song"
          :index="i"
          @dblclick="playSong(song)"
        />
      </div>
    </template>

    <template v-else-if="activeTab === 'artists'">
      <div v-if="!selectedArtist" class="card-grid">
        <ArtistCard
          v-for="artist in artists"
          :key="artist.id"
          :artist="artist"
          @click="openArtist(artist.id)"
        />
      </div>
      <div v-else class="detail-view">
        <div class="detail-header">
          <button class="back-btn" @click="selectedArtist = null">← 返回</button>
          <div class="detail-info">{{ artistDetail?.name }}</div>
          <button class="btn-primary btn-sm" @click="playAll(artistSongs)">播放全部</button>
        </div>
        <SongRow
          v-for="(song, i) in artistSongs"
          :key="'ar-' + i"
          :song="song"
          :index="i"
          @dblclick="playSong(song)"
        />
      </div>
    </template>

    <div v-if="loading" class="online-loading">加载中...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { usePlayerStore } from '@/stores/player';
import { usePlaylistStore } from '@/stores/playlist';
import { getPlaylists, getPlaylistDetail, getAlbums, getAlbumDetail, getArtists, getArtistDetail } from '@/api';
import { convertSong } from '@/utils';
import SearchBar from '@/components/SearchBar.vue';
import SongRow from '@/components/SongRow.vue';
import PlaylistCard from '@/components/PlaylistCard.vue';
import AlbumCard from '@/components/AlbumCard.vue';
import ArtistCard from '@/components/ArtistCard.vue';
import { get } from '@/api';

const authStore = useAuthStore();
const playerStore = usePlayerStore();
const playlistStore = usePlaylistStore();

const tabs = [
  { key: 'playlists', label: '歌单' },
  { key: 'albums', label: '专辑' },
  { key: 'artists', label: '艺术家' },
];
const activeTab = ref('playlists');
const loading = ref(false);
const searchKeyword = ref('');
const searchResults = ref([]);

const playlists = ref([]);
const selectedPlaylist = ref(null);
const playlistDetail = ref(null);
const playlistSongs = ref([]);

const albums = ref([]);
const selectedAlbum = ref(null);
const albumDetail = ref(null);
const albumSongs = ref([]);

const artists = ref([]);
const selectedArtist = ref(null);
const artistDetail = ref(null);
const artistSongs = ref([]);

async function switchTab(key) {
  activeTab.value = key;
  searchResults.value = [];
  searchKeyword.value = '';
  if (key === 'playlists') loadPlaylists();
  if (key === 'albums') loadAlbums();
  if (key === 'artists') loadArtists();
}

async function doSearch(keyword) {
  loading.value = true;
  try {
    const data = await get('/search?q=' + encodeURIComponent(keyword) + '&type=song', true);
    searchResults.value = (data.songs || []).map(s => convertSong(s));
  } catch {
    searchResults.value = [];
  }
  loading.value = false;
}

async function loadPlaylists() {
  if (!authStore.isLoggedIn) return;
  loading.value = true;
  try {
    const data = await getPlaylists();
    playlists.value = Array.isArray(data) ? data : [];
  } catch { playlists.value = []; }
  loading.value = false;
}

async function openPlaylist(id) {
  loading.value = true;
  try {
    const data = await getPlaylistDetail(id);
    playlistDetail.value = data;
    playlistSongs.value = (data.songs || []).map(item => convertSong(item.song || item));
    selectedPlaylist.value = id;
  } catch {}
  loading.value = false;
}

async function loadAlbums() {
  loading.value = true;
  try {
    const data = await getAlbums({ pageSize: 50 });
    albums.value = data.list || [];
  } catch { albums.value = []; }
  loading.value = false;
}

async function openAlbum(id) {
  loading.value = true;
  try {
    const data = await getAlbumDetail(id);
    albumDetail.value = data;
    albumSongs.value = (data.songs || []).map(s => convertSong(s));
    selectedAlbum.value = id;
  } catch {}
  loading.value = false;
}

async function loadArtists() {
  loading.value = true;
  try {
    const data = await getArtists({ pageSize: 50 });
    artists.value = data.list || [];
  } catch { artists.value = []; }
  loading.value = false;
}

async function openArtist(id) {
  loading.value = true;
  try {
    const data = await getArtistDetail(id);
    artistDetail.value = data;
    artistSongs.value = (data.songs || []).map(s => convertSong(s));
    selectedArtist.value = id;
  } catch {}
  loading.value = false;
}

function playSong(song) {
  const startIdx = playlistStore.songs.length;
  playlistStore.addSongs([song]);
  playerStore.playSong(startIdx, playlistStore.songs);
}

function playAll(songs) {
  if (!songs.length) return;
  const startIdx = playlistStore.songs.length;
  playlistStore.addSongs(songs);
  playerStore.playSong(startIdx, playlistStore.songs);
}

onMounted(() => {
  loadPlaylists();
});
</script>

<style scoped>
.online-music-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 16px;
  padding: 24px;
  overflow-y: auto;
}
.online-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.online-header h2 {
  font-size: 22px;
  font-weight: 700;
}
.online-tabs {
  display: flex;
  gap: 4px;
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 4px;
  width: fit-content;
}
.online-tab {
  padding: 6px 20px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}
.online-tab.active {
  background: var(--accent);
  color: #fff;
}
.online-tab:hover:not(.active) {
  color: var(--text-primary);
  background: var(--bg-hover);
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.detail-view {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.back-btn {
  color: var(--text-secondary);
  font-size: 13px;
  background: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
}
.back-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
}
.detail-info {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
}
.btn-sm {
  padding: 6px 16px;
  font-size: 12px;
}
.online-loading, .online-empty {
  text-align: center;
  color: var(--text-muted);
  padding: 40px;
  font-size: 14px;
}
</style>
