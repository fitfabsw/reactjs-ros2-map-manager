const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../../db/fitamr.sqlite"),
  logging: false,
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 導入模型
db.Robottype = require("./robottype")(sequelize, Sequelize);
db.Robot = require("./robot")(sequelize, Sequelize);
db.Map = require("./map")(sequelize, Sequelize);
db.StationList = require("./stationList")(sequelize, Sequelize);
db.Station = require("./station")(sequelize, Sequelize);
db.Mask = require("./mask")(sequelize, Sequelize);

// 設置關聯關係
db.Robottype.hasMany(db.Robot, { foreignKey: "rt_id" });
db.Robot.belongsTo(db.Robottype, { foreignKey: "rt_id" });

db.Robottype.hasMany(db.Map, { foreignKey: "rt_id" });
db.Map.belongsTo(db.Robottype, { foreignKey: "rt_id" });

db.Map.hasMany(db.StationList, { foreignKey: "mid" });
db.StationList.belongsTo(db.Map, { foreignKey: "mid" });

db.StationList.hasMany(db.Station, { foreignKey: "stl_id" });
db.Station.belongsTo(db.StationList, { foreignKey: "stl_id" });

db.Map.hasMany(db.Mask, { foreignKey: "mid" });
db.Mask.belongsTo(db.Map, { foreignKey: "mid" });

module.exports = db;
