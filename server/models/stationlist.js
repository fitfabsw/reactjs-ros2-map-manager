module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "StationList",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      map_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Map",
          key: "id",
        },
      },
    },
    {
      tableName: "StationList",
      timestamps: false,
    },
  );
};
