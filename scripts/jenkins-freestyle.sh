#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="navneetguptacse/career-hub"
IMAGE_TAG="${BUILD_NUMBER:-latest}"

docker build \
  --tag "${IMAGE_NAME}:${IMAGE_TAG}" \
  --tag "${IMAGE_NAME}:latest" \
  .

if [ -n "${DOCKER_USER:-}" ] && [ -n "${DOCKER_PASS:-}" ]; then
  echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
  docker push "${IMAGE_NAME}:${IMAGE_TAG}"
  docker push "${IMAGE_NAME}:latest"
fi

if [ -n "${SECRET_ENV:-}" ] && [ -f "${SECRET_ENV}" ]; then
  CLEAN_ENV="/tmp/career-hub.clean.env"
  sed -E 's/=(["'\''"])(.*)\1$/=\2/' "${SECRET_ENV}" > "${CLEAN_ENV}" || cp "${SECRET_ENV}" "${CLEAN_ENV}"

  docker stop career-hub-app >/dev/null 2>&1 || true
  docker rm career-hub-app >/dev/null 2>&1 || true
  docker run -d \
    --name career-hub-app \
    --restart unless-stopped \
    -p 3000:3000 \
    -e AUTH_TRUST_HOST=true \
    -e HOSTNAME="0.0.0.0" \
    --env-file "${CLEAN_ENV}" \
    "${IMAGE_NAME}:latest"
fi

docker image prune -f --filter "dangling=true" || true
