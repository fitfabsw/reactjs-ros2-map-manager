module.exports = (sequelize, DataTypes) => {
  return sequelize.define('StationList', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    stl_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    mid: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Map',
        key: 'id'
      }
    }
  }, {
    tableName: 'StationList',
    timestamps: false
  });
}; 