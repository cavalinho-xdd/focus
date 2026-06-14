const { exec } = require('child_process');

let blockerInterval = null;

const os = require('os');

// Cross-platform process killer
function checkAndKill(blacklist) {
  if (!blacklist || blacklist.length === 0) return;

  const platform = os.platform();

  blacklist.forEach(appName => {
    if (platform === 'win32') {
      // Windows
      // Try to kill by image name
      exec(`taskkill /F /IM "${appName}" /T`, (err) => {
        if (!err) {
          console.log(`[Blocker] Killed ${appName} (Windows)`);
        }
      });
    } else {
      // Linux / macOS
      exec(`pgrep -i -f "${appName}"`, (err, stdout) => {
        if (!err && stdout) {
          const pids = stdout.split('\n').filter(Boolean);
          pids.forEach(pid => {
            exec(`kill -9 ${pid}`, () => {
              console.log(`[Blocker] Killed ${appName} (PID: ${pid})`);
            });
          });
        }
      });
    }
  });
}

function startBlocker(blacklist) {
  if (blockerInterval) return;
  console.log(`[Blocker] Started blocking: ${blacklist.join(', ')}`);
  
  // Check every 2 seconds
  blockerInterval = setInterval(() => {
    checkAndKill(blacklist);
  }, 2000);
}

function stopBlocker() {
  if (blockerInterval) {
    clearInterval(blockerInterval);
    blockerInterval = null;
    console.log('[Blocker] Stopped');
  }
}

module.exports = { startBlocker, stopBlocker };
