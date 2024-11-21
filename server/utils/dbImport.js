const db = require("../models");
const fs = require("fs").promises;
const path = require("path");

async function importData() {
  try {
    // const seedPath = path.join(__dirname, '../../db/seed-data.json');
    const seedPath = path.join(__dirname, "../../db/seed-data-v2.json");
    const seedData = JSON.parse(await fs.readFile(seedPath, "utf8"));

    // 按照依賴關係順序導入數據
    await db.Robottype.bulkCreate(seedData.robottypes, {
      ignoreDuplicates: true,
    });

    await db.Robot.bulkCreate(seedData.robots, {
      ignoreDuplicates: true,
    });

    await db.Map.bulkCreate(seedData.maps, {
      ignoreDuplicates: true,
    });
    await db.Mask.bulkCreate(seedData.masks, {
      ignoreDuplicates: true,
    });

    await db.StationList.bulkCreate(seedData.stationlists, {
      ignoreDuplicates: true,
    });

    await db.Station.bulkCreate(seedData.stations, {
      ignoreDuplicates: true,
    });

    console.log("Data imported successfully");
  } catch (error) {
    console.error("Import failed:", error);
  }
}

module.exports = { importData };
