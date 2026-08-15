import dotenv from 'dotenv';
dotenv.config();

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

const RELEASE = version;
const PORT = process.env.PORT || '8080';
const WEBUI_HOST = process.env.WEBUI_HOST || '0.0.0.0';
const PASSWORD_HASH = process.env.PASSWORD_HASH;
const MAX_AGE = parseInt(process.env.MAX_AGE, 10) * 1000 * 60 || 0;
const WG_PATH = process.env.WG_PATH || '/etc/amnezia/amneziawg/';
const WG_DEVICE = process.env.WG_DEVICE || 'eth+';
const WG_HOST = process.env.WG_HOST;
const WG_PORT = process.env.WG_PORT || '8443';
const WG_CONFIG_PORT = process.env.WG_CONFIG_PORT || process.env.WG_PORT || '8443';
const WG_MTU = process.env.WG_MTU || null;
const WG_PERSISTENT_KEEPALIVE = process.env.WG_PERSISTENT_KEEPALIVE || '0';
const WG_DEFAULT_ADDRESS = process.env.WG_DEFAULT_ADDRESS || '10.8.0.x';
const WG_DEFAULT_DNS = typeof process.env.WG_DEFAULT_DNS === 'string' ? process.env.WG_DEFAULT_DNS : '1.1.1.1';
const WG_ALLOWED_IPS = process.env.WG_ALLOWED_IPS || '0.0.0.0/0, ::/0';
const WG_INTERFACE = process.env.WG_INTERFACE || 'wg0';

const WG_PRE_UP = process.env.WG_PRE_UP || '';
const WG_POST_UP =
  process.env.WG_POST_UP ||
  `
iptables -t nat -A POSTROUTING -s ${WG_DEFAULT_ADDRESS.replace('x', '0')}/24 -o ${WG_DEVICE} -j MASQUERADE;
iptables -A INPUT -p udp -m udp --dport ${WG_PORT} -j ACCEPT;
iptables -A FORWARD -i ${WG_INTERFACE} -j ACCEPT;
iptables -A FORWARD -o ${WG_INTERFACE} -j ACCEPT;
`
    .split('\n')
    .join(' ');
const WG_PRE_DOWN = process.env.WG_PRE_DOWN || '';
const WG_POST_DOWN =
  process.env.WG_POST_DOWN ||
  `
iptables -t nat -D POSTROUTING -s ${WG_DEFAULT_ADDRESS.replace('x', '0')}/24 -o ${WG_DEVICE} -j MASQUERADE;
iptables -D INPUT -p udp -m udp --dport ${WG_PORT} -j ACCEPT;
iptables -D FORWARD -i ${WG_INTERFACE} -j ACCEPT;
iptables -D FORWARD -o ${WG_INTERFACE} -j ACCEPT;
`
    .split('\n')
    .join(' ');

const UI_TRAFFIC_STATS = process.env.UI_TRAFFIC_STATS || 'false';
const UI_CHART_TYPE = process.env.UI_CHART_TYPE || 0;
const WG_ENABLE_ONE_TIME_LINKS = process.env.WG_ENABLE_ONE_TIME_LINKS || 'false';
const UI_ENABLE_SORT_CLIENTS = process.env.UI_ENABLE_SORT_CLIENTS || 'false';
const WG_ENABLE_EXPIRES_TIME = process.env.WG_ENABLE_EXPIRES_TIME || 'false';
const ENABLE_PROMETHEUS_METRICS = process.env.ENABLE_PROMETHEUS_METRICS || 'false';
const PROMETHEUS_METRICS_PASSWORD = process.env.PROMETHEUS_METRICS_PASSWORD;

const DICEBEAR_TYPE = process.env.DICEBEAR_TYPE || false;
const USE_GRAVATAR = process.env.USE_GRAVATAR || false;

const getRandomInt = (min, max) => min + Math.floor(Math.random() * (max - min));
const getRandomJunkSize = () => getRandomInt(15, 150);
const getRandomHeader = () => getRandomInt(1, 2_147_483_647);
const getRandomInitSize = () => getRandomInt(1, 1500);

const JC = process.env.JC || getRandomInt(3, 10);
const JMIN = process.env.JMIN || 50;
const JMAX = process.env.JMAX || 1000;
const S1 = process.env.S1 || getRandomJunkSize();
const S2 = process.env.S2 || getRandomJunkSize();
const H1 = process.env.H1 || getRandomHeader();
const H2 = process.env.H2 || getRandomHeader();
const H3 = process.env.H3 || getRandomHeader();
const H4 = process.env.H4 || getRandomHeader();
// AWG 2.0 fields
const S3 = process.env.S3 || getRandomJunkSize();
const S4 = process.env.S4 || getRandomJunkSize();
const I1 = process.env.I1 || getRandomInitSize();
const I2 = process.env.I2 || getRandomInitSize();
const I3 = process.env.I3 || getRandomInitSize();
const I4 = process.env.I4 || getRandomInitSize();
const I5 = process.env.I5 || getRandomInitSize();

export {
  RELEASE,
  PORT,
  WEBUI_HOST,
  PASSWORD_HASH,
  MAX_AGE,
  WG_PATH,
  WG_DEVICE,
  WG_HOST,
  WG_PORT,
  WG_CONFIG_PORT,
  WG_MTU,
  WG_PERSISTENT_KEEPALIVE,
  WG_DEFAULT_ADDRESS,
  WG_DEFAULT_DNS,
  WG_ALLOWED_IPS,
  WG_INTERFACE,
  WG_PRE_UP,
  WG_POST_UP,
  WG_PRE_DOWN,
  WG_POST_DOWN,
  UI_TRAFFIC_STATS,
  UI_CHART_TYPE,
  WG_ENABLE_ONE_TIME_LINKS,
  UI_ENABLE_SORT_CLIENTS,
  WG_ENABLE_EXPIRES_TIME,
  ENABLE_PROMETHEUS_METRICS,
  PROMETHEUS_METRICS_PASSWORD,
  DICEBEAR_TYPE,
  USE_GRAVATAR,
  JC,
  JMIN,
  JMAX,
  S1,
  S2,
  H1,
  H2,
  H3,
  H4,
  S3,
  S4,
  I1,
  I2,
  I3,
  I4,
  I5,
};
