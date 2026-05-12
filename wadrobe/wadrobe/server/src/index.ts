import 'dotenv/config';

import app from './app.js';
import { config } from './config/config.js';
import prisma from './prisma/client.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`[Server]: Digital Wardrobe Backend is running on http://localhost:${PORT}`);
  console.log(`[Environment]: ${config.env}`);
});

export { app, prisma };
