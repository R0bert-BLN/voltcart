FROM dunglas/frankenphp:1-php8.4

ARG UID=1000
ARG GID=1000

RUN apt-get update \
 && apt-get install -y --no-install-recommends git unzip curl \
 && rm -rf /var/lib/apt/lists/* \
 && install-php-extensions pdo_pgsql pgsql intl zip bcmath pcntl opcache \
 && cp "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Run as the host user, so files written in the bind mount stay editable on the host
RUN groupadd -g "$GID" app 2>/dev/null || true \
 && useradd -m -u "$UID" -g "$GID" -s /bin/bash app \
 && setcap -r /usr/local/bin/frankenphp \
 && chown -R "$UID:$GID" /config/caddy /data/caddy

ENV SERVER_NAME=:8000 \
    COMPOSER_HOME=/home/app/.composer

USER app
WORKDIR /app
EXPOSE 8000
