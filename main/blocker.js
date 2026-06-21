/**
 * @file blocker.js
 * @description Native OS process termination module.
 * 
 * Architecture Notes:
 * This module enforces the "Hardcore Mode" constraint by terminating blacklisted applications.
 * To maintain a minimal CPU footprint and prevent battery drain, the process scanning architecture
 * avoids spawning multiple child processes in a loop. Instead, it delegates the entire pattern
 * matching logic to a single OS-native command (`tasklist` on Windows, `pgrep` on POSIX).
 */
const { exec, execFile } = require('child_process');
const os = require('os');

let blockerInterval = null;

function checkAndKill(blacklist) {
  if (!blacklist || blacklist.length === 0) return;

  const platform = os.platform();

  if (platform === 'win32') {
    exec('tasklist /FO CSV /NH', (err, stdout) => {
      if (err || !stdout) return;
      const cleanStdout = stdout.replace(/\x00/g, '');
      const lines = cleanStdout.split('\n');
      const pidsToKill = [];
      
      lines.forEach(line => {
        if (!line.trim()) return;
        const parts = line.split('","');
        if (parts.length > 1) {
          let name = parts[0].replace('"', '').trim().toLowerCase();
          let pid = parts[1].replace('"', '').trim();
          if (!/^\d+$/.test(pid)) return;
          
          for (const blockedApp of blacklist) {
            if (name.includes(blockedApp.toLowerCase())) {
              pidsToKill.push(pid);
              break;
            }
          }
        }
      });

      if (pidsToKill.length > 0) {
        const pidArgs = pidsToKill.map(pid => `/PID ${pid}`).join(' ');
        exec(`taskkill /F ${pidArgs} /T`, (killErr) => {
          if (!killErr) {
            console.log(`[Blocker] Killed ${pidsToKill.length} processes (Windows)`);
          }
        });
      }
    });
  } else {
    const pattern = blacklist.join('|');
    execFile('pgrep', ['-i', '-f', pattern], (err, stdout) => {
      if (!err && stdout) {
        const pids = stdout.split('\n').map(p => p.trim()).filter(p => /^\d+$/.test(p));
        if (pids.length > 0) {
          execFile('kill', ['-9', ...pids], () => {
            console.log(`[Blocker] Killed ${pids.length} processes (Linux/macOS)`);
          });
        }
      }
    });
  }
}

function startBlocker(blacklist) {
  if (blockerInterval) return;
  console.log(`[Blocker] Started blocking: ${blacklist.join(', ')}`);
  
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
