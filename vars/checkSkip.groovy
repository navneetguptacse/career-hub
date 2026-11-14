def call(String customPattern = '') {
    def pattern = customPattern ?: /(?i)\[(skip ci|ci skip|skip jenkins|no ci)\]/
    def commitMsg = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()

    if (commitMsg =~ pattern) {
        echo "Commit message contains skip token: ${commitMsg}"
        echo "Skipping build, push, and deploy stages."
        env.SKIP_BUILD = 'true'
        currentBuild.description = "Skipped: ${commitMsg}"
        return true
    }

    env.SKIP_BUILD = 'false'
    return false
}

return this
