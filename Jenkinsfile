pipeline {
    agent any

    options {
        // Don't checkout twice, we do it manually in the first stage
        skipDefaultCheckout()
    }

    environment {
        DOCKERHUB_USER = 'abhimanyu8829'
        IMAGE_NAME     = 'todolist-app'
        CONTAINER_NAME = 'todolist-app'
    }

    // Optional: Jenkins will also check every 5 mins for changes
    // GitHub webhook will still trigger builds immediately
    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out source code from Git..."
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image..."
                sh """
                  docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:${BUILD_NUMBER} .
                """
            }
        }

        stage('Run Tests') {
            steps {
                echo "Running tests inside container..."
                sh """
                  docker run --rm ${DOCKERHUB_USER}/${IMAGE_NAME}:${BUILD_NUMBER} npm test
                """
            }
        }

        stage('Login to Docker Hub') {
            steps {
                echo "Logging in to Docker Hub..."
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',   // ID you created in Jenkins
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                      echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push Image') {
            steps {
                echo "Tagging and pushing image to Docker Hub..."
                sh """
                  docker tag ${DOCKERHUB_USER}/${IMAGE_NAME}:${BUILD_NUMBER} ${DOCKERHUB_USER}/${IMAGE_NAME}:latest
                  docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:${BUILD_NUMBER}
                  docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:latest
                """
            }
        }

        stage('Deploy to Server') {
            steps {
                echo "Deploying container on server (port 80 -> 3000)..."
                sh """
                  docker rm -f ${CONTAINER_NAME} || true
                  docker run -d --name ${CONTAINER_NAME} -p 80:3000 ${DOCKERHUB_USER}/${IMAGE_NAME}:latest
                """
            }
        }
    }

    post {
        always {
            echo "Cleaning workspace..."
            cleanWs()
        }
    }
}
