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
                script {
                    load("${WORKSPACE}/vars/dockerBuild.groovy").call(IMAGE_NAME, IMAGE_TAG)
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerHub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    script {
                        load("${WORKSPACE}/vars/dockerLogin.groovy").call(DOCKER_USER, DOCKER_PASS)
                        load("${WORKSPACE}/vars/dockerPush.groovy").call(IMAGE_NAME, IMAGE_TAG)
                    }
                }
            }
        }

        stage('Deploy Container') {
            steps {
                withCredentials([file(credentialsId: 'careerHub', variable: 'SECRET_ENV')]) {
                    script {
                        load("${WORKSPACE}/vars/prepareEnv.groovy").call(SECRET_ENV, CLEAN_ENV_FILE)
                        load("${WORKSPACE}/vars/deployApp.groovy").call(IMAGE_NAME, CONTAINER_NAME, APP_PORT, CLEAN_ENV_FILE)
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                load("${WORKSPACE}/vars/dockerPrune.groovy").call()
            }
        }
    }
}
