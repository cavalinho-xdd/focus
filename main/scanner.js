const { exec } = require('child_process');
const os = require('os');

// Common Linux kernel threads and daemons — never useful to block
const LINUX_NOISE = new Set([
  'systemd', 'kthreadd', 'rcu_gp', 'rcu_par_gp', 'netns', 'kauditd',
  'khungtaskd', 'oom_reaper', 'writeback', 'kcompactd', 'ksmd', 'khugepaged',
  'kdevtmpfs', 'kblockd', 'blkcg_punt_bio', 'kswapd0', 'kswapd1',
  'dbus-daemon', 'dbus-broker', 'NetworkManager', 'wpa_supplicant',
  'polkitd', 'rtkit-daemon', 'upowerd', 'colord', 'avahi-daemon',
  'bluetoothd', 'crond', 'atd', 'sshd', 'cups', 'cupsd',
  'pipewire', 'wireplumber', 'pulseaudio', 'pipewire-pulse',
  'Xorg', 'Xwayland', 'X',
  'at-spi-bus-la', 'at-spi2-registr', 'gvfsd', 'gvfsd-fuse',
  'xdg-permission-', 'xdg-document-po', 'xdg-desktop-por',
  'ibus-daemon', 'ibus-x11', 'ibus-portal',
  'dconf-service', 'gsettings-data-s',
  'tracker-miner-f', 'tracker-extract',
  'packagekitd', 'snapd', 'flatpak-session', 'fwupd',
  'gdm', 'gdm3', 'lightdm', 'sddm',
  'gnome-keyring-d', 'gnome-session-b', 'gnome-settings-', 'gnome-software',
  'evolution-sourc', 'evolution-calen', 'evolution-alarm',
  'mission-control', 'goa-daemon', 'goa-identity-se',
  'ps', 'grep', 'awk', 'sed', 'bash', 'sh', 'zsh', 'fish', 'dash',
  'login', 'sudo',
]);

function isLinuxNoise(name) {
  if (LINUX_NOISE.has(name)) return true;
  if (/^(kworker|ksoftirqd|migration|rcu_|irq\/|cpuhp\/|idle_inject|kthrotl|kdmflush)/.test(name)) return true;
  if (name.length <= 2) return true;
  return false;
}

function getProcesses() {
  return new Promise((resolve) => {
    const platform = os.platform();

    if (platform === 'darwin') {
      // Only visible (foreground) user apps — cuts ~200 daemons down to ~15 real apps
      exec(
        `osascript -e 'tell application "System Events" to get name of every process whose background only is false'`,
        (err, stdout) => {
          if (err || !stdout) return resolve([]);
          const names = stdout.trim().split(', ')
            .map(n => n.trim())
            .filter(n => n && n !== 'Aurora')
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
          resolve([...new Set(names)]);
        }
      );
    } else if (platform === 'win32') {
      // Only processes with a visible window — drops svchost, csrss, etc.
      exec(
        'powershell -NoProfile -NonInteractive -Command "Get-Process | Where-Object { $_.MainWindowTitle -ne \'\' } | Select-Object -ExpandProperty ProcessName -Unique | Sort-Object"',
        { timeout: 8000 },
        (err, stdout) => {
          if (err || !stdout) {
            // Fallback: full tasklist
            exec('tasklist /fo csv /nh', (err2, stdout2) => {
              if (err2 || !stdout2) return resolve([]);
              const names = new Set();
              stdout2.replace(/\x00/g, '').split('\n').forEach(line => {
                if (!line.trim()) return;
                const parts = line.split('","');
                if (parts.length > 0) {
                  const name = parts[0].replace('"', '').trim();
                  if (name && name !== 'Aurora.exe') names.add(name);
                }
              });
              resolve([...names].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())));
            });
            return;
          }
          const names = stdout.trim().split('\n')
            .map(n => n.trim())
            .filter(n => n && n !== 'Aurora')
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
          resolve([...new Set(names)]);
        }
      );
    } else {
      // Linux: ps with noise filter
      exec('ps -e -o comm=', (err, stdout) => {
        if (err || !stdout) return resolve([]);
        const names = new Set();
        stdout.split('\n').forEach(line => {
          const name = line.trim();
          if (name && !isLinuxNoise(name)) names.add(name);
        });
        resolve([...names].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())));
      });
    }
  });
}

module.exports = { getProcesses };
