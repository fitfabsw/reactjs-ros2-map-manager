module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Robot', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    rt_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Robottype',
        key: 'id'
      }
    },
    sn: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'Robot',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['rt_id', 'sn']
      }
    ]
  });
}; 