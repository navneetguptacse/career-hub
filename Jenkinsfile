pipeline {
    agent {label 'career-hub-pipeline'}

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
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerHub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                    sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker push ${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([file(credentialsId: 'careerHub', variable: 'SECRET_ENV')]) {
                    sh '''
                        docker stop career-hub-app >/dev/null 2>&1 || true
                        docker rm career-hub-app >/dev/null 2>&1 || true
                        docker run -d \
                          --name career-hub-app \
                          --restart unless-stopped \
                          -p 3000:3000 \
                          -e AUTH_TRUST_HOST=true \
                          -e HOSTNAME="0.0.0.0" \
                          --env-file "$SECRET_ENV" \
                          ${IMAGE_NAME}:latest
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f --filter "dangling=true" || true'
        }
    }
}
