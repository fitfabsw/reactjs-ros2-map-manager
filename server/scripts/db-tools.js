const { exportData } = require('../utils/dbExport');
const { importData } = require('../utils/dbImport');

const command = process.argv[2];

async function main() {
  switch (command) {
    case 'export':
      await exportData();
      break;
    case 'import':
      await importData();
      break;
    default:
      console.log('Usage: node db-tools.js [export|import]');
  }
  process.exit();
}

main(); 