def call(String imageName, String imageTag = 'latest') {
    sh """#!/bin/bash
        set -euo pipefail
        export DOCKER_BUILDKIT=1
        echo "Building production Docker image: ${imageName}:${imageTag}"
        docker build \\
            --tag "${imageName}:${imageTag}" \\
            --tag "${imageName}:latest" \\
            .
    """
}

return this
