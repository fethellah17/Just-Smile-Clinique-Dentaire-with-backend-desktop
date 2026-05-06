const { app, BrowserWindow, powerSaveBlocker } = require('electron');
const http = require('http');
const path = require('path');

let powerSaveId = null;

function waitForServer(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let intervalId = null;
    
    const checkServer = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          if (intervalId) clearTimeout(intervalId);
          resolve();
        } else {
          retry();
        }
      }).on('error', () => {
        retry();
      });
    };
    
    const retry = () => {
      if (Date.now() - startTime > timeout) {
        if (intervalId) clearTimeout(intervalId);
        reject(new Error('Server timeout'));
      } else {
        intervalId = setTimeout(checkServer, 500);
      }
    };
    
    checkServer();
  });
}

async function createWindow() {
  // Prevent system from throttling the app
  if (powerSaveId === null) {
    powerSaveId = powerSaveBlocker.start('prevent-app-suspension');
    console.log('🔋 Power save blocker enabled');
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'build', 'logo.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Temporarily disabled for testing
      backgroundThrottling: false, // Keep app responsive when not focused
      enableBlinkFeatures: 'OverlayScrollbars' // Smoother scrolling
    }
  });

  win.setMenuBarVisibility(false);

  // Open DevTools in development for debugging
  if (!app.isPackaged) {
    win.webContents.openDevTools();
  }

  // In production, load the built files
  if (app.isPackaged) {
    console.log('Loading production build...');
    const indexPath = path.join(__dirname, 'dist', 'client', 'index.html');
    console.log('Index path:', indexPath);
    win.loadFile(indexPath);
  } else {
    // In development, wait for Vite dev server
    console.log('Waiting for http://localhost:8080...');
    await waitForServer('http://localhost:8080');
    console.log('Server ready, opening window...');
    win.loadURL('http://localhost:8080');
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Stop power save blocker when app closes
  if (powerSaveId !== null && powerSaveBlocker.isStarted(powerSaveId)) {
    powerSaveBlocker.stop(powerSaveId);
    console.log('🔋 Power save blocker stopped');
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('quit', () => {
  // Cleanup on quit
  if (powerSaveId !== null && powerSaveBlocker.isStarted(powerSaveId)) {
    powerSaveBlocker.stop(powerSaveId);
  }
});
