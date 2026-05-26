const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const isDev = !app.isPackaged;

let mainWindow;
let backendProcess;


const startBackend = () => {
  let backendPath;
  
  if (isDev) {
    // In development, go up from main.js to project root, then into backend
    backendPath = path.join(__dirname, '../backend/bin/Debug/net10.0/Backend.exe');
  } else {
    // In production, look in process.resourcesPath (where extraResources are placed)
    backendPath = path.join(process.resourcesPath, 'backend/bin/Release/net10.0/win-x64/publish/Backend.exe');
  }
  
  // This is for testing purposes, running from console.
  console.log('Attempting to start backend from:', backendPath);
  console.log('Path exists:', require('fs').existsSync(backendPath));
  console.log('isDev:', isDev);
  console.log('process.resourcesPath:', process.resourcesPath);
  
  if (!require('fs').existsSync(backendPath)) {
    console.error('Backend executable NOT found at:', backendPath);
    return;
  }
  
  console.log('Spawning backend process...');
  
  const env = {
    ...process.env,
    ASPNETCORE_URLS: 'http://localhost:5000',
  };
  
  // Use test database in development
  if (isDev) {
    env.INVENTORY_DB_PATH = path.join(__dirname, '../backend/bin/Debug/net10.0/inventory.db');
  }
  
  backendProcess = spawn(backendPath, [], { env });
  
  
  backendProcess.on('error', (err) => {
    console.error('Failed to start backend:', err);
  });
  
  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend stdout: ${data}`);
  });
  
  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend stderr: ${data}`);
  });
};


const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  let startUrl;
  
  if (isDev) {
    startUrl = 'http://localhost:5173'; // Dev server
  } else {
    // In production, look in process.resourcesPath for the frontend build
    const frontendPath = path.join(process.resourcesPath, 'frontend/dist/index.html');
    startUrl = `file://${frontendPath.replace(/\\/g, '/')}`;
  }

  console.log('Loading frontend from:', startUrl);
  mainWindow.loadURL(startUrl);

  // Open DevTools on start up
  // mainWindow.webContents.openDevTools();
};

const waitForBackend = () => {
  return new Promise((resolve) => {
    const checkHealth = () => {
      fetch('http://localhost:5000/health')
        .then(() => {
          console.log('Backend is ready!');
          resolve();
        })
        .catch(() => {
          console.log('Waiting for backend...');
          setTimeout(checkHealth, 500);
        });
    };
    checkHealth();
  });
};

app.on('ready', async () => {
  startBackend();
  await waitForBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  app.quit();
});