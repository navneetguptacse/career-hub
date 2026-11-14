def call() {
    sh '''#!/bin/bash
        echo "Pruning dangling Docker build layers to maintain agent disk space..."
        docker image prune -f --filter "dangling=true" || true
    '''
}

return this
