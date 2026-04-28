export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

export function parseLRC(lrcText) {
  if (!lrcText) return [];
  const lines = lrcText.split('\n').filter(l => l.trim());
  const lyrics = [];
  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (match) {
      const time = parseInt(match[1]) * 60 + parseInt(match[2]) + parseInt(match[3]) / (match[3].length === 3 ? 1000 : 100);
      lyrics.push({ time, text: match[4].trim() });
    }
  }
  return lyrics.filter(l => l.text).sort((a, b) => a.time - b.time);
}

export function extractFileName(filePath) {
  return filePath.split(/[\\/]/).pop().replace(/\.[^/.]+$/, '');
}

export function convertSong(song) {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist?.name || '未知歌手',
    album: song.album?.name || '',
    duration: song.duration || 0,
    type: 'online'
  };
}
