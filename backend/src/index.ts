import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();

app.listen(config.port, () => {
  console.log(`CasaGroup API listening on ${config.publicBaseUrl} (port ${config.port})`);
});
