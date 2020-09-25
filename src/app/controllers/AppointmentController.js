import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';
import pt from 'date-fns/locale/pt';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const isProvider = await User.findOne({
      where: {
        id: req.userId,
        provider: true,
      },
    });

    if (isProvider)
      return res
        .status(401)
        .json({ error: 'You can only list providers with user' });

    const appointments = await Appointment.findAll({
      where: {
        userId: req.userId,
        canceledAt: null,
      },
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20,
      order: ['date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'url', 'path'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      providerId: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation fails' });

    const { providerId, date } = req.body;

    const isProvider = await User.findOne({
      where: { id: providerId, provider: true },
    });

    if (!isProvider)
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });

    /* 
      Check for paste date
    */
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date()))
      return res.status(400).json({ error: 'Paste dates are not permited' });

    const checkAvailability = await Appointment.findOne({
      where: {
        providerId: providerId,
        canceledAt: null,
        date: hourStart,
      },
    });

    if (checkAvailability)
      return res
        .status(400)
        .json({ error: 'Appointment date is not avaliability' });

    const appointment = await Appointment.create({
      date,
      providerId,
      userId: req.userId,
    });

    /* NOTIFY APPOINTMENT PROVIDER*/
    const user = await User.findByPk(req.userId);
    const formatedDate = format(hourStart, "'dia' dd 'de' MMMM', às' H:mm'h'", {
      locale: pt,
    });

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formatedDate}`,
      userId: providerId,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
