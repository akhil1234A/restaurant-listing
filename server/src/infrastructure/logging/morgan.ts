import morgan from 'morgan';
import { Logger } from './logger';

morgan.token('user', (req: any) => req.user?.id || 'anonymous');

const morganFormat = ':method :url :status :response-time ms - :res[content-length] - user: :user';

export default morgan(morganFormat, {
  stream: {
    write: (message: string) => {
      Logger.info(message.trim());
    },
  },
});