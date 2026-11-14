def call(String image, String containerName = 'career-hub-app', String port = '3000:3000', String envFile = '/tmp/career-hub.clean.env') {
    sh """#!/bin/bash
        set -euo pipefail
        echo "Stopping and replacing container ${containerName}..."
        docker stop "${containerName}" >/dev/null 2>&1 || true
        docker rm "${containerName}" >/dev/null 2>&1 || true

        ENV_FLAG=""
        if [ -f "${envFile}" ]; then
            ENV_FLAG="--env-file ${envFile}"
        fi

        echo "Starting ${containerName} from ${image}:latest on port ${port}..."
        docker run -d \\
            --name "${containerName}" \\
            --restart unless-stopped \\
            -p "${port}" \\
            -e AUTH_TRUST_HOST=true \\
            -e HOSTNAME="0.0.0.0" \\
            \${ENV_FLAG} \\
            "${image}:latest"

        echo "Container ${containerName} deployed successfully."
    """
}

return this
