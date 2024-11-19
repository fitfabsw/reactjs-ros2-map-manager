module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Station",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      st_name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      stl_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "StationList",
          key: "id",
        },
      },
      x: {
        type: DataTypes.REAL,
      },
      y: {
        type: DataTypes.REAL,
      },
      z: {
        type: DataTypes.REAL,
      },
      w: {
        type: DataTypes.REAL,
      },
    },
    {
      tableName: "Station",
      timestamps: false,
    },
  );
};
