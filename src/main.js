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
  },
  {
    scheme: 'stream',
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

  protocol.registerStreamProtocol('stream', (request, callback) => {
    const urlPath = request.url.replace('stream://', '');
    const parts = urlPath.split('/');
    if (parts[0] === 'song' && parts[1]) {
      const songId = parts[1];
      const streamUrl = 'http://localhost:3000/api/v1/songs/' + songId + '/stream';

      readStore().then(store => {
        const token = store.auth && store.auth.token;
        const headers = {};
        if (token) {
          headers.Authorization = 'Bearer ' + token;
        }

        const parsedUrl = new URL(streamUrl);
        const httpModule = require('http');
        const requestOptions = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || 80,
          path: parsedUrl.pathname,
          headers: headers
        };

        const req = httpModule.get(requestOptions, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const redirectUrl = new URL(res.headers.location, streamUrl);
            const redirectOpts = {
              hostname: redirectUrl.hostname,
              port: redirectUrl.port || 80,
              path: redirectUrl.pathname + redirectUrl.search,
              headers: headers
            };
            const redirectReq = httpModule.get(redirectOpts, (redirectRes) => {
              callback(redirectRes);
            });
            redirectReq.on('error', () => {
              callback({ status: 500 });
            });
          } else {
            callback(res);
          }
        });

        req.on('error', () => {
          callback({ status: 500 });
        });
      });
    } else {
      callback({ status: 404 });
    }
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

ipcMain.handle('http-request', async (_event, options) => {
  const { method = 'GET', url, headers = {}, body } = options;
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const httpModule = isHttps ? require('https') : require('http');

    let requestBody = body;
    if (body && typeof body === 'object') {
      requestBody = JSON.stringify(body);
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    const requestOptions = {
      method: method.toUpperCase(),
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      headers: requestBody ? { ...headers, 'Content-Length': Buffer.byteLength(requestBody) } : headers
    };

    const req = httpModule.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsedData = data;
        try {
          parsedData = JSON.parse(data);
        } catch {}
        resolve({ status: res.statusCode, data: parsedData, error: null });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 0, data: null, error: err.message });
    });

    req.setTimeout(15000, () => {
      req.destroy();
      resolve({ status: 0, data: null, error: 'Request timeout after 15s' });
    });

    if (requestBody) {
      req.write(requestBody);
    }
    req.end();
  });
});

const storePath = path.join(app.getPath('userData'), 'app-store.json');

async function readStore() {
  try {
    const content = await fs.promises.readFile(storePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function writeStore(data) {
  await fs.promises.writeFile(storePath, JSON.stringify(data, null, 2), 'utf-8');
}

ipcMain.handle('store-get', async (_event, key) => {
  const store = await readStore();
  if (key === undefined || key === null) return store;
  return store[key] !== undefined ? store[key] : null;
});

ipcMain.handle('store-set', async (_event, key, value) => {
  const store = await readStore();
  store[key] = value;
  await writeStore(store);
  return true;
});

ipcMain.handle('store-delete', async (_event, key) => {
  const store = await readStore();
  delete store[key];
  await writeStore(store);
  return true;
});
