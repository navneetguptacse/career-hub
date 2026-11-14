def call(String filter = 'dangling=true') {
    sh """#!/bin/bash
        echo "Pruning Docker images with filter: ${filter}..."
        docker image prune -f --filter "${filter}" || true
    """
}

return this
