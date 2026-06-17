/**
 * @file scanner.js
 * @description Extracts a comprehensive list of actively running OS processes.
 * Used to populate the autocomplete and selection menus for the application blacklist.
 */
const { exec } = require('child_process');
const os = require('os');

function getProcesses() {
  return new Promise((resolve, reject) => {
    const platform = os.platform();
    let command = '';

    if (platform === 'win32') {
      command = 'tasklist /fo csv /nh';
    } else {
      command = 'ps -e -o comm=';
    }

    exec(command, (err, stdout) => {
      if (err || !stdout) {
        console.error('Error scanning processes:', err);
        return resolve([]);
      }

      let processes = new Set();
      
      if (platform === 'win32') {
        const cleanStdout = stdout.replace(/\x00/g, '');
        const lines = cleanStdout.split('\n');
        lines.forEach(line => {
          if (!line.trim()) return;
          const parts = line.split('","');
          if (parts.length > 0) {
            let name = parts[0].replace('"', '').trim();
            if (name) {
              processes.add(name);
            }
          }
        });
      } else {
        const lines = stdout.split('\n');
        lines.forEach(line => {
          const name = line.trim();
          if (name && name !== 'ps') {
            processes.add(name);
          }
        });
      }

      const sortedProcesses = Array.from(processes).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      resolve(sortedProcesses);
    });
  });
}

module.exports = { getProcesses };
