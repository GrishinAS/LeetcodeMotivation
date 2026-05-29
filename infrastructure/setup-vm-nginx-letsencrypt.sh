#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-leetstreak.pro}"
WWW_DOMAIN="${WWW_DOMAIN:-www.${DOMAIN}}"
APP_PORT="${APP_PORT:-8443}"
APP_PROTOCOL="${APP_PROTOCOL:-https}"
APP_USER="${APP_USER:-${SUDO_USER:-$USER}}"
APP_HOME="$(eval echo "~${APP_USER}")"
APP_CERT_DIR="${APP_CERT_DIR:-${APP_HOME}/.certs/leetcode-app}"
KEYSTORE_PATH="${KEYSTORE_PATH:-${APP_CERT_DIR}/keystore.p12}"
KEYSTORE_ALIAS="${KEYSTORE_ALIAS:-leetcode-app}"
NGINX_SITE="/etc/nginx/sites-available/${DOMAIN}"
NGINX_SITE_ENABLED="/etc/nginx/sites-enabled/${DOMAIN}"
RENEWAL_ENV="/etc/letsencrypt/leetcode-app-keystore.env"
RENEWAL_HOOK="/etc/letsencrypt/renewal-hooks/deploy/leetcode-app-keystore.sh"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this script with sudo:"
  echo "  sudo bash infrastructure/setup-vm-nginx-letsencrypt.sh"
  exit 1
fi

if [[ -z "${KEYSTORE_PASSWORD:-}" ]]; then
  read -r -s -p "PKCS12 keystore password: " KEYSTORE_PASSWORD
  echo
  read -r -s -p "Repeat PKCS12 keystore password: " KEYSTORE_PASSWORD_REPEAT
  echo

  if [[ "${KEYSTORE_PASSWORD}" != "${KEYSTORE_PASSWORD_REPEAT}" ]]; then
    echo "Keystore passwords do not match."
    exit 1
  fi
fi

if [[ -z "${KEYSTORE_PASSWORD}" ]]; then
  echo "Keystore password cannot be empty."
  exit 1
fi

echo "Installing Certbot, Nginx, and OpenSSL..."
apt update
apt install -y certbot nginx openssl

echo "Stopping Nginx while Certbot uses port 80..."
systemctl stop nginx || true

echo "Requesting a valid free Let's Encrypt certificate for ${DOMAIN} and ${WWW_DOMAIN}..."
certbot certonly --standalone \
  --non-interactive \
  --agree-tos \
  --register-unsafely-without-email \
  --keep-until-expiring \
  -d "${DOMAIN}" \
  -d "${WWW_DOMAIN}"

echo "Creating Spring Boot PKCS12 keystore at ${KEYSTORE_PATH}..."
install -d -o "${APP_USER}" -g "${APP_USER}" -m 700 "${APP_CERT_DIR}"

openssl pkcs12 -export \
  -in "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" \
  -inkey "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" \
  -out "${KEYSTORE_PATH}" \
  -name "${KEYSTORE_ALIAS}" \
  -passout "pass:${KEYSTORE_PASSWORD}"

chown "${APP_USER}:${APP_USER}" "${KEYSTORE_PATH}"
chmod 600 "${KEYSTORE_PATH}"

echo "Saving a root-only renewal hook so keystore.p12 is refreshed after cert renewal..."
install -d -m 755 /etc/letsencrypt/renewal-hooks/deploy
KEYSTORE_PASSWORD_B64="$(printf '%s' "${KEYSTORE_PASSWORD}" | base64 | tr -d '\n')"

cat > "${RENEWAL_ENV}" <<EOF
DOMAIN=${DOMAIN}
APP_USER=${APP_USER}
APP_CERT_DIR=${APP_CERT_DIR}
KEYSTORE_PATH=${KEYSTORE_PATH}
KEYSTORE_ALIAS=${KEYSTORE_ALIAS}
KEYSTORE_PASSWORD_B64=${KEYSTORE_PASSWORD_B64}
EOF
chmod 600 "${RENEWAL_ENV}"

cat > "${RENEWAL_HOOK}" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

source /etc/letsencrypt/leetcode-app-keystore.env
KEYSTORE_PASSWORD="$(printf '%s' "${KEYSTORE_PASSWORD_B64}" | base64 -d)"

openssl pkcs12 -export \
  -in "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" \
  -inkey "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" \
  -out "${KEYSTORE_PATH}" \
  -name "${KEYSTORE_ALIAS}" \
  -passout "pass:${KEYSTORE_PASSWORD}"

chown "${APP_USER}:${APP_USER}" "${KEYSTORE_PATH}"
chmod 600 "${KEYSTORE_PATH}"
systemctl reload nginx || true
EOF
chmod 700 "${RENEWAL_HOOK}"

echo "Writing Nginx reverse proxy config for ${DOMAIN} -> ${APP_PROTOCOL}://127.0.0.1:${APP_PORT}..."
cat > "${NGINX_SITE}" <<EOF
server {
    listen 80;
    server_name ${DOMAIN} ${WWW_DOMAIN};

    return 301 https://${DOMAIN}\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} ${WWW_DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    location / {
        proxy_pass ${APP_PROTOCOL}://127.0.0.1:${APP_PORT};

        proxy_ssl_verify off;

        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
EOF

ln -sfn "${NGINX_SITE}" "${NGINX_SITE_ENABLED}"
rm -f /etc/nginx/sites-enabled/default

echo "Testing and starting Nginx..."
nginx -t
systemctl enable nginx
systemctl restart nginx

echo
echo "Done."
echo "Certificate: /etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
echo "Keystore:    ${KEYSTORE_PATH}"
echo "Nginx site:  ${NGINX_SITE}"
echo
echo "Set the Spring Boot keystore password to the password you entered for this script."
echo "Set the frontend API host to: https://${DOMAIN}"
