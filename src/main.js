const { app, BrowserWindow, ipcMain, dialog, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const musicMetadata = require('music-metadata');

let mainWindow;

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'local',
    privileges: {
      stream: true,
      supportFetchAPI: true
    }
  }
]);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'logo.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  protocol.registerFileProtocol('local', (request, callback) => {
    let filePath = request.url.replace('local://audio/', '');
    filePath = decodeURIComponent(filePath);
    callback({ path: filePath });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'flac', 'ogg', 'aac'] }
    ]
  });
  if (result.canceled) return [];
  return result.filePaths;
});

ipcMain.handle('open-folder-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (result.canceled) return '';
  return result.filePaths[0];
});

ipcMain.handle('get-audio-metadata', async (_event, filePath) => {
  try {
    const metadata = await musicMetadata.parseFile(filePath);
    return {
      title: metadata.common.title || path.basename(filePath, path.extname(filePath)),
      artist: metadata.common.artist || 'Unknown Artist',
      album: metadata.common.album || 'Unknown Album',
      duration: metadata.format.duration || 0
    };
  } catch {
    return {
      title: path.basename(filePath, path.extname(filePath)),
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      duration: 0
    };
  }
});

ipcMain.handle('read-lyric-file', async (_event, filePath) => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return content;
  } catch {
    return '';
  }
});

ipcMain.handle('find-lyric-file', async (_event, audioFilePath) => {
  const dir = path.dirname(audioFilePath);
  const baseName = path.basename(audioFilePath, path.extname(audioFilePath));
  const lrcPath = path.join(dir, baseName + '.lrc');
  try {
    await fs.promises.access(lrcPath);
    return lrcPath;
  } catch {
    return '';
  }
});

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.flac', '.ogg', '.aac']);

async function scanDirectoryRecursive(dirPath) {
  const results = [];
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const subResults = await scanDirectoryRecursive(fullPath);
      results.push(...subResults);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (AUDIO_EXTENSIONS.has(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

ipcMain.handle('scan-folder', async (_event, folderPath) => {
  try {
    const files = await scanDirectoryRecursive(folderPath);
    return files;
  } catch {
    return [];
  }
});

ipcMain.handle('open-lyric-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Lyric Files', extensions: ['lrc'] }
    ]
  });
  if (result.canceled) return '';
  return result.filePaths[0];
});

const playlistPath = path.join(app.getPath('userData'), 'playlist.json');

ipcMain.handle('save-playlist', async (_event, data) => {
  try {
    await fs.promises.writeFile(playlistPath, JSON.stringify(data), 'utf-8');
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('load-playlist', async () => {
  try {
    const content = await fs.promises.readFile(playlistPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
});
