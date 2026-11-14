def call(String imageName, String imageTag = 'latest', String context = '.') {
    sh """#!/bin/bash
        set -euo pipefail
        echo "Building Docker image: ${imageName}:${imageTag} from context: ${context}"
        docker build \\
            --tag "${imageName}:${imageTag}" \\
            --tag "${imageName}:latest" \\
            "${context}"
    """
}

return this
