#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

import('./services/Server.js');
import { default as WireGuard } from './services/WireGuard.js';

process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection:', reason);
});

WireGuard.getConfig().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);

  // eslint-disable-next-line no-process-exit
  process.exit(1);
});

// Handle terminate signal
process.on('SIGTERM', async () => {
  // eslint-disable-next-line no-console
  console.log('SIGTERM signal received.');
  await WireGuard.Shutdown();
  // eslint-disable-next-line no-process-exit
  process.exit(0);
});

// Handle interrupt signal
process.on('SIGINT', () => {
  // eslint-disable-next-line no-console
  console.log('SIGINT signal received.');
  // eslint-disable-next-line no-process-exit
  process.exit(0);
});
