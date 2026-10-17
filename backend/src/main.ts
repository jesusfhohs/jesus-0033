import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
  console.log(`NODE_ENV=${env.NODE_ENV} | CORS_ORIGIN=${env.CORS_ORIGIN.join(', ')}`);
});