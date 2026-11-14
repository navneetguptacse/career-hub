pipeline {
    agent { label 'career-hub-pipeline' }

    environment {
        IMAGE_NAME = 'navneetguptacse/career-hub'
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''#!/bin/bash
                    set -euo pipefail
                    docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" -t "${IMAGE_NAME}:latest" .
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerHub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''#!/bin/bash
                        set -euo pipefail
                        printf '%s\n' "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push "${IMAGE_NAME}:${IMAGE_TAG}"
                        docker push "${IMAGE_NAME}:latest"
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([file(credentialsId: 'careerHub', variable: 'SECRET_ENV')]) {
                    sh '''#!/bin/bash
                        set -euo pipefail
                        CLEAN_ENV="/tmp/career-hub.clean.env"
                        sed -E 's/=(["'\''"])(.*)\1$/=\2/' "$SECRET_ENV" > "$CLEAN_ENV" || cp "$SECRET_ENV" "$CLEAN_ENV"

                        docker stop career-hub-app >/dev/null 2>&1 || true
                        docker rm career-hub-app >/dev/null 2>&1 || true

                        docker run -d \
                          --name career-hub-app \
                          --restart unless-stopped \
                          -p 3000:3000 \
                          -e AUTH_TRUST_HOST=true \
                          -e HOSTNAME="0.0.0.0" \
                          --env-file "$CLEAN_ENV" \
                          "${IMAGE_NAME}:latest"
                    '''
                }
            }
        }
    }

    post {
        always {
            sh '''#!/bin/bash
                docker image prune -f --filter "dangling=true" || true
            '''
        }
    }
}
