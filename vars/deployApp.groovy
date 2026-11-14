def call(String image) {
    sh """#!/bin/bash
        set -euo pipefail
        docker stop career-hub-app >/dev/null 2>&1 || true
        docker rm career-hub-app >/dev/null 2>&1 || true
        docker run -d \\
            --name career-hub-app \\
            --restart unless-stopped \\
            -p 3000:3000 \\
            -e AUTH_TRUST_HOST=true \\
            -e HOSTNAME="0.0.0.0" \\
            --env-file "/tmp/career-hub.clean.env" \\
            "${image}:latest"
    """
}

return this
