module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Map",
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
      robottype_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Robottype",
          key: "id",
        },
      },
      pgm: {
        type: DataTypes.BLOB,
        // allowNull: false,
      },
      yaml: {
        type: DataTypes.BLOB,
        // allowNull: false,
      },
      thumbnail: {
        type: DataTypes.BLOB,
        // allowNull: false,
      },
      real: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "Map",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["name", "robottype_id"],
        },
      ],
    },
  );
};
