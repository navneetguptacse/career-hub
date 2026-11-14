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
                        load("${WORKSPACE}/vars/dockerLogin.groovy").call()
                    }
                    sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker push ${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Deploy Container') {
            steps {
                withCredentials([file(credentialsId: 'careerHub', variable: 'SECRET_ENV')]) {
                    script {
                        load("${WORKSPACE}/vars/prepareEnv.groovy").call()
                        load("${WORKSPACE}/vars/deployApp.groovy").call(IMAGE_NAME)
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
