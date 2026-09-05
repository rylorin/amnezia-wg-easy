FROM amneziavpn/amneziawg-go:latest

# Install Linux packages
RUN apk update && apk add --no-cache \
    dumb-init \
    nodejs \
    npm

# Set Environment
ENV DEBUG=${DEBUG:-Server,WireGuard}
ENV NODE_ENV=${NODE_ENV:-production}

# Run Web UI
WORKDIR /app
CMD ["/usr/bin/dumb-init", "npx", "-y", "@rylorin/amnezia-wg-easy"]
