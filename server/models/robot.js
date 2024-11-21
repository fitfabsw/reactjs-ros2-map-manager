module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Robot",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      robottype_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Robottype",
          key: "id",
        },
      },
      sn: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "Robot",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["robottype_id", "sn"],
        },
      ],
    },
  );
};
