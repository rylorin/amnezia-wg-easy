// @ts-nocheck
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { createServer } from 'node:http';
import { stat, readFile } from 'node:fs/promises';
import path from 'node:path';

import debug from 'debug';

import {
  H3,
  HTTPError,
  defineHandler as defineEventHandler,
  getRouterParam,
  toNodeHandler,
  readBody,
  setHeader,
  serveStatic,
  useSession,
} from 'h3';

import WireGuard from '../services/WireGuard.js';
import {
  PORT,
  WEBUI_HOST,
  RELEASE,
  PASSWORD_HASH,
  MAX_AGE,
  UI_TRAFFIC_STATS,
  UI_CHART_TYPE,
  WG_ENABLE_ONE_TIME_LINKS,
  UI_ENABLE_SORT_CLIENTS,
  WG_ENABLE_EXPIRES_TIME,
  ENABLE_PROMETHEUS_METRICS,
  PROMETHEUS_METRICS_PASSWORD,
  DICEBEAR_TYPE,
  USE_GRAVATAR,
  WG_HOST,
  WG_PATH,
  WG_PORT,
  WG_INTERFACE,
} from '../config.js';

const requiresPassword = !!PASSWORD_HASH;
const requiresPrometheusPassword = !!PROMETHEUS_METRICS_PASSWORD;
const log = debug('Server');
const httpLog = log.extend('HTTP');
const createError = (options) => new HTTPError(options);
const sessionOptions = {
  name: `${WG_INTERFACE}.sid`,
  password: crypto.randomBytes(32).toString('base64'),
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  },
};

const getSession = (event, remember = false) =>
  useSession(event, remember && MAX_AGE > 0 ? { ...sessionOptions, maxAge: MAX_AGE / 1000 } : sessionOptions);

/**
 * Checks if `password` matches the PASSWORD_HASH.
 *
 * If environment variable is not set, the password is always invalid.
 *
 * @param {string} password String to test
 * @returns {boolean} true if matching environment, otherwise false
 */
const isPasswordValid = (password, hash) => {
  if (typeof password !== 'string') {
    return false;
  }
  if (hash) {
    return bcrypt.compareSync(password, hash);
  }

  return false;
};

const cronJobEveryMinute = async () => {
  await WireGuard.cronJobEveryMinute();
  setTimeout(cronJobEveryMinute, 60 * 1000);
};

export class Server {
  constructor() {
    log(`Server v${RELEASE} starting`);
    const app = new H3({
      onRequest: (event) => {
        const nodeRequest = event.runtime?.node?.req;
        httpLog(
          `→ ${event.req.method} ${event.url.pathname} [${nodeRequest?.socket?.remoteAddress || 'unknown'}] host=${event.req.headers.get('host') || '-'}`,
        );
      },
      onResponse: (response, event) => {
        httpLog(
          `← ${event.req.method} ${event.url.pathname} ${response.status} ${response.headers.get('content-length') || '-'} bytes`,
        );
      },
      onError: (error, event) => {
        if (error.statusCode && error.statusCode < 500) return;
        log(`Error ${event.req.method} ${event.url.pathname}: ${error.message}`);
      },
    });
    this.app = app;

    const router = new H3();
    app.use(router.handler);

    router
      .get(
        '/api/release',
        defineEventHandler(() => ({
          version: RELEASE,
          uptime: process.uptime(),
          timestamp: Date.now(),
        })),
      )

      .get(
        '/api/health',
        defineEventHandler(() => ({
          status: 'ok',
          uptime: process.uptime(),
          timestamp: Date.now(),
        })),
      )

      .get(
        '/api/lang',
        defineEventHandler((event) => {
          setHeader(event, 'Content-Type', 'application/json');
          return 'en';
        }),
      )

      .get(
        '/api/remember-me',
        defineEventHandler((event) => {
          setHeader(event, 'Content-Type', 'application/json');
          return MAX_AGE > 0;
        }),
      )

      .get(
        '/api/ui-traffic-stats',
        defineEventHandler((event) => {
          setHeader(event, 'Content-Type', 'application/json');
          return `${UI_TRAFFIC_STATS}`;
        }),
      )

      .get(
        '/api/ui-chart-type',
        defineEventHandler((event) => {
          setHeader(event, 'Content-Type', 'application/json');
          return `"${UI_CHART_TYPE}"`;
        }),
      )

      .get(
        '/api/wg-enable-one-time-links',
        defineEventHandler((event) => {
          setHeader(event, 'Content-Type', 'application/json');
          return `${WG_ENABLE_ONE_TIME_LINKS}`;
        }),
      )

      .get(
        '/api/ui-sort-clients',
        defineEventHandler((event) => {
          setHeader(event, 'Content-Type', 'application/json');
          return `${UI_ENABLE_SORT_CLIENTS}`;
        }),
      )

      .get(
        '/api/wg-enable-expire-time',
        defineEventHandler((event) => {
          setHeader(event, 'Content-Type', 'application/json');
          return `${WG_ENABLE_EXPIRES_TIME}`;
        }),
      )

      .get(
        '/api/ui-avatar-settings',
        defineEventHandler((event) => {
          setHeader(event, 'Content-Type', 'application/json');
          return {
            dicebear: DICEBEAR_TYPE,
            gravatar: USE_GRAVATAR,
          };
        }),
      )

      // Authentication
      .get(
        '/api/session',
        defineEventHandler(async (event) => {
          const session = await getSession(event);
          const authenticated = requiresPassword ? !!session.data.authenticated : true;

          return {
            requiresPassword,
            authenticated,
          };
        }),
      )
      .get(
        '/cnf/:clientOneTimeLink',
        defineEventHandler(async (event) => {
          if (WG_ENABLE_ONE_TIME_LINKS === 'false') {
            throw createError({
              status: 404,
              message: 'Invalid state',
            });
          }
          const clientOneTimeLink = getRouterParam(event, 'clientOneTimeLink');
          const clients = await WireGuard.getClients();
          const client = clients.find((client) => client.oneTimeLink === clientOneTimeLink);
          if (!client) return;
          const clientId = client.id;
          const config = await WireGuard.getClientConfiguration({ clientId });
          await WireGuard.eraseOneTimeLink({ clientId });
          setHeader(event, 'Content-Disposition', `attachment; filename="${clientOneTimeLink}.conf"`);
          setHeader(event, 'Content-Type', 'text/plain');
          return config;
        }),
      )
      .post(
        '/api/session',
        defineEventHandler(async (event) => {
          const { password, remember } = await readBody(event);

          if (!requiresPassword) {
            // if no password is required, the API should never be called.
            // Do not automatically authenticate the user.
            throw createError({
              status: 401,
              message: 'Invalid state',
            });
          }

          if (!isPasswordValid(password, PASSWORD_HASH)) {
            throw createError({
              status: 401,
              message: 'Incorrect Password',
            });
          }

          const session = await getSession(event, remember);
          await session.update({ authenticated: true });

          log('New Session');

          return { success: true };
        }),
      );

    // WireGuard
    app.use(async (event) => {
      if (!requiresPassword || !event.url.pathname.startsWith('/api/')) return;

      const session = await getSession(event);
      if (session.data.authenticated) return;

      const authorization = event.req.headers.get('authorization');
      if (authorization) {
        let password = authorization;
        if (authorization.startsWith('Basic ')) {
          const decoded = Buffer.from(authorization.slice(6), 'base64').toString();
          password = decoded.slice(decoded.indexOf(':') + 1);
        }
        if (isPasswordValid(password, PASSWORD_HASH)) return;
        throw createError({ status: 401, message: 'Incorrect Password' });
      }

      throw createError({ status: 401, message: 'Not Logged In' });
    });

    const router2 = new H3();
    app.use(router2.handler);

    router2
      .delete(
        '/api/session',
        defineEventHandler(async (event) => {
          const session = await getSession(event);
          await session.clear();

          log('Deleted Session');
          return { success: true };
        }),
      )
      .get(
        '/api/wireguard/client',
        defineEventHandler(() => {
          return WireGuard.getClients();
        }),
      )
      .get(
        '/api/wireguard/client/:clientId/qrcode.svg',
        defineEventHandler(async (event) => {
          const clientId = getRouterParam(event, 'clientId');
          const svg = await WireGuard.getClientQRCodeSVG({ clientId });
          setHeader(event, 'Content-Type', 'image/svg+xml');
          return svg;
        }),
      )
      .get(
        '/api/wireguard/client/:clientId/configuration',
        defineEventHandler(async (event) => {
          const clientId = getRouterParam(event, 'clientId');
          const client = await WireGuard.getClient({ clientId });
          const config = await WireGuard.getClientConfiguration({ clientId });
          const configName = client.name
            .replace(/[^a-zA-Z0-9_=+.-]/g, '-')
            .replace(/(-{2,}|-$)/g, '-')
            .replace(/-$/, '')
            .substring(0, 32);
          setHeader(event, 'Content-Disposition', `attachment; filename="${configName || clientId}.conf"`);
          setHeader(event, 'Content-Type', 'text/plain');
          return config;
        }),
      )
      .post(
        '/api/wireguard/client',
        defineEventHandler(async (event) => {
          const { name, expiredDate } = await readBody(event);
          await WireGuard.createClient({ name, expiredDate });
          return { success: true };
        }),
      )
      .delete(
        '/api/wireguard/client/:clientId',
        defineEventHandler(async (event) => {
          const clientId = getRouterParam(event, 'clientId');
          await WireGuard.deleteClient({ clientId });
          return { success: true };
        }),
      )
      .post(
        '/api/wireguard/client/:clientId/enable',
        defineEventHandler(async (event) => {
          const clientId = getRouterParam(event, 'clientId');
          if (clientId === '__proto__' || clientId === 'constructor' || clientId === 'prototype') {
            throw createError({ status: 403 });
          }
          await WireGuard.enableClient({ clientId });
          return { success: true };
        }),
      )
      .post(
        '/api/wireguard/client/:clientId/generateOneTimeLink',
        defineEventHandler(async (event) => {
          if (WG_ENABLE_ONE_TIME_LINKS === 'false') {
            throw createError({
              status: 404,
              message: 'Invalid state',
            });
          }
          const clientId = getRouterParam(event, 'clientId');
          if (clientId === '__proto__' || clientId === 'constructor' || clientId === 'prototype') {
            throw createError({ status: 403 });
          }
          await WireGuard.generateOneTimeLink({ clientId });
          return { success: true };
        }),
      )
      .post(
        '/api/wireguard/client/:clientId/disable',
        defineEventHandler(async (event) => {
          const clientId = getRouterParam(event, 'clientId');
          if (clientId === '__proto__' || clientId === 'constructor' || clientId === 'prototype') {
            throw createError({ status: 403 });
          }
          await WireGuard.disableClient({ clientId });
          return { success: true };
        }),
      )
      .put(
        '/api/wireguard/client/:clientId/name',
        defineEventHandler(async (event) => {
          const clientId = getRouterParam(event, 'clientId');
          if (clientId === '__proto__' || clientId === 'constructor' || clientId === 'prototype') {
            throw createError({ status: 403 });
          }
          const { name } = await readBody(event);
          await WireGuard.updateClientName({ clientId, name });
          return { success: true };
        }),
      )
      .put(
        '/api/wireguard/client/:clientId/address',
        defineEventHandler(async (event) => {
          const clientId = getRouterParam(event, 'clientId');
          if (clientId === '__proto__' || clientId === 'constructor' || clientId === 'prototype') {
            throw createError({ status: 403 });
          }
          const { address } = await readBody(event);
          await WireGuard.updateClientAddress({ clientId, address });
          return { success: true };
        }),
      )
      .put(
        '/api/wireguard/client/:clientId/expireDate',
        defineEventHandler(async (event) => {
          const clientId = getRouterParam(event, 'clientId');
          if (clientId === '__proto__' || clientId === 'constructor' || clientId === 'prototype') {
            throw createError({ status: 403 });
          }
          const { expireDate } = await readBody(event);
          await WireGuard.updateClientExpireDate({ clientId, expireDate });
          return { success: true };
        }),
      );

    // Check Prometheus credentials
    app.use(async (event) => {
      if (!requiresPrometheusPassword || !event.url.pathname.startsWith('/metrics')) return;

      const authorization = event.req.headers.get('authorization');
      if (!authorization?.startsWith('Basic ')) {
        throw createError({ status: 401, message: 'Not Logged In' });
      }

      const decoded = Buffer.from(authorization.slice(6), 'base64').toString();
      const password = decoded.slice(decoded.indexOf(':') + 1);
      if (!isPasswordValid(password, PROMETHEUS_METRICS_PASSWORD)) {
        throw createError({ status: 401, message: 'Incorrect Password' });
      }
    });

    // Prometheus Metrics API
    const routerPrometheusMetrics = new H3();
    app.use(routerPrometheusMetrics.handler);

    // Prometheus Routes
    routerPrometheusMetrics
      .get(
        '/metrics',
        defineEventHandler(async (event) => {
          setHeader(event, 'Content-Type', 'text/plain');
          if (ENABLE_PROMETHEUS_METRICS === 'true') {
            return WireGuard.getMetrics();
          }
          return '';
        }),
      )
      .get(
        '/metrics/json',
        defineEventHandler(async (event) => {
          setHeader(event, 'Content-Type', 'application/json');
          if (ENABLE_PROMETHEUS_METRICS === 'true') {
            return WireGuard.getMetricsJSON();
          }
          return '';
        }),
      );

    // backup_restore
    const router3 = new H3();
    app.use(router3.handler);

    router3
      .get(
        '/api/wireguard/backup',
        defineEventHandler(async (event) => {
          const config = await WireGuard.backupConfiguration();
          setHeader(event, 'Content-Disposition', 'attachment; filename="wg0.json"');
          setHeader(event, 'Content-Type', 'text/json');
          return config;
        }),
      )
      .put(
        '/api/wireguard/restore',
        defineEventHandler(async (event) => {
          const { file } = await readBody(event);
          await WireGuard.restoreConfiguration(file);
          return { success: true };
        }),
      );

    // Static assets
    const publicDir = path.resolve(new URL('..', import.meta.url).pathname, 'www');
    log(`Static files directory: ${publicDir}`);

    const safePathJoin = (target) => {
      const filePath = path.resolve(publicDir, `.${path.sep}${target}`);
      if (filePath !== publicDir && !filePath.startsWith(`${publicDir}${path.sep}`)) {
        throw createError({ status: 403, message: 'Forbidden' });
      }
      return filePath;
    };

    app.use(
      defineEventHandler((event) =>
        serveStatic(event, {
          indexNames: ['/index.html'],
          getContents: (id) => readFile(safePathJoin(id)).catch(() => undefined),
          getMeta: async (id) => {
            const stats = await stat(safePathJoin(id)).catch(() => undefined);
            if (!stats?.isFile()) return undefined;
            return {
              size: stats.size,
              mtime: stats.mtimeMs,
            };
          },
        }),
      ),
    );

    const h3Listener = toNodeHandler(app);
    const server = createServer();
    server.on('request', (req, res) => {
      log(`RAW ${req.method} ${req.url} from ${req.socket?.remoteAddress} host=${req.headers?.host || '-'}`);
      h3Listener(req, res);
    });
    server.on('connection', (socket) => {
      log(`RAW connection from ${socket.remoteAddress}:${socket.remotePort}`);
      socket.setNoDelay(true);
    });
    server.on('clientError', (err) => {
      log(`RAW clientError: ${err.message} code=${err.code}`);
      if (err.rawPacket) {
        // log(`RAW rawPacket: ${err.rawPacket.toString()}`);
        log(`RAW rawPacket (hex): ${err.rawPacket.toString('hex')}`);
        // log(`RAW rawPacket (utf8): ${err.rawPacket.toString('utf8')}`);
      }
    });
    server.listen(PORT, WEBUI_HOST, () => {
      log(`Listening on http://${WEBUI_HOST}:${PORT}`);
      if (WG_HOST) {
        log(`WireGuard endpoint: ${WG_HOST}:${WG_PORT}`);
      }
      log(`Config path: ${WG_PATH}`);
      log(`Auth: ${requiresPassword ? 'enabled' : 'disabled'}`);
      log(`Prometheus: ${ENABLE_PROMETHEUS_METRICS === 'true' ? 'enabled' : 'disabled'}`);
    });

    cronJobEveryMinute();
  }
}
