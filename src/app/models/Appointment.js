const { Model, DataTypes } = require('sequelize');

class Appointment extends Model {
  static init(sequelize) {
    super.init(
      {
        date: DataTypes.DATE,
        canceledAt: DataTypes.DATE,
      },
      {
        sequelize,
      }
    );
    return this;
  }
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'providerId', as: 'provider' });
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

export default Appointment;
