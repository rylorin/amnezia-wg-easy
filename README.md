# AmnewziaWG Easy

![Version](https://img.shields.io/github/package-json/v/rylorin/amnezia-wg-easy)
[![Publish](https://github.com/rylorin/amnezia-wg-easy/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/rylorin/amnezia-wg-easy/actions/workflows/npm-publish.yml)
![License](https://img.shields.io/badge/License%20CC%20BY%20NC%20SA%204.0-blue.svg)
![Downloads](https://img.shields.io/npm/dt/@rylorin/amnezia-wg-easy.svg)

You have found the easiest way to install & manage WireGuard on any Linux host!

Built on [amnezia-wg-easy](https://github.com/w0rng/amnezia-wg-easy), this image swaps the base to `amneziavpn/amneziawg-go` and adds full AWG 2.0 obfuscation parameters (I1–I5, S3, S4) alongside the existing AWG 1.x fields (Jc, Jmin, Jmax, S1, S2, H1–H4).

## About this fork

This fork redistributes `amnezia-wg-easy` as a **Node.js module** and modernizes its runtime dependencies.

- **Node.js module distribution** — Published on npm as `@rylorin/amnezia-wg-easy`.
  The application can be installed and run directly on any machine with Node.js >= 20, useful for example on an already existing Amnezia installation.

- **Simplified Dockerfile** — Based on `amneziavpn/amneziawg-go:latest`, using `npx @rylorin/amnezia-wg-easy` to run the application inside the container, always downloading the latest release.

- **Updated dependencies** — Migrated from `h3` v1 to `h3` v2, plus updated packages (bcryptjs, qrcode, crc-32, debug, dotenv).

<p align="center">
  <img src="https://github.com/rylorin/amnezia-wg-easy/blob/17aeebbe9c5486b2b3bb082dfc657478a157a3d2/assets/screenshot.png" width="802" />
</p>

## Features

- All-in-one: AmneziaWG + Web UI.
- Easy installation, simple to use.
- List, create, edit, delete, enable & disable clients.
- Show a client's QR code.
- Download a client's configuration file.
- Statistics for which clients are connected.
- Tx/Rx charts for each connected client.
- Gravatar support or random avatars.
- Automatic Light / Dark Mode
- Multilanguage Support
- Traffic Stats (default off)
- One Time Links (default off)
- Client Expiry (default off)
- Prometheus metrics support

## Standalone admin interface

### 📌 Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher recommended)

### Installation

No installation is required, `npx` will download and install on the fly the latest release of the package.

### 🚀 Usage

To start the admin interface from server the **system command line prompt** (not from the Node.js REPL) :

1. Set your environement variables or use a `.env` file
2. Run the following command: `npx "@rylorin/amnezia-wg-easy"`

## Full integrated Docker image

### 📌 Prerequisites

- A host with Docker installed to start the full integrated docker image

### Installation

To automatically install & run wg-easy, simply run:

```
  docker run -d \
  --name=amnezia-wg-easy \
  -e WG_HOST=<🚨YOUR_SERVER_IP> \
  -e PASSWORD_HASH=<🚨YOUR_ADMIN_PASSWORD_HASH> \
  -e PORT=8080 \
  -e WG_PORT=51820 \
  -v ~/.amnezia-wg-easy:/etc/amnezia/amneziawg \
  -p 8443:8443/udp \
  -p 8080:8080/tcp \
  --cap-add=NET_ADMIN \
  --cap-add=SYS_MODULE \
  --sysctl="net.ipv4.conf.all.src_valid_mark=1" \
  --sysctl="net.ipv4.ip_forward=1" \
  --device=/dev/net/tun:/dev/net/tun \
  --restart unless-stopped \
  @rylorin/amnezia-wg-easy:latest
```

> Replace `YOUR_SERVER_IP` with your public IP or hostname.  
> Replace `YOUR_BCRYPT_HASH` with the hash generated in step 2.  
> **Note:** Dollar signs in `PASSWORD_HASH` must be escaped as `$$` when set inline in `docker-compose.yml`. To avoid this, put the value in a `.env` file instead.
>
> **Port quick-reference:**  
> `PORT` (`8080/tcp`) is the **Web UI** — open it in your browser.  
> `WG_PORT` (`8443/udp`) is the **VPN tunnel** — peers connect here.  
> `WG_CONFIG_PORT` only needs to be set if a firewall/NAT translates the external UDP port before it reaches the container (e.g. external `51825` → internal `8443` → set `WG_CONFIG_PORT=51825`).

### Start

```bash
docker compose up -d
```

The Web UI will be available at `http://YOUR_SERVER_IP:8080`.

### Updating

```bash
docker compose pull
docker compose up -d
```

### Running multiple instances

Each instance needs a unique `WG_INTERFACE`, `WG_PORT`, `WG_CONFIG_PORT`, and `PORT`. Everything else — config files, iptables rules, and the Web UI session cookie — is derived automatically from `WG_INTERFACE`.

```yaml
services:
  awg2-easy-a:
    image: @rylorin/amnezia-wg-easy:latest
    environment:
      - WG_HOST=YOUR_SERVER_IP
      - WG_INTERFACE=awg0
      - WG_PORT=51820
      - WG_CONFIG_PORT=51820
      - PORT=51821
      - PASSWORD_HASH=YOUR_BCRYPT_HASH
    volumes:
      - data:/etc/amnezia/amneziawg
    ports:
      - '51820:51820/udp'
      - '51821:51821/tcp'
    # ... cap_add, sysctls, devices

  awg2-easy-b:
    image: @rylorin/amnezia-wg-easy
    environment:
      - WG_HOST=YOUR_SERVER_IP
      - WG_INTERFACE=awg1
      - WG_PORT=51830
      - WG_CONFIG_PORT=51830
      - PORT=51831
      - WG_DEFAULT_ADDRESS=10.9.0.x
      - PASSWORD_HASH=YOUR_BCRYPT_HASH
    volumes:
      - data:/etc/amnezia/amneziawg
    ports:
      - '51830:51830/udp'
      - '51831:51831/tcp'
    # ... cap_add, sysctls, devices
```

> Each instance must also use a different `WG_DEFAULT_ADDRESS` subnet (e.g. `10.8.0.x` and `10.9.0.x`) to avoid routing conflicts.

## Options

| Env                           | Default                   | Description                                                                                                                                                                                                                                                                                                            |
| ----------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WG_HOST`                     | —                         | Public IP or hostname of your VPN server. **Required.**                                                                                                                                                                                                                                                                |
| `WG_INTERFACE`                | `wg0`                     | Kernel network interface name. Change this when running multiple instances on the same host to avoid conflicts (e.g. `awg1`). Also determines the session cookie name.                                                                                                                                                 |
| `PORT`                        | `8080`                    | TCP port for the Web UI.                                                                                                                                                                                                                                                                                               |
| `WG_PATH`                     | `/etc/amnezia/amneziawg/` | Directory path where config files are stored                                                                                                                                                                                                                                                                           |
| `WEBUI_HOST`                  | `0.0.0.0`                 | IP address the Web UI binds to.                                                                                                                                                                                                                                                                                        |
| `PASSWORD_HASH`               | —                         | Bcrypt hash for Web UI login. If unset, no password is required.                                                                                                                                                                                                                                                       |
| `WG_DEVICE`                   | `eth0`                    | Network interface traffic is masqueraded through.                                                                                                                                                                                                                                                                      |
| `WG_PORT`                     | `8443`                    | **VPN UDP port** — AmneziaWG listens on this port inside the container. Must match the right-hand side of your `ports` mapping (e.g. `"51820:51820/udp"`).                                                                                                                                                             |
| `WG_CONFIG_PORT`              | `WG_PORT`                 | **Client endpoint port** — written into downloaded client `.conf` files as the `Endpoint` port. Only set this when a firewall or NAT translates the external port before it reaches the container. Example: external port `51825` mapped to internal `51820` → set `WG_CONFIG_PORT=51825`. If unset, equals `WG_PORT`. |
| `WG_MTU`                      | —                         | MTU for clients.                                                                                                                                                                                                                                                                                                       |
| `WG_PERSISTENT_KEEPALIVE`     | `0`                       | Keepalive interval in seconds (`0` = disabled).                                                                                                                                                                                                                                                                        |
| `WG_DEFAULT_ADDRESS`          | `10.8.0.x`                | Client IP range.                                                                                                                                                                                                                                                                                                       |
| `WG_DEFAULT_DNS`              | `1.1.1.1`                 | DNS server pushed to clients.                                                                                                                                                                                                                                                                                          |
| `WG_ALLOWED_IPS`              | `0.0.0.0/0, ::/0`         | Allowed IPs pushed to clients.                                                                                                                                                                                                                                                                                         |
| `WG_PRE_UP`                   | —                         | Command run before the interface comes up.                                                                                                                                                                                                                                                                             |
| `WG_POST_UP`                  | —                         | Command run after the interface comes up.                                                                                                                                                                                                                                                                              |
| `WG_PRE_DOWN`                 | —                         | Command run before the interface goes down.                                                                                                                                                                                                                                                                            |
| `WG_POST_DOWN`                | —                         | Command run after the interface goes down.                                                                                                                                                                                                                                                                             |
| `UI_TRAFFIC_STATS`            | `false`                   | Show per-client Tx/Rx stats.                                                                                                                                                                                                                                                                                           |
| `UI_CHART_TYPE`               | `0`                       | `0` = off, `1` = line, `2` = area, `3` = bar.                                                                                                                                                                                                                                                                          |
| `WG_ENABLE_ONE_TIME_LINKS`    | `false`                   | Enable one-time download links (expire after 5 min).                                                                                                                                                                                                                                                                   |
| `WG_ENABLE_EXPIRES_TIME`      | `false`                   | Enable client expiry dates.                                                                                                                                                                                                                                                                                            |
| `MAX_AGE`                     | `0`                       | Web UI session lifetime in minutes (`0` = until browser closes).                                                                                                                                                                                                                                                       |
| `UI_ENABLE_SORT_CLIENTS`      | `false`                   | Sort clients by name in the UI.                                                                                                                                                                                                                                                                                        |
| `ENABLE_PROMETHEUS_METRICS`   | `false`                   | Expose `/metrics` and `/metrics/json`.                                                                                                                                                                                                                                                                                 |
| `PROMETHEUS_METRICS_PASSWORD` | —                         | Bcrypt hash for Prometheus Basic Auth.                                                                                                                                                                                                                                                                                 |
| `DICEBEAR_TYPE`               | `false`                   | Avatar style (see [dicebear.com](https://www.dicebear.com/styles/)).                                                                                                                                                                                                                                                   |
| `USE_GRAVATAR`                | `false`                   | Use Gravatar avatars.                                                                                                                                                                                                                                                                                                  |

### AWG 1.x obfuscation parameters

| Env       | Default       | Description                                 |
| --------- | ------------- | ------------------------------------------- |
| `JC`      | random (3–10) | Junk packet count.                          |
| `JMIN`    | `50`          | Junk packet minimum size (bytes).           |
| `JMAX`    | `1000`        | Junk packet maximum size (bytes).           |
| `S1`      | random        | Init packet junk size (bytes).              |
| `S2`      | random        | Response packet junk size (bytes).          |
| `H1`–`H4` | random        | Magic header values (must be < uint32 max). |

### AWG 2.0 obfuscation parameters

| Env       | Default | Description                                   |
| --------- | ------- | --------------------------------------------- |
| `S3`      | random  | Additional init packet junk size (bytes).     |
| `S4`      | random  | Additional response packet junk size (bytes). |
| `I1`–`I5` | random  | Initialization packet sizes (bytes, 1–1500).  |

## Thanks

Based on [amnezia-wg-easy](https://github.com/w0rng/amnezia-wg-easy) by w0rng.  
Originally derived from [wg-easy](https://github.com/wg-easy/wg-easy) by Emile Nijssen.  
AmneziaWG integration from [amnezia-wg-easy](https://github.com/spcfox/amnezia-wg-easy) by Viktor Yudov.
Contributions from https://github.com/FromMun/awg2-easy
