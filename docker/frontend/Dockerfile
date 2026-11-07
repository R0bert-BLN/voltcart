FROM node:22-alpine

# The node user is uid 1000, like the host user, so the bind mount stays editable on the host
RUN apk add --no-cache git \
 && corepack enable \
 && mkdir -p /app && chown node:node /app

ENV PNPM_HOME=/home/node/.pnpm \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    CI=true
ENV PATH=$PNPM_HOME:$PATH

USER node
RUN corepack prepare pnpm@12.18.0 --activate
WORKDIR /app
EXPOSE 5173
CMD ["sh", "-c", "pnpm install --frozen-lockfile && pnpm dev --host 0.0.0.0 --port 5173"]
