def call(String sourceEnv, String targetEnv) {
    sh """#!/bin/bash
        set -euo pipefail
        echo "Sanitizing environment file to ${targetEnv}..."
        sed -E 's/="([^"]*)"\$/=\\1/' "${sourceEnv}" | sed -E "s/='([^']*)'\$/=\\1/" > "${targetEnv}" || cp "${sourceEnv}" "${targetEnv}"
        chmod 600 "${targetEnv}"
        echo "Environment file prepared at ${targetEnv}."
    """
}

return this
