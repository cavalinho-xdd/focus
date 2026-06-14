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
      if (err) {
        console.error('Error scanning processes:', err);
        return resolve([]);
      }

      let processes = new Set();
      
      if (platform === 'win32') {
        // Fix pro Wine/Proton/Windows UTF-16LE výstup (odstranění null bytů)
        const cleanStdout = stdout.replace(/\x00/g, '');
        const lines = cleanStdout.split('\n');
        lines.forEach(line => {
          if (!line.trim()) return;
          // tasklist csv format: "image name","pid","session name","session#","mem usage"
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

      // Return sorted array of unique process names
      const sortedProcesses = Array.from(processes).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      resolve(sortedProcesses);
    });
  });
}

module.exports = { getProcesses };
