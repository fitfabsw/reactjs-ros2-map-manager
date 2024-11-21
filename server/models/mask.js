module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Mask",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      pgm: {
        type: DataTypes.BLOB,
        // allowNull: false,
      },
      yaml: {
        type: DataTypes.BLOB,
        // allowNull: false,
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
      tableName: "Mask",
      timestamps: false,
    },
  );
};
