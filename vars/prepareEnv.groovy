def call(String targetEnv = '/tmp/career-hub.clean.env') {
    sh """#!/bin/bash
        set -euo pipefail
        if [ -z "\${SECRET_ENV:-}" ] || [ ! -f "\${SECRET_ENV}" ]; then
            echo "Warning: SECRET_ENV is empty or not found. Skipping env preparation."
            exit 0
        fi

        echo "Sanitizing environment file to ${targetEnv}..."
        sed -E 's/="([^"]*)"\$/=\\1/' "\${SECRET_ENV}" | sed -E "s/='([^']*)'\$/=\\1/" > "${targetEnv}" || cp "\${SECRET_ENV}" "${targetEnv}"
        chmod 600 "${targetEnv}"
        echo "Environment file successfully prepared at ${targetEnv}."
    """
}

return this
