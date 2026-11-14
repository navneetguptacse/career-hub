def call() {
    executeLogin()
}

def call(String credentialsId) {
    if (credentialsId) {
        withCredentials([usernamePassword(
            credentialsId: credentialsId,
            usernameVariable: 'DOCKER_USER',
            passwordVariable: 'DOCKER_PASS'
        )]) {
            executeLogin()
        }
    } else {
        executeLogin()
    }
}

def call(String user, String pass) {
    echo "Using environment credentials for Docker Hub authentication."
    executeLogin()
}

def executeLogin() {
    sh '''#!/bin/bash
        set -euo pipefail

        if [ -f "$HOME/.docker/config.json" ] && grep -q "docker.io" "$HOME/.docker/config.json" 2>/dev/null; then
            echo "Docker is already logged in to Docker Hub. Proceeding..."
        elif [ -n "${DOCKER_USER:-}" ] && docker info 2>/dev/null | grep -qi "Username: ${DOCKER_USER}"; then
            echo "Docker is already logged in as ${DOCKER_USER}. Proceeding..."
        elif [ -n "${DOCKER_USER:-}" ] && [ -n "${DOCKER_PASS:-}" ]; then
            echo "Authenticating with Docker Hub as ${DOCKER_USER}..."
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
        else
            echo "Error: Neither active Docker login nor DOCKER_USER/DOCKER_PASS credentials found."
            exit 1
        fi
    '''
}

return this
