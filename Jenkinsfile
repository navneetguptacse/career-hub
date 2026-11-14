@Library('Shared') _

pipeline {
    agent { label 'career-hub-pipeline' }

    environment {
        IMAGE_NAME     = 'navneetguptacse/career-hub'
        IMAGE_TAG      = "${env.BUILD_NUMBER}"
        CONTAINER_NAME = 'career-hub-app'
        APP_PORT       = '3000:3000'
        CLEAN_ENV_FILE = '/tmp/career-hub.clean.env'
        SKIP_BUILD     = 'false'
    }

    stages {
        stage('Checkout & Skip Check') {
            steps {
                checkout scm
                checkSkip()
            }
        }

        stage('Build Docker Image') {
            when { expression { env.SKIP_BUILD != 'true' } }
            steps {
                dockerBuild(IMAGE_NAME, IMAGE_TAG)
            }
        }

        stage('Push to Docker Hub') {
            when { expression { env.SKIP_BUILD != 'true' } }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerHub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    dockerLogin(DOCKER_USER, DOCKER_PASS)
                    dockerPush(IMAGE_NAME, IMAGE_TAG)
                }
            }
        }

        stage('Deploy Container') {
            when { expression { env.SKIP_BUILD != 'true' } }
            steps {
                withCredentials([file(credentialsId: 'careerHub', variable: 'SECRET_ENV')]) {
                    prepareEnv(SECRET_ENV, CLEAN_ENV_FILE)
                    deployApp(IMAGE_NAME, CONTAINER_NAME, APP_PORT, CLEAN_ENV_FILE, '-e AUTH_TRUST_HOST=true -e HOSTNAME=0.0.0.0')
                }
            }
        }
    }

    post {
        always {
            script {
                if (env.SKIP_BUILD != 'true') {
                    dockerPrune()
                }
            }
        }
    }
}
