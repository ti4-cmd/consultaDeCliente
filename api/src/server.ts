import { createApp } from './app.js';
import { loadConfig } from './config/env.js';

const config = loadConfig();
const app = createApp(config);

app.listen(config.PORT, config.HOST, () => {
  console.log(`API running at http://${config.HOST}:${config.PORT}`);
});
