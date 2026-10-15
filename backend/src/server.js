'use strict';
const config = require('./config');
const app = require('./app');

// If the port is busy (the app is already running in another terminal), try the next ports.
function start(port, triesLeft) {
  const server = app.listen(port, () => {
    if (port !== config.PORT) console.log(`\nPort ${config.PORT} was busy (the app is probably already open in another terminal), so this one uses ${port}.`);
    console.log(`ODOP Catalogue Maker running at http://localhost:${port}`);
    console.log(`  frontend: ${config.FRONTEND_DIR}`);
    console.log(`  data:     ${config.DATA_DIR}`);
  });
  server.on('error', err => {
    if (err.code === 'EADDRINUSE' && triesLeft > 0) return start(port + 1, triesLeft - 1);
    console.error(err.code === 'EADDRINUSE' ? `\nPorts ${config.PORT}-${port} are all busy. Close the other terminals running this app.\n` : err);
    process.exit(1);
  });
}
start(config.PORT, 10);
