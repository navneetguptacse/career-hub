def call() {
    sh '''#!/bin/bash
        docker image prune -f --filter "dangling=true" || true
    '''
}

return this
