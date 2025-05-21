import { App } from './app';
import { Logger } from './infrastructure/logging/logger';

const PORT = process.env.PORT || 3000;
const app = new App();

app
  .start(PORT)
  .then(() => {
    Logger.info(`Server running on port ${PORT}`);
  })
  .catch((error) => {
    Logger.error('Failed to start server', error);
    process.exit(1);
  });