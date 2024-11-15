module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Map', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    map: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    rt_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Robottype',
        key: 'id'
      }
    },
    mappath: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    mapname: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    real: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'Map',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['map', 'rt_id']
      }
    ]
  });
}; 