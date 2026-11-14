# Career Hub — Docker Containerization & Jenkins Reference

This document provides operational instructions for building, running, and deploying Career Hub with Docker and Jenkins CI/CD across Freestyle and Pipeline job architectures.

---

## 1. Local Docker Commands

### Build Image

```bash
docker build -t career-hub:latest .
```

### Run Container with .env

```bash
docker run -d \
  --name career-hub-app \
  --restart unless-stopped \
  -p 3000:3000 \
  -e AUTH_TRUST_HOST=true \
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
- Credentials: `gitHub` (GitHub Personal Access Token)
- Branch: `*/main` (or `*/dev`)

### Step 2: Build Triggers

- Check: **GitHub hook trigger for GITScm polling**

### Step 3: Build Environment

Check **Use secret text(s) or file(s)** and add:

1. **Username and password (separated)**:
   - Username Variable: `DOCKER_USER`
   - Password Variable: `DOCKER_PASS`
   - Credentials: `dockerHub`
2. **Secret file**:
   - Variable: `SECRET_ENV`
   - Credentials: `careerHub`

### Step 4: Build Steps (Execute Shell)

Execute the repository script directly:

```bash
bash scripts/jenkins-freestyle.sh
```

---

## 3. Jenkins Pipeline Job Setup (Modular Shared Library Architecture)

The pipeline is structured using modular Groovy utility steps under the standard [`vars/`](vars) directory:

```text
career-hub/
├── vars/
│   ├── dockerBuild.groovy    # Multi-stage image build with BuildKit
│   ├── dockerLogin.groovy    # Pre-auth session check and safe login
│   ├── dockerPush.groovy     # Pushes versioned and latest tags
│   ├── prepareEnv.groovy     # Strips quotes from .env and sets chmod 600
│   ├── deployApp.groovy      # Replaces running container with host trust
│   └── dockerPrune.groovy    # Prunes dangling layers
├── Jenkinsfile               # Declarative pipeline targeting career-hub-pipeline
└── ...
```

### Pipeline Overview ([`Jenkinsfile`](Jenkinsfile))

```groovy
pipeline {
    agent { label 'career-hub-pipeline' }

    environment {
        IMAGE_NAME = 'navneetguptacse/career-hub'
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    load("${WORKSPACE}/vars/dockerBuild.groovy").call(IMAGE_NAME, IMAGE_TAG)
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerHub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    script {
                        load("${WORKSPACE}/vars/dockerLogin.groovy").call()
                        load("${WORKSPACE}/vars/dockerPush.groovy").call(IMAGE_NAME, IMAGE_TAG)
                    }
                }
            }
        }

        stage('Deploy Container') {
            steps {
                withCredentials([file(credentialsId: 'careerHub', variable: 'SECRET_ENV')]) {
                    script {
                        load("${WORKSPACE}/vars/prepareEnv.groovy").call()
                        load("${WORKSPACE}/vars/deployApp.groovy").call(IMAGE_NAME)
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                load("${WORKSPACE}/vars/dockerPrune.groovy").call()
            }
        }
    }
}
```

---

## 4. Key Security & Operational Safeguards

### 4.1 Docker Login Session Verification (`vars/dockerLogin.groovy`)

Before executing `docker login`, the step inspects existing daemon credentials in `$HOME/.docker/config.json`. If an active session is detected, re-login is skipped to avoid redundant authentication. When authentication is needed, credentials bound by `withCredentials` are read directly as environment variables (`$DOCKER_USER`, `$DOCKER_PASS`) within a single-quoted shell block (`'''...'''`). This completely avoids Groovy string interpolation warnings (`withEnv: [DOCKER_PASS]`) and prevents Jenkins from masking secrets with asterisks.

### 4.2 Environment Variable Quote Stripping (`vars/prepareEnv.groovy`)

Docker's `--env-file` flag preserves literal quotation marks (`NEXTAUTH_URL="http://..."` becomes `\"http://...\"`), which causes Node.js URL parsing errors (`ERR_INVALID_URL`). The pipeline automatically cleans surrounding quotes into `/tmp/career-hub.clean.env` before running the container.

### 4.3 Host Header Trust

The container is launched with `-e AUTH_TRUST_HOST=true` and `-e HOSTNAME="0.0.0.0"` so that public EC2 IP addresses and custom domains are accepted without `UntrustedHost` exceptions.
