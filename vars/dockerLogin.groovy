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
            CLEAN_USER=$(printf '%s' "$DOCKER_USER" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
            CLEAN_PASS=$(printf '%s' "$DOCKER_PASS" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

            echo "Authenticating with Docker Hub as ${CLEAN_USER}..."
            echo "Credential diagnostic:"
            echo "  - Username: ${CLEAN_USER} (${#CLEAN_USER} chars)"
            echo "  - Password length: ${#CLEAN_PASS} chars"

            if [[ "$CLEAN_PASS" =~ ^(ghp_|github_pat_) ]]; then
                echo "  [CONFIG ERROR] The password configured in Jenkins 'dockerHub' is a GITHUB token!"
                echo "  Docker Hub cannot authenticate with GitHub tokens."
                echo "  Please update 'dockerHub' in Jenkins with a Docker Hub PAT (dckr_pat_...) or account password."
                exit 1
            elif [[ "$CLEAN_PASS" =~ ^dckr_pat_ ]]; then
                echo "  - Token format: Docker Hub Personal Access Token (dckr_pat_...)"
            fi

            printf '%s\n' "$CLEAN_PASS" | docker login -u "$CLEAN_USER" --password-stdin
        else
            echo "Error: Neither active Docker login nor DOCKER_USER/DOCKER_PASS credentials found."
            exit 1
        fi
    '''
}

return this
