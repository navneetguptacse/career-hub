# Career Hub — Docker Containerization & Jenkins Reference

## 1. Local Docker Commands

### Build Image

```bash
docker build -t career-hub:latest .
```

### Run Container with .env

```bash
docker run -d \
  --name career-hub-app \
  -p 3000:3000 \
  --env-file .env \
  career-hub:latest
```

### Docker Compose

```bash
docker compose up -d --build
docker compose logs -f career-hub
docker compose down
```

---

## 2. Jenkins Freestyle Job Setup

### Step 1: Source Code Management

- Select **Git**
- Repository URL: `https://github.com/navneetguptacse/career-hub.git`
- Credentials: `gitHub`
- Branch: `*/main`

### Step 2: Build Environment

Check **Use secret text(s) or file(s)** and add:

1. **Username and password (separated)**:
   - Username Variable: `DOCKER_USER`
   - Password Variable: `DOCKER_PASS`
   - Credentials: `dockerHub`
2. **Secret file**:
   - Variable: `SECRET_ENV`
   - Credentials: `careerHub`

### Step 3: Build Steps (Execute Shell)

```bash
set -euo pipefail

IMAGE_NAME="navneetguptacse/career-hub"
IMAGE_TAG="${BUILD_NUMBER:-latest}"

docker build \
  --tag "${IMAGE_NAME}:${IMAGE_TAG}" \
  --tag "${IMAGE_NAME}:latest" \
  .

echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
docker push "${IMAGE_NAME}:${IMAGE_TAG}"
docker push "${IMAGE_NAME}:latest"

docker stop career-hub-app || true
docker rm career-hub-app || true

docker run -d \
  --name career-hub-app \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file "${SECRET_ENV}" \
  "${IMAGE_NAME}:latest"

docker image prune -f --filter "dangling=true" || true
```

---

## 3. Jenkins Pipeline Job Setup

Create a Pipeline project pointing to the repository's `Jenkinsfile`.

The `Jenkinsfile` utilizes:

- `dockerHub`: for Docker Hub authentication and image push
- `careerHub`: for production `.env` injection during deployment
