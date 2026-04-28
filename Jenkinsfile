pipeline {
    agent any

    environment {
        DOCKER_HUB = credentials('dockerhub-username')
        IMAGE_TAG = "v${BUILD_NUMBER}"
    }

    stages {

        stage('Install Dependencies') {
            steps {
                sh 'cd frontend && npm install && cd ../backend && npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'cd frontend && CI=true npm test && cd ../backend && npm test'
            }
        }

        stage('Build Applications') {
            steps {
                sh 'cd frontend && npm run build && cd ../backend && npm run build'
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Frontend Image') {
                    steps {
                        sh 'docker build -t $DOCKER_HUB/frontend:$IMAGE_TAG -f frontend/Dockerfile ./frontend'
                    }
                }
                stage('Backend Image') {
                    steps {
                        sh 'docker build -t $DOCKER_HUB/backend:$IMAGE_TAG -f backend/Dockerfile ./backend'
                    }
                }
            }
        }

        stage('Deploy Containers') {
            steps {
                sh 'docker-compose down && docker-compose up -d'
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push $DOCKER_HUB/frontend:$IMAGE_TAG
                    docker push $DOCKER_HUB/backend:$IMAGE_TAG
                    '''
                }
            }
        }
    }
}
