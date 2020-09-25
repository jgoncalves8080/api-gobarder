import { startOfDay, endOfDay, parseISO, parse } from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';
import User from '../models/User';

class ScheduleController {
  async index(req, res) {
    const { date } = req.query;

    const isProvider = await User.findOne({
      where: {
        id: req.userId,
        provider: true,
      },
    });

    if (!isProvider)
      return res.status(401).json({ error: 'User is not a provider' });

    const parseData = parseISO(date);

    const appointments = await Appointment.findAll({
      where: {
        providerId: req.userId,
        canceledAt: null,
        date: {
          [Op.between]: [startOfDay(parse), endOfDay(parseData)],
        },
      },
      order: ['date'],
    });

    return res.json({ appointments });
  }
}

export default new ScheduleController();
