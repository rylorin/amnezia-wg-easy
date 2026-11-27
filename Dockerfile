# syntax=docker/dockerfile:1

# 1) amneziawg-go : binaire statique fourni par l'image upstream
FROM amneziavpn/amneziawg-go:latest AS awg

# 2) amneziawg-tools : rebuild sur la même musl que la finale
FROM node:24-alpine AS tools
ARG AWGTOOLS_COMMIT="v3.1.20260812"
RUN apk add --no-cache git build-base linux-headers && \
    git clone https://github.com/amnezia-vpn/amneziawg-tools.git /amneziawg-tools && \
    cd /amneziawg-tools && git checkout ${AWGTOOLS_COMMIT} && \
    cd src && make

# 3) Image finale : Node LTS récent
FROM node:24-alpine
RUN apk add --no-cache iproute2 iptables bash dumb-init
COPY --from=awg /usr/bin/amneziawg-go /usr/bin/amneziawg-go
COPY --from=tools /amneziawg-tools/src/wg /usr/bin/awg
COPY --from=tools /amneziawg-tools/src/wg-quick/linux.bash /usr/bin/awg-quick
RUN chmod +x /usr/bin/awg /usr/bin/awg-quick && \
    ln -sf /usr/bin/awg /usr/bin/wg && \
    ln -sf /usr/bin/awg-quick /usr/bin/wg-quick

ENV DEBUG=Server,WireGuard
ENV NODE_ENV=production
WORKDIR /app
CMD ["/usr/bin/dumb-init", "npx", "-y", "@rylorin/amnezia-wg-easy"]