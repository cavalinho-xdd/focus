const { spawn } = require('child_process');
const http = require('http');

console.log('Spouštím Vite dev server...');
const vite = spawn('npx', ['vite'], { shell: true });

// Přesměrování výstupu z Vite do konzole
vite.stdout.on('data', (data) => {
  process.stdout.write(`[Vite] ${data}`);
});
vite.stderr.on('data', (data) => {
  process.stderr.write(`[Vite Error] ${data}`);
});

// Polling na port 5173
const checkViteReady = setInterval(() => {
  http.get('http://localhost:5173', (res) => {
    clearInterval(checkViteReady);
    console.log('Vite je připraven. Spouštím Electron...');

    const electron = spawn('npx', ['electron', '.'], {
      env: { ...process.env, NODE_ENV: 'development' },
      shell: true,
      stdio: 'inherit'
    });

    electron.on('close', () => {
      console.log('Electron ukončen. Vypínám Vite...');
      vite.kill();
      process.exit();
    });
  }).on('error', () => {
    // Vite ještě neběží, zkusíme to znova
  });
}, 200);

process.on('SIGINT', () => {
  vite.kill();
  process.exit();
});
