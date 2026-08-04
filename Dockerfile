FROM amneziavpn/amneziawg-go:latest

# Install Linux packages
RUN apk update && apk add --no-cache \
#    dpkg \
    dumb-init \
#    iptables \
    nodejs \
    npm

# Use iptables-legacy
# RUN update-alternatives --install /sbin/iptables iptables /sbin/iptables-legacy 10 --slave /sbin/iptables-restore iptables-restore /sbin/iptables-legacy-restore --slave /sbin/iptables-save iptables-save /sbin/iptables-legacy-save

# Set Environment
ENV DEBUG=Server,Server:*,WireGuard
ENV NODE_ENV=production

# Run Web UI
WORKDIR /app
CMD ["/usr/bin/dumb-init", "npx", "@rylorin/amnezia-wg-easy"]
