import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation fails' });

    const { email, password } = req.body;

    const userExist = await User.findOne({ where: { email } });

    if (!userExist)
      return res.status(400).json({ error: 'User does not exist' });

    if (!(await userExist.checkPassword(password)))
      return res.status(400).json({ error: 'User does not match' });

    const { id, name, provider } = userExist;

    return res.json({
      user: { id, name, email, provider },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
