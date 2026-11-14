def call() {
    sh '''#!/bin/bash
        set -euo pipefail
        CLEAN_ENV="/tmp/career-hub.clean.env"
        sed -E 's/=(["\'"])(.*)\1$/=\2/' "$SECRET_ENV" > "$CLEAN_ENV" || cp "$SECRET_ENV" "$CLEAN_ENV"
    '''
}

return this
