const db = require('../models');
const fs = require('fs').promises;
const path = require('path');

async function exportData() {
  try {
    const data = {
      robottypes: await db.Robottype.findAll({ raw: true }),
      robots: await db.Robot.findAll({ raw: true }),
      maps: await db.Map.findAll({ raw: true }),
      stationLists: await db.StationList.findAll({ raw: true }),
      stations: await db.Station.findAll({ raw: true })
    };

    const exportPath = path.join(__dirname, '../../db/seed-data.json');
    await fs.writeFile(exportPath, JSON.stringify(data, null, 2));
    console.log('Data exported successfully to:', exportPath);
  } catch (error) {
    console.error('Export failed:', error);
  }
}

module.exports = { exportData }; 