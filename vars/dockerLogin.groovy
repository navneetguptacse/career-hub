def call(String user, String pass) {
    withEnv(["LOGIN_USER=${user}", "LOGIN_PASS=${pass}"]) {
        sh '''#!/bin/bash
            set -euo pipefail

            if [ -f "$HOME/.docker/config.json" ] && grep -q "docker.io" "$HOME/.docker/config.json" 2>/dev/null; then
                echo "Docker is already logged in to Docker Hub. Proceeding..."
            elif docker info 2>/dev/null | grep -qi "Username: ${LOGIN_USER}"; then
                echo "Docker is already logged in as ${LOGIN_USER}. Proceeding..."
            else
                echo "Not logged in. Authenticating with Docker Hub as ${LOGIN_USER}..."
                echo "$LOGIN_PASS" | docker login -u "$LOGIN_USER" --password-stdin
            fi
        '''
    }
}

return this
