/**
 * @file storage.js
 * @description Local disk I/O interface for Electron.
 * Safely persists application settings and minimal state to the host file system.
 */
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const userDataPath = path.join(app.getPath('userData'), 'userdata.json');

const defaultData = {
  stats: {
    xp: 0,
    level: 1,
    goalsCompleted: 0
  },
  settings: {
    apiKey: '',
    blacklist: ['discord', 'steam', 'spotify']
  }
};

function loadData() {
  try {
    if (fs.existsSync(userDataPath)) {
      const rawData = fs.readFileSync(userDataPath, 'utf-8');
      return JSON.parse(rawData);
    }
  } catch (err) {
    console.error('[Storage] Error loading data', err);
  }
  return defaultData;
}

function saveData(data) {
  try {
    fs.writeFileSync(userDataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('[Storage] Error saving data', err);
    return false;
  }
}

module.exports = { loadData, saveData };
