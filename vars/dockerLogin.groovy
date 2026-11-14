def call(String user, String pass, String registry = '') {
    sh """#!/bin/bash
        set -euo pipefail

        REGISTRY_TARGET="${registry}"
        CHECK_HOST="\${REGISTRY_TARGET:-docker.io}"

        if [ -f "\$HOME/.docker/config.json" ] && grep -q "\${CHECK_HOST}" "\$HOME/.docker/config.json" 2>/dev/null; then
            echo "Already authenticated to Docker registry (\${CHECK_HOST}) on this agent."
        elif [ -n "\${DOCKER_USER:-}" ] && [ -n "\${DOCKER_PASS:-}" ]; then
            echo "Authenticating with Docker registry (\${CHECK_HOST}) as \${DOCKER_USER}..."
            if [ -n "\${REGISTRY_TARGET}" ]; then
                echo "\$DOCKER_PASS" | docker login -u "\$DOCKER_USER" --password-stdin "\${REGISTRY_TARGET}"
            else
                echo "\$DOCKER_PASS" | docker login -u "\$DOCKER_USER" --password-stdin
            fi
        else
            echo "Error: Neither active Docker login nor DOCKER_USER/DOCKER_PASS credentials found."
            exit 1
        fi
    """
}

return this
