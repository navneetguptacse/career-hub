def call(String image, String containerName, String portMapping, String envFile = '', String extraArgs = '') {
    sh """#!/bin/bash
        set -euo pipefail
        echo "Stopping and replacing container: ${containerName}..."
        docker stop "${containerName}" >/dev/null 2>&1 || true
        docker rm "${containerName}" >/dev/null 2>&1 || true

        ENV_FLAG=""
        if [ -n "${envFile}" ] && [ -f "${envFile}" ]; then
            ENV_FLAG="--env-file ${envFile}"
        fi

        EXTRA_FLAG=""
        if [ -n "${extraArgs}" ]; then
            EXTRA_FLAG="${extraArgs}"
        fi

        echo "Starting container ${containerName} with image ${image}:latest on port ${portMapping}..."
        docker run -d \\
            --name "${containerName}" \\
            --restart unless-stopped \\
            -p "${portMapping}" \\
            \${EXTRA_FLAG} \\
            \${ENV_FLAG} \\
            "${image}:latest"

        echo "Container ${containerName} deployed successfully."
    """
}

return this
