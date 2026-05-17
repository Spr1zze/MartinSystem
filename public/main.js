const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;
let backendProcess;

// const startBackend = () => {
//   const backendPath = path.join(__dirname, '../backend/bin/Release/Backend.exe');
  
//   console.log('Starting backend from:', backendPath);
//   backendProcess = spawn(backendPath);
  
//   backendProcess.stdout.on('data', (data) => {
//     console.log(`Backend: ${data}`);
//   });
  
//   backendProcess.stderr.on('data', (data) => {
//     console.error(`Backend error: ${data}`);
//   });
// };
// const startBackend = () => {
//   const backendPath = path.join(__dirname, '../backend/bin/Release/net10.0/Backend.exe');
  
//   console.log('Current __dirname:', __dirname);
//   console.log('Full backend path:', backendPath);
//   console.log('Path exists:', require('fs').existsSync(backendPath));
  
//   if (!require('fs').existsSync(backendPath)) {
//     console.error('Backend executable not found!');
//     return;
//   }
  
//   backendProcess = spawn(backendPath);
//   // ...
// };

const startBackend = () => {
  const backendPath = path.join(__dirname, '../backend/bin/Release/net10.0/Backend.exe');
  
  console.log('Attempting to start backend from:', backendPath);
  console.log('Path exists:', require('fs').existsSync(backendPath));
  
  if (!require('fs').existsSync(backendPath)) {
    console.error('Backend executable NOT found at:', backendPath);
    return;
  }
  
  console.log('Spawning backend process...');
  backendProcess = spawn(backendPath, [], {
    env: {
      ...process.env,
      ASPNETCORE_URLS: 'http://localhost:5000',
    },
  });
  
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

  const startUrl = isDev
    ? 'http://localhost:5173' // Dev server
    : `file://${path.join(__dirname, '../frontend/dist/index.html')}`; // Production build

  mainWindow.loadURL(startUrl);
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
