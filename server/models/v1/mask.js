module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Mask",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      path: {
        type: DataTypes.TEXT,
      },
      name: {
        type: DataTypes.TEXT,
      },
      mid: {
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
