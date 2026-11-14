@Library('Shared') _

pipeline {
    agent { label 'career-hub-pipeline' }

    environment {
        IMAGE_NAME     = 'navneetguptacse/career-hub'
        IMAGE_TAG      = "${env.BUILD_NUMBER}"
        CONTAINER_NAME = 'career-hub-app'
        APP_PORT       = '3000:3000'
        CLEAN_ENV_FILE = '/tmp/career-hub.clean.env'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                dockerBuild(IMAGE_NAME, IMAGE_TAG)
            }
        }

        stage('Push to Docker Hub') {
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
            dockerPrune()
        }
    }
}
