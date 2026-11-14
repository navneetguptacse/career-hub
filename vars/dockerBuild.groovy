def call(String imageName, String imageTag) {
    sh """#!/bin/bash
        set -euo pipefail
        echo "Building production Docker image: ${imageName}:${imageTag}"
        docker build \\
            --tag "${imageName}:${imageTag}" \\
            --tag "${imageName}:latest" \\
            .
    """
}

return this
