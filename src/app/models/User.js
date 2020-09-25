import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.VIRTUAL,
        passwordHash: DataTypes.STRING,
        provider: DataTypes.BOOLEAN,
      },
      {
        sequelize,
      }
    );

    this.addHook('beforeSave', async (user) => {
      if (user.password) {
        user.passwordHash = await bcrypt.hash(user.password, 8);
      }
    });
    return this;
  }
  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'avatarId', as: 'avatar' });
  }
  checkPassword(password) {
    return bcrypt.compare(password, this.passwordHash);
  }
}

export default User;
