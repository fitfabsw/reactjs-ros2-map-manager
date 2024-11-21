module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Robottype",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "Robottype",
      timestamps: false,
    },
  );
};
