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
│   ├── checkSkip.groovy      # Skip CI commit inspection: call(pattern)
│   ├── dockerBuild.groovy    # Generic Docker build: call(imageName, tag, context)
│   ├── dockerLogin.groovy    # Generic Docker login: call(user, pass, registry)
│   ├── dockerPush.groovy     # Generic Docker push: call(imageName, tag)
│   ├── prepareEnv.groovy     # Generic .env quote stripping: call(srcEnv, targetEnv)
│   ├── deployApp.groovy      # Generic container deployment: call(image, name, port, envFile)
│   └── dockerPrune.groovy    # Generic dangling image cleanup: call(filter)
├── Jenkinsfile               # Declarative pipeline with decoupled project configuration
└── ...
```

### Pipeline Overview ([`Jenkinsfile`](Jenkinsfile))

```groovy
@Library('Shared') _

pipeline {
    agent { label 'career-hub-pipeline' }

    environment {
        IMAGE_NAME     = 'navneetguptacse/career-hub'
        IMAGE_TAG      = "${env.BUILD_NUMBER}"
        CONTAINER_NAME = 'career-hub-app'
        APP_PORT       = '3000:3000'
        CLEAN_ENV_FILE = '/tmp/career-hub.clean.env'
        SKIP_BUILD     = 'false'
    }

    stages {
        stage('Checkout & Skip Check') {
            steps {
                checkout scm
                checkSkip()
            }
        }

        stage('Build Docker Image') {
            when { expression { env.SKIP_BUILD != 'true' } }
            steps {
                dockerBuild(IMAGE_NAME, IMAGE_TAG)
            }
        }

        stage('Push to Docker Hub') {
            when { expression { env.SKIP_BUILD != 'true' } }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerHub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    dockerLogin(DOCKER_USER, DOCKER_PASS)
                    dockerPush(IMAGE_NAME, IMAGE_TAG)
                }
            }
        }

        stage('Deploy Container') {
            when { expression { env.SKIP_BUILD != 'true' } }
            steps {
                withCredentials([file(credentialsId: 'careerHub', variable: 'SECRET_ENV')]) {
                    prepareEnv(SECRET_ENV, CLEAN_ENV_FILE)
                    deployApp(IMAGE_NAME, CONTAINER_NAME, APP_PORT, CLEAN_ENV_FILE, '-e AUTH_TRUST_HOST=true -e HOSTNAME=0.0.0.0')
                }
            }
        }
    }

    post {
        always {
            script {
                if (env.SKIP_BUILD != 'true') {
                    dockerPrune()
                }
            }
        }
    }
}
```

### 3.1 Using as a Jenkins Global Trusted Pipeline Library

Because all steps under `vars/` are completely generic and parameterized, you can register this repository under **Manage Jenkins > System > Global Pipeline Libraries** (named `Shared`).

Any other application pipeline on your Jenkins instance can then use these steps natively:

```groovy
@Library('Shared') _

pipeline {
    agent any

    environment {
        IMAGE_NAME     = 'myorg/payment-service'
        IMAGE_TAG      = "${env.BUILD_NUMBER}"
        CONTAINER_NAME = 'payment-service-app'
        APP_PORT       = '8080:8080'
    }

    stages {
        stage('Build') {
            steps {
                dockerBuild(IMAGE_NAME, IMAGE_TAG)
            }
        }

        stage('Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerHub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    dockerLogin(DOCKER_USER, DOCKER_PASS)
                    dockerPush(IMAGE_NAME, IMAGE_TAG)
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([file(credentialsId: 'paymentEnv', variable: 'SECRET_ENV')]) {
                    prepareEnv(SECRET_ENV, '/tmp/payment.env')
                    deployApp(IMAGE_NAME, CONTAINER_NAME, APP_PORT, '/tmp/payment.env')
                }
            }
        }
    }

    post {
        always {
            dockerPrune()
        }
    }
}
```

---

## 4. Key Security & Operational Safeguards

### 4.1 Docker Login Session Verification (`vars/dockerLogin.groovy`)

Before executing `docker login`, the step inspects existing daemon credentials in `$HOME/.docker/config.json`. If an active session is detected, re-login is skipped to avoid redundant authentication. When authentication is needed, credentials bound by `withCredentials` are read directly as environment variables (`$DOCKER_USER`, `$DOCKER_PASS`) within a single-quoted shell block (`'''...'''`). This completely avoids Groovy string interpolation warnings (`withEnv: [DOCKER_PASS]`) and prevents Jenkins from masking secrets with asterisks.

### 4.2 Environment Variable Quote Stripping (`vars/prepareEnv.groovy`)

Docker's `--env-file` flag preserves literal quotation marks (`NEXTAUTH_URL="http://..."` becomes `\"http://...\"`), which causes Node.js URL parsing errors (`ERR_INVALID_URL`). The pipeline automatically cleans surrounding quotes into `/tmp/career-hub.clean.env` and applies `chmod 600` before running the container.

### 4.3 Host Header Trust

The container is launched with `-e AUTH_TRUST_HOST=true` and `-e HOSTNAME="0.0.0.0"` so that public EC2 IP addresses and custom domains are accepted without `UntrustedHost` exceptions.

---

## 5. Skipping Builds via Commit Message (`[skip ci]`)

To prevent documentation, style, or minor commits from triggering unnecessary Docker image builds and deployments:

### Jenkins Controller Configuration (Recommended)

1. Open your job (`career-hub-pipeline` or Freestyle).
2. Click **Configure**.
3. Under **Pipeline > SCM (Git)** (or **Source Code Management > Git** for Freestyle):
   - Under **Additional Behaviours**, click **Add**.
   - Select **Polling ignores commits with certain messages**.
   - In the **Excluded Messages** field, enter:
     ```regex
     .*\[(skip ci|ci skip|skip jenkins|no ci)\].*
     ```
4. Click **Save**.

When you push a commit with `[skip ci]` or `[ci skip]` in the message:

```bash
git commit -m "docs: update guide [skip ci]"
```

Jenkins intercepts the webhook, evaluates the regex, and discards the build immediately without waking up the build agent.

---

## 6. Database Operations (Prisma & Neon PostgreSQL)

When working with a clean or newly restored database, use these scripts to manage the schema:

```bash
# Push schema to database and create/sync all tables
npm run db:push

# Re-generate Prisma Client types
npm run db:generate

# Launch Prisma Studio web GUI on http://localhost:5555
npm run db:studio
```
