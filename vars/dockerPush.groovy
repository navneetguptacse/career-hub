def call(String imageName, String imageTag = 'latest') {
    sh """#!/bin/bash
        set -euo pipefail
        echo "Pushing ${imageName}:${imageTag} to Docker registry..."
        docker push "${imageName}:${imageTag}"

        if [ "${imageTag}" != "latest" ]; then
            echo "Pushing ${imageName}:latest to Docker registry..."
            docker push "${imageName}:latest"
        fi
    """
}

return this
