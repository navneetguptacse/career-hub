#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="navneetguptacse/career-hub"
IMAGE_TAG="${BUILD_NUMBER:-latest}"

# Resilient credential variable resolution across various Jenkins binding styles
DOCKER_USER="${DOCKER_USER:-${DOCKER_HUB_USR:-${DOCKER_CREDS_USR:-}}}"
DOCKER_PASS="${DOCKER_PASS:-${DOCKER_HUB_PSW:-${DOCKER_CREDS_PSW:-}}}"
SECRET_ENV="${SECRET_ENV:-${ENV_FILE:-}}"

export DOCKER_BUILDKIT=1

echo "Building production Docker image: ${IMAGE_NAME}:${IMAGE_TAG}..."
docker build \
  --tag "${IMAGE_NAME}:${IMAGE_TAG}" \
  --tag "${IMAGE_NAME}:latest" \
  .

# Check if Docker is already logged in on this node
IS_LOGGED_IN=false
if [ -n "${DOCKER_USER:-}" ] && docker info 2>/dev/null | grep -qi "Username: ${DOCKER_USER}"; then
  IS_LOGGED_IN=true
elif grep -qi "docker.io" "${HOME}/.docker/config.json" 2>/dev/null; then
  IS_LOGGED_IN=true
fi

if [ "${IS_LOGGED_IN}" = true ]; then
  echo "Already authenticated to Docker Hub on this agent."
elif [ -n "${DOCKER_USER:-}" ] && [ -n "${DOCKER_PASS:-}" ]; then
  CLEAN_USER=$(printf '%s' "${DOCKER_USER}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
  CLEAN_PASS=$(printf '%s' "${DOCKER_PASS}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
  echo "Authenticating with Docker Hub as ${CLEAN_USER}..."
  printf '%s\n' "${CLEAN_PASS}" | docker login -u "${CLEAN_USER}" --password-stdin
fi

echo "Pushing ${IMAGE_NAME}:${IMAGE_TAG} to Docker Hub..."
docker push "${IMAGE_NAME}:${IMAGE_TAG}"
docker push "${IMAGE_NAME}:latest"

if [ -n "${SECRET_ENV:-}" ] && [ -f "${SECRET_ENV}" ]; then
  CLEAN_ENV="/tmp/career-hub.clean.env"
  echo "Sanitizing environment file to ${CLEAN_ENV}..."
  sed -E 's/="([^"]*)"$/=\1/' "${SECRET_ENV}" | sed -E "s/='([^']*)'$/=\1/" > "${CLEAN_ENV}" || cp "${SECRET_ENV}" "${CLEAN_ENV}"
  chmod 600 "${CLEAN_ENV}"

  echo "Restarting application container career-hub-app..."
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

  echo "Container career-hub-app deployed successfully."
fi

echo "Pruning dangling Docker build layers..."
docker image prune -f --filter "dangling=true" || true
