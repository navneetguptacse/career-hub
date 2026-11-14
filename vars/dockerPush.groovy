def call(String imageName, String imageTag = 'latest') {
    sh """#!/bin/bash
        set -euo pipefail
        echo "Pushing ${imageName}:${imageTag} to Docker Hub..."
        docker push "${imageName}:${imageTag}"

        if [ "${imageTag}" != "latest" ]; then
            echo "Pushing ${imageName}:latest to Docker Hub..."
            docker push "${imageName}:latest"
        fi
    """
}

return this
